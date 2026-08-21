import { courseRoutinesFor, createInitialState, dateForCourseDay } from '../data';
import { AppState, CourseLevel, Routine } from '../types';
import {
  applyRoutinePreferences,
  courseRoutinePreferencesFor,
  courseRoutineTemplates,
  courseStateFor,
  createRecordForDay,
  courseResultForRoutines,
  elapsedCourseDayForDate,
  mergeRecord,
  resetRoutineCompletion,
  routinesForNewDay,
} from './alpha';

const COURSE_PASS_THRESHOLD = {
  BASIC: 50,
  STANDARD: 70,
  HARD: 90,
} as const;

const COURSE_LEVELS: CourseLevel[] = ['BASIC', 'STANDARD', 'HARD'];

function hydratedRoutinePreferences(state: AppState) {
  return Object.fromEntries(
    COURSE_LEVELS.map((level) => [level, courseRoutinePreferencesFor(state, level)]),
  ) as AppState['routinePreferencesByCourse'];
}

export function courseRoutineTemplatesFor(state: AppState): Routine[] {
  const templates = (state as Partial<AppState>).courseRoutineTemplates;
  if (Array.isArray(templates)) return templates.map((routine) => ({ ...routine, done: false }));
  return courseRoutineTemplates(state);
}

export function resetProgressPreservingSettings(state: AppState): AppState {
  const fresh = createInitialState();
  return {
    ...fresh,
    hasOnboarded: true,
    routinesByDate: {
      [fresh.today.date]: resetRoutineCompletion(fresh.routinesByDate[fresh.today.date]),
    },
    settings: {
      ...fresh.settings,
      ...state.settings,
    },
  };
}

export function isCourseComplete(state: AppState) {
  return state.currentCourse.day === 30 && state.records.some(
    (record) => record.course === state.currentCourse.level && record.day === 30,
  );
}

export function nextCourseLevel(level: AppState['currentCourse']['level']) {
  if (level === 'BASIC') return 'STANDARD' as const;
  if (level === 'STANDARD') return 'HARD' as const;
  return null;
}

export function courseCompletionRate(state: AppState) {
  const completedDays = new Set(
    state.records
      .filter((record) => record.course === state.currentCourse.level && record.status === 'complete')
      .map((record) => record.day),
  ).size;
  return Math.round((completedDays / 30) * 100);
}

export function hasPassedCurrentCourse(state: AppState) {
  return isCourseComplete(state)
    && courseCompletionRate(state) >= COURSE_PASS_THRESHOLD[state.currentCourse.level];
}

export function canStartNextCourse(state: AppState) {
  return hasPassedCurrentCourse(state) && nextCourseLevel(state.currentCourse.level) !== null;
}

export function canRestartCurrentCourse(state: AppState) {
  return isCourseComplete(state) && !hasPassedCurrentCourse(state);
}

export function startNextCourse(state: AppState, startedAt = state.today.date): AppState {
  const level = nextCourseLevel(state.currentCourse.level);
  if (!level || !canStartNextCourse(state)) return state;

  const nextState: AppState = {
    ...state,
    currentCourse: {
      level,
      day: 1,
      startedAt,
      currentStage: 1,
      progress: 0,
      next: {
        standardLocked: false,
        hardLocked: level !== 'HARD',
      },
    },
    today: {
      date: startedAt,
      hasReflection: false,
      isClosed: false,
      result: null,
      standard: '',
    },
    courseRoutineTemplates: [],
    routinePreferencesByCourse: {
      ...hydratedRoutinePreferences(state),
      [level]: { hiddenRoutineIds: [], order: [] },
    },
    routinesByDate: {
      ...state.routinesByDate,
      [startedAt]: [],
    },
  };
  nextState.routinesByDate[startedAt] = routinesForNewDay(nextState);
  return nextState;
}

export function restartCurrentCourse(state: AppState, startedAt = state.today.date): AppState {
  if (!canRestartCurrentCourse(state)) return state;

  const level = state.currentCourse.level;
  const nextState: AppState = {
    ...state,
    currentCourse: {
      level,
      day: 1,
      startedAt,
      currentStage: 1,
      progress: 0,
      next: {
        standardLocked: level === 'BASIC',
        hardLocked: level !== 'HARD',
      },
    },
    today: {
      date: startedAt,
      hasReflection: false,
      isClosed: false,
      result: null,
      standard: '',
    },
    courseRoutineTemplates: [],
    routinePreferencesByCourse: {
      ...hydratedRoutinePreferences(state),
      [level]: { hiddenRoutineIds: [], order: [] },
    },
    records: state.records.filter((record) => record.course !== level),
    routinesByDate: {
      ...state.routinesByDate,
      [startedAt]: [],
    },
  };
  nextState.routinesByDate[startedAt] = routinesForNewDay(nextState);
  return nextState;
}

