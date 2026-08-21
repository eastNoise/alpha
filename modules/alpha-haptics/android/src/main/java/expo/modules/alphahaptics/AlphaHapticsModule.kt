package expo.modules.alphahaptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlphaHapticsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val vibrator: Vibrator
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

  override fun definition() = ModuleDefinition {
    Name("AlphaHaptics")

    AsyncFunction("playPatternAsync") { pattern: String ->
      playPattern(pattern)
    }
  }

  private fun playPattern(name: String): Boolean {
    if (!vibrator.hasVibrator()) return false

    vibrator.cancel()
    if (name == "progressComplete") {
      return playWaveform(name)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && playComposition(name)) {
      return true
    }
    return playWaveform(name)
  }

  private fun playComposition(name: String): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return false

    val steps = when (name) {
      "progressUp" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.55f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.72f, 50),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.00f, 55),
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 1.00f, 65),
      )
      "progressDown" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 1.00f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.62f, 85),
      )
      "commit" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 0.90f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.00f, 125),
      )
      "confirm" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.68f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.00f, 70),
      )
      "destructive" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 1.00f, 0),
      )
      "success" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_TICK, 0.58f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.78f, 55),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.00f, 65),
      )
      "warning" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 0.88f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_THUD, 1.00f, 140),
      )
      "error" -> listOf(
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 1.00f, 0),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.86f, 55),
        Primitive(VibrationEffect.Composition.PRIMITIVE_CLICK, 0.72f, 55),
      )
      else -> return false
    }

    val primitiveIds = steps.map { it.id }.distinct().toIntArray()
    if (!vibrator.areAllPrimitivesSupported(*primitiveIds)) return false

    val composition = VibrationEffect.startComposition()
    steps.forEach { step ->
      composition.addPrimitive(step.id, step.scale, step.delayMs)
    }
    vibrator.vibrate(composition.compose())
    return true
  }

  private fun playWaveform(name: String): Boolean {
    val pattern = when (name) {
      "progressUp" -> Waveform(
        longArrayOf(0, 28, 22, 30, 25, 34, 35, 48, 20),
        intArrayOf(0, 150, 0, 185, 0, 225, 0, 255, 0),
      )
      "progressDown" -> Waveform(
        longArrayOf(0, 48, 45, 28, 20),
        intArrayOf(0, 255, 0, 170, 0),
      )
      "progressComplete" -> Waveform(
        longArrayOf(0, 90, 10, 105, 10, 120, 35, 55, 20),
        intArrayOf(0, 95, 0, 145, 0, 200, 0, 255, 0),
      )
      "commit" -> Waveform(
        longArrayOf(0, 120, 35, 50, 15),
        intArrayOf(0, 205, 0, 255, 0),
      )
      "confirm" -> Waveform(
        longArrayOf(0, 30, 50, 45, 15),
        intArrayOf(0, 165, 0, 255, 0),
      )
      "destructive" -> Waveform(
        longArrayOf(0, 120, 20),
        intArrayOf(0, 255, 0),
      )
      "success" -> Waveform(
        longArrayOf(0, 28, 38, 32, 42, 45, 15),
        intArrayOf(0, 145, 0, 195, 0, 255, 0),
      )
      "warning" -> Waveform(
        longArrayOf(0, 70, 70, 85, 15),
        intArrayOf(0, 220, 0, 255, 0),
      )
      "error" -> Waveform(
        longArrayOf(0, 35, 30, 32, 35, 30, 15),
        intArrayOf(0, 255, 0, 220, 0, 185, 0),
      )
      else -> return false
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val effect = if (vibrator.hasAmplitudeControl()) {
        VibrationEffect.createWaveform(pattern.timings, pattern.amplitudes, -1)
      } else {
        VibrationEffect.createWaveform(pattern.timings, -1)
      }
      vibrator.vibrate(effect)
    } else {
      @Suppress("DEPRECATION")
      vibrator.vibrate(pattern.timings, -1)
    }
    return true
  }

  private data class Primitive(val id: Int, val scale: Float, val delayMs: Int)
  private data class Waveform(val timings: LongArray, val amplitudes: IntArray)
}
