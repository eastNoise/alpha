import AlphaHapticsModule from './src/AlphaHapticsModule';

export type AlphaHapticPattern =
  | 'commit'
  | 'confirm'
  | 'destructive'
  | 'error'
  | 'progressComplete'
  | 'progressDown'
  | 'progressUp'
  | 'success'
  | 'warning';

export async function playNativeHapticPattern(pattern: AlphaHapticPattern) {
  if (!AlphaHapticsModule) return false;
  return AlphaHapticsModule.playPatternAsync(pattern);
}