export function reopenTodayForEditing(state: AppState): AppState {
  const currentRecord = state.records.find(
    (record) => (
      record.course === state.currentCourse.level
      && record.day === state.currentCourse.day
      && record.date === state.today.date
    ),
  );
  const records = state.records.filter(
    (record) => !(
      record.course === state.currentCourse.level
      && record.day === state.currentCourse.day
      && record.date === state.today.date
    ),
  );
  const today = {
    date: state.today.date,
    hasReflection: false,
    isClosed: false,
    result: null,
    standard: state.today.standard ?? currentRecord?.standard ?? '',
  };
  const nextState: AppState = {
    ...state,
    records,
    today,
  };
  return {
    ...nextState,
    currentCourse: courseStateFor(nextState, nextState.today.date, records),
  };
}

export function reconcileStateForDate(input: AppState, currentDate: string): AppState {
  const initial = createInitialState();
  const hydrated: AppState = {
    ...initial,
    ...input,
    courseRoutineTemplates: courseRoutineTemplatesFor(input),
    routinePreferencesByCourse: hydratedRoutinePreferences(input),
    currentCourse: {
      ...initial.currentCourse,
      ...input.currentCourse,
      next: {
        ...initial.currentCourse.next,
        ...input.currentCourse?.next,
      },
    },
    records: input.records ?? [],
    routinesByDate: {
      ...(input.routinesByDate ?? {}),
    },
    settings: {
      ...initial.settings,
      ...input.settings,
    },
    today: {
      ...initial.today,
      ...input.today,
    },
  };

  if (!hydrated.hasOnboarded && hydrated.today.date !== currentDate) return createInitialState();
  if (hydrated.hasOnboarded && currentDate < hydrated.today.date) return hydrated;

  const currentRoutines = hydrated.routinesByDate[hydrated.today.date] ?? [];
  const currentCoreRoutineIds = currentRoutines
    .filter((routine) => routine.type === 'basic')
    .map((routine) => routine.id)
    .sort()
    .join('|');
  const routinePreferences = courseRoutinePreferencesFor(hydrated);
  const expectedCourseRoutines = applyRoutinePreferences(
    courseRoutinesFor(hydrated.currentCourse.level, hydrated.currentCourse.day),
    routinePreferences,
  );
  const expectedRoutineIds = expectedCourseRoutines.map((routine) => routine.id).sort().join('|');
  const hasCurrentCourseRecord = hydrated.records.some(
    (record) => record.course === hydrated.currentCourse.level && record.day === hydrated.currentCourse.day,
  );
  if (
    !hydrated.today.isClosed
    && !hasCurrentCourseRecord
    && currentCoreRoutineIds !== expectedRoutineIds
  ) {
    const existingRoutines = new Map(currentRoutines.map((routine) => [routine.id, routine]));
    hydrated.routinesByDate[hydrated.today.date] = applyRoutinePreferences([
      ...expectedCourseRoutines.map((routine) => ({
        ...routine,
        done: existingRoutines.get(routine.id)?.done ?? false,
      })),
      ...currentRoutines.filter((routine) => routine.type === 'personal'),
    ], routinePreferences);
  }

  hydrated.currentCourse = courseStateFor(hydrated, hydrated.today.date, hydrated.records);
  if (hydrated.today.date === currentDate) return hydrated;

  let records = hydrated.records;
  let routinesByDate = hydrated.routinesByDate;

  if (hydrated.hasOnboarded && !isCourseComplete(hydrated)) {
    const lastClosableDay = Math.min(30, elapsedCourseDayForDate(hydrated.currentCourse.startedAt, currentDate) - 1);
    for (let day = hydrated.currentCourse.day; day <= lastClosableDay; day += 1) {
      if (records.some((record) => record.course === hydrated.currentCourse.level && record.day === day)) continue;
      const date = day === hydrated.currentCourse.day
        ? hydrated.today.date
        : dateForCourseDay(hydrated.currentCourse.startedAt, day);
      const dayState = { ...hydrated, records, routinesByDate };
      const dayRoutines = routinesByDate[date] ?? routinesForNewDay(dayState, day);
      const status = courseResultForRoutines(dayRoutines);
      records = mergeRecord(
        records,
        createRecordForDay({
          closedAt: new Date().toISOString(),
          date,
          day,
          level: hydrated.currentCourse.level,
          routines: dayRoutines,
          standard: date === hydrated.today.date ? hydrated.today.standard : undefined,
          status,
        }),
      );
      routinesByDate = {
        ...routinesByDate,
        [date]: dayRoutines,
      };
    }
  }

  const nextState: AppState = {
    ...hydrated,
    records,
    routinesByDate: {
      ...routinesByDate,
    },
    today: {
      date: currentDate,
      hasReflection: false,
      isClosed: false,
      result: null,
      standard: '',
    },
  };
  nextState.currentCourse = courseStateFor(nextState, currentDate, records);
  nextState.routinesByDate[currentDate] = nextState.routinesByDate[currentDate] ?? routinesForNewDay(nextState);
  return nextState;
}
