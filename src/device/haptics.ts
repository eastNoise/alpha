import * as Haptics from 'expo-haptics';

import {
  playNativeHapticPattern,
  type AlphaHapticPattern,
} from '../../modules/alpha-haptics';

export type AlphaHaptic =
  | 'selection'
  | 'soft'
  | 'light'
  | 'medium'
  | 'rigid'
  | 'heavy'
  | AlphaHapticPattern;

type ImpactStep = {
  delayMs: number;
  style: Haptics.ImpactFeedbackStyle;
};

let activePattern = 0;

const wait = (delayMs: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, delayMs);
});

async function playImpactPattern(patternId: number, steps: ImpactStep[]) {
  for (const step of steps) {
    if (step.delayMs > 0) await wait(step.delayMs);
    if (patternId !== activePattern) return;
    await Haptics.impactAsync(step.style);
  }
}

async function playCustomPattern(
  patternId: number,
  type: AlphaHapticPattern,
) {
  if (await playNativeHapticPattern(type).catch(() => false)) return;

  if (type === 'progressUp') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Rigid },
      { delayMs: 50, style: Haptics.ImpactFeedbackStyle.Rigid },
      { delayMs: 55, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delayMs: 70, style: Haptics.ImpactFeedbackStyle.Heavy },
    ]);
    return;
  }
  if (type === 'progressDown') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delayMs: 85, style: Haptics.ImpactFeedbackStyle.Medium },
    ]);
    return;
  }
  if (type === 'progressComplete') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Soft },
      { delayMs: 90, style: Haptics.ImpactFeedbackStyle.Medium },
      { delayMs: 105, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delayMs: 155, style: Haptics.ImpactFeedbackStyle.Rigid },
    ]);
    return;
  }
  if (type === 'commit') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delayMs: 125, style: Haptics.ImpactFeedbackStyle.Rigid },
    ]);
    return;
  }
  if (type === 'confirm') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Medium },
      { delayMs: 70, style: Haptics.ImpactFeedbackStyle.Rigid },
    ]);
    return;
  }
  if (type === 'destructive') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Heavy },
    ]);
    return;
  }
  if (type === 'success') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Light },
      { delayMs: 55, style: Haptics.ImpactFeedbackStyle.Medium },
      { delayMs: 65, style: Haptics.ImpactFeedbackStyle.Rigid },
    ]);
    return;
  }
  if (type === 'warning') {
    await playImpactPattern(patternId, [
      { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delayMs: 140, style: Haptics.ImpactFeedbackStyle.Heavy },
    ]);
    return;
  }
  await playImpactPattern(patternId, [
    { delayMs: 0, style: Haptics.ImpactFeedbackStyle.Rigid },
    { delayMs: 55, style: Haptics.ImpactFeedbackStyle.Rigid },
    { delayMs: 55, style: Haptics.ImpactFeedbackStyle.Medium },
  ]);
}

function isCustomPattern(type: AlphaHaptic): type is AlphaHapticPattern {
  return type === 'commit'
    || type === 'confirm'
    || type === 'destructive'
    || type === 'error'
    || type === 'progressComplete'
    || type === 'progressDown'
    || type === 'progressUp'
    || type === 'success'
    || type === 'warning';
}

export function playHaptic(enabled: boolean, type: AlphaHaptic = 'selection') {
  if (!enabled) return;

  const patternId = ++activePattern;

  const run = async () => {
    if (isCustomPattern(type)) {
      await playCustomPattern(patternId, type);
      return;
    }
    if (type === 'light') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (type === 'soft') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    }
    if (type === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
    if (type === 'rigid') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      return;
    }
    if (type === 'heavy') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    await Haptics.selectionAsync();
  };

  run().catch(() => undefined);
}
