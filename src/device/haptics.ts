import * as Haptics from 'expo-haptics';

export type AlphaHaptic = 'selection' | 'light' | 'success' | 'warning' | 'error';

export function playHaptic(enabled: boolean, type: AlphaHaptic = 'selection') {
  if (!enabled) return;

  const run = async () => {
    if (type === 'light') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (type === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (type === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (type === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await Haptics.selectionAsync();
  };

  run().catch(() => undefined);
}
