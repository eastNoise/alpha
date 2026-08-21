import CoreHaptics
import ExpoModulesCore

public class AlphaHapticsModule: Module {
  private var engine: CHHapticEngine?
  private var engineStarted = false
  private var activePlayer: CHHapticPatternPlayer?

  public func definition() -> ModuleDefinition {
    Name("AlphaHaptics")

    OnCreate {
      DispatchQueue.main.async {
        _ = self.prepareEngine()
      }
    }

    OnDestroy {
      DispatchQueue.main.async {
        try? self.activePlayer?.stop(atTime: CHHapticTimeImmediate)
        self.activePlayer = nil
        self.engine?.stop()
        self.engine = nil
        self.engineStarted = false
      }
    }

    AsyncFunction("playPatternAsync") { (pattern: String) -> Bool in
      self.play(pattern)
    }
    .runOnQueue(.main)
  }

  private func prepareEngine() -> Bool {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      return false
    }

    do {
      if engine == nil {
        let newEngine = try CHHapticEngine()
        newEngine.isAutoShutdownEnabled = false
        newEngine.stoppedHandler = { [weak self] _ in
          DispatchQueue.main.async {
            self?.engineStarted = false
          }
        }
        newEngine.resetHandler = { [weak self] in
          DispatchQueue.main.async {
            self?.engineStarted = false
            _ = self?.prepareEngine()
          }
        }
        engine = newEngine
      }

      if !engineStarted {
        try engine?.start()
        engineStarted = true
      }
      return true
    } catch {
      engineStarted = false
      return false
    }
  }

  private func play(_ name: String) -> Bool {
    guard prepareEngine(), let engine else {
      return false
    }

    let events: [CHHapticEvent]
    switch name {
    case "progressUp":
      events = [
        transient(at: 0.000, intensity: 0.72, sharpness: 0.78),
        transient(at: 0.050, intensity: 0.82, sharpness: 0.84),
        transient(at: 0.105, intensity: 0.94, sharpness: 0.92),
        transient(at: 0.175, intensity: 1.00, sharpness: 1.00),
      ]
    case "progressDown":
      events = [
        transient(at: 0.000, intensity: 1.00, sharpness: 0.82),
        transient(at: 0.085, intensity: 0.68, sharpness: 0.52),
      ]
    case "progressComplete":
      events = [
        continuous(at: 0.000, duration: 0.120, intensity: 0.42, sharpness: 0.02),
        continuous(at: 0.115, duration: 0.145, intensity: 0.64, sharpness: 0.06),
        continuous(at: 0.255, duration: 0.155, intensity: 0.88, sharpness: 0.12),
        transient(at: 0.455, intensity: 1.00, sharpness: 1.00),
      ]
    case "commit":
      events = [
        continuous(at: 0.000, duration: 0.135, intensity: 0.76, sharpness: 0.08),
        transient(at: 0.185, intensity: 1.00, sharpness: 0.86),
      ]
    case "confirm":
      events = [
        transient(at: 0.000, intensity: 0.62, sharpness: 0.70),
        transient(at: 0.085, intensity: 1.00, sharpness: 0.96),
      ]
    case "destructive":
      events = [
        continuous(at: 0.000, duration: 0.120, intensity: 0.92, sharpness: 0.02),
        transient(at: 0.105, intensity: 1.00, sharpness: 0.24),
      ]
    case "success":
      events = [
        transient(at: 0.000, intensity: 0.55, sharpness: 0.52),
        transient(at: 0.070, intensity: 0.78, sharpness: 0.72),
        transient(at: 0.150, intensity: 1.00, sharpness: 0.92),
      ]
    case "warning":
      events = [
        transient(at: 0.000, intensity: 0.90, sharpness: 0.22),
        transient(at: 0.140, intensity: 1.00, sharpness: 0.16),
      ]
    case "error":
      events = [
        transient(at: 0.000, intensity: 1.00, sharpness: 1.00),
        transient(at: 0.070, intensity: 0.88, sharpness: 0.90),
        transient(at: 0.150, intensity: 0.74, sharpness: 0.78),
      ]
    default:
      return false
    }

    do {
      try? activePlayer?.stop(atTime: CHHapticTimeImmediate)
      let pattern = try CHHapticPattern(events: events, parameters: [])
      let player = try engine.makePlayer(with: pattern)
      activePlayer = player
      try player.start(atTime: CHHapticTimeImmediate)
      return true
    } catch {
      return false
    }
  }

  private func transient(at time: TimeInterval, intensity: Float, sharpness: Float) -> CHHapticEvent {
    CHHapticEvent(
      eventType: .hapticTransient,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness),
      ],
      relativeTime: time
    )
  }

  private func continuous(
    at time: TimeInterval,
    duration: TimeInterval,
    intensity: Float,
    sharpness: Float
  ) -> CHHapticEvent {
    CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [
        CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
        CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness),
      ],
      relativeTime: time,
      duration: duration
    )
  }
}
