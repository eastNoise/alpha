export type CourseLevel = 'BASIC' | 'STANDARD' | 'HARD';
export type SupportedLanguage = 'system' | 'ko' | 'en' | 'ja' | 'es' | 'de' | 'fr' | 'zh';
export type RoutineType = 'basic' | 'personal';
export type DayResult = 'complete' | 'incomplete';
export type ScreenName =
  | 'onboarding'
  | 'today'
  | 'records'
  | 'course'
  | 'settings'
  | 'detail'
  | 'collection';

export interface Routine {
  id: string;
  name: string;
  done: boolean;
  category?: '몸' | '정신' | '절제' | '집중' | '생활';
  type: RoutineType;
  scope?: 'today' | 'course';
}

export interface TodayState {
  date: string;
  isClosed: boolean;
  hasReflection: boolean;
  result: DayResult | null;
  closedAt?: string;
}

export interface CourseState {
  level: CourseLevel;
  day: number;
  startedAt: string;
  currentStage: number;
  progress: number;
  next: {
    standardLocked: boolean;
    hardLocked: boolean;
  };
}

export interface DayRecord {
  id: string;
  date: string;
  course: CourseLevel;
  day: number;
  stage: number;
  status: DayResult;
  completedRoutineIds: string[];
  missedRoutineIds: string[];
  reflection?: string;
  closedAt: string;
}

export interface SettingsState {
  phraseTone: 'basic' | 'hard' | 'cold';
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  language: SupportedLanguage;
}

export interface AppState {
  schemaVersion: number;
  hasOnboarded: boolean;
  currentCourse: CourseState;
  today: TodayState;
  courseRoutineTemplates: Routine[];
  routinesByDate: Record<string, Routine[]>;
  records: DayRecord[];
  settings: SettingsState;
}
