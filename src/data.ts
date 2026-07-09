import { AppState, Routine } from './types';

export const STORAGE_KEY = 'alpha:v19:prod-state';
export const STATE_SCHEMA_VERSION = 2;

export const categories = ['몸', '정신', '절제', '집중', '생활'] as const;
export const scopes = ['오늘만', '이번 과정 동안'] as const;

export const basicRoutines: Routine[] = [
  { id: 'water', name: '물 500ml', done: false, type: 'basic' },
  { id: 'bed', name: '침대 정리', done: false, type: 'basic' },
  { id: 'pushup', name: '푸쉬업 30개', done: false, type: 'basic' },
];

export const stageItems: Array<{
  number: string;
  title: string;
  period: string;
  state: 'done' | 'active' | 'locked';
}> = [
  { number: '01', title: '기초 통제', period: 'Day 1 - 7', state: 'active' },
  { number: '02', title: '몸 깨우기', period: 'Day 8 - 14', state: 'locked' },
  { number: '03', title: '기록 만들기', period: 'Day 15 - 21', state: 'locked' },
  { number: '04', title: '기준 적응', period: 'Day 22 - 30', state: 'locked' },
] as const;

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function displayDate(dateKey: string) {
  return dateKey.replace(/-/g, '.');
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dateForCourseDay(startedAt: string, day: number) {
  return toDateKey(addDays(new Date(`${startedAt}T00:00:00`), day - 1));
}

export function stageForDay(day: number) {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export function createInitialState(): AppState {
  const today = new Date();
  const startedAt = toDateKey(today);
  const todayKey = getTodayKey();

  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    hasOnboarded: false,
    currentCourse: {
      level: 'BASIC',
      day: 1,
      startedAt,
      currentStage: 1,
      progress: 0,
      next: {
        standardLocked: true,
        hardLocked: true,
      },
    },
    today: {
      date: todayKey,
      isClosed: false,
      hasReflection: false,
      result: null,
    },
    routinesByDate: {
      [todayKey]: basicRoutines,
    },
    records: [],
    settings: {
      phraseTone: 'basic',
      notificationsEnabled: true,
      hapticsEnabled: true,
    },
  };
}
