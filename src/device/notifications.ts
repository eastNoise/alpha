import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createI18n } from '../i18n';
import { SupportedLanguage } from '../types';

const DAILY_CLOSE_REMINDER_ID = 'alpha:daily-close-reminder';
const DAILY_CLOSE_REMINDER_STORAGE_KEY = 'alpha:v19:daily-close-reminder-id';
const REMINDER_HOUR = 21;
const REMINDER_MINUTE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ReminderSyncResult = 'disabled' | 'denied' | 'scheduled' | 'unavailable';

async function ensureNotificationPermission() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(channelName: string) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-close', {
    name: channelName,
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: '#FF1D1D',
  });
}

export async function cancelDailyCloseReminder() {
  const storedId = await AsyncStorage.getItem(DAILY_CLOSE_REMINDER_STORAGE_KEY);
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(DAILY_CLOSE_REMINDER_ID).catch(() => undefined),
    storedId ? Notifications.cancelScheduledNotificationAsync(storedId).catch(() => undefined) : Promise.resolve(),
  ]);
  await AsyncStorage.removeItem(DAILY_CLOSE_REMINDER_STORAGE_KEY);
}

export async function syncDailyCloseReminder(
  enabled: boolean,
  language: SupportedLanguage = 'system',
): Promise<ReminderSyncResult> {
  if (!enabled) {
    await cancelDailyCloseReminder();
    return 'disabled';
  }

  const granted = await ensureNotificationPermission();
  if (!granted) return 'denied';

  const i18n = createI18n(language);
  await ensureAndroidChannel(i18n.t('reminderChannel'));
  await cancelDailyCloseReminder();
  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: DAILY_CLOSE_REMINDER_ID,
    content: {
      title: 'ALPHA',
      body: i18n.t('reminderBody'),
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
      channelId: 'daily-close',
    },
  });
  await AsyncStorage.setItem(DAILY_CLOSE_REMINDER_STORAGE_KEY, identifier);
  return 'scheduled';
}
