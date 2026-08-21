import { AppState, CourseRoutinePreferences, DayRecord, Routine } from '../types';
import { courseRoutinesFor, courseStageForDay, dateForCourseDay, dateKeyToDayNumber, getTodayKey, stageForDay } from '../data';

const PROGRAM_DAY_OFFSET: Record<AppState['currentCourse']['level'], number> = {
  BASIC: 0,
  STANDARD: 30,
  HARD: 60,
};

export function programDayForCourse(level: AppState['currentCourse']['level'], courseDay: number) {
  const normalizedCourseDay = Math.min(30, Math.max(1, courseDay));
  return PROGRAM_DAY_OFFSET[level] + normalizedCourseDay;
}

export function programProgressForCourse(level: AppState['currentCourse']['level'], courseDay: number) {
  return Math.round((programDayForCourse(level, courseDay) / 90) * 100);
}

export function doneCount(routines: Routine[]) {
  return routines.filter((routine) => routine.done).length;
}

export function courseRoutinesOnly(routines: Routine[]) {
  return routines.filter((routine) => routine.type === 'basic');
}

export function courseDoneCount(routines: Routine[]) {
  return doneCount(courseRoutinesOnly(routines));
}

export function courseRoutineTotal(routines: Routine[]) {
  return courseRoutinesOnly(routines).length;
}

export function courseResultForRoutines(routines: Routine[]) {
  const total = courseRoutineTotal(routines);
  return total > 0 && courseDoneCount(routines) === total ? 'complete' : 'incomplete';
}

export function resultLabel(status?: 'complete' | 'incomplete' | null) {
  if (status === 'complete') return '완료';
  if (status === 'incomplete') return '미완성';
  return '진행 중';
}

export function stageTitleForDay(level: AppState['currentCourse']['level'], day: number) {
  return courseStageForDay(level, day).title;
}

export function cloneRoutines(routines: Routine[]) {
  return routines.map((routine) => ({ ...routine, done: false }));
}

export function streakCount(records: DayRecord[]) {
  const level = records[0]?.course;
  const byDay = recordMapByDay(records, level);
  const latestDay = Math.max(0, ...Array.from(byDay.keys()));
  let streak = 0;

  for (let day = latestDay; day >= 1; day -= 1) {
    if (byDay.get(day)?.status !== 'complete') break;
    streak += 1;
  }

  return streak;
}

export function sortRecords(records: DayRecord[]) {
  return [...records].sort((a, b) => b.day - a.day);
}

export function recordsForCourse(records: DayRecord[], level: AppState['currentCourse']['level']) {
  return records.filter((record) => record.course === level);
}

export function recordMapByDay(records: DayRecord[], level?: AppState['currentCourse']['level']) {
  const courseRecords = level ? recordsForCourse(records, level) : records;
  return new Map(courseRecords.map((record) => [record.day, record]));
}

export function uniqueRecordCount(records: DayRecord[], level?: AppState['currentCourse']['level']) {
  return recordMapByDay(records, level).size;
}

export function progressForRecords(records: DayRecord[], level?: AppState['currentCourse']['level']) {
  return Math.min(100, Math.round((uniqueRecordCount(records, level) / 30) * 100));
}

export function courseDayForDate(startedAt: string, dateKey = getTodayKey()) {
  const elapsed = elapsedCourseDayForDate(startedAt, dateKey);
  return Math.min(30, Math.max(1, elapsed));
}

export function elapsedCourseDayForDate(startedAt: string, dateKey = getTodayKey()) {
  return dateKeyToDayNumber(dateKey) - dateKeyToDayNumber(startedAt) + 1;
}

export function courseStateFor(state: AppState, dateKey = getTodayKey(), records = state.records) {
  const day = courseDayForDate(state.currentCourse.startedAt, dateKey);
  return {
    ...state.currentCourse,
    day,
    currentStage: stageForDay(day),
    progress: progressForRecords(records, state.currentCourse.level),
  };
}

export function courseRoutineTemplates(state: AppState) {
  const templates = new Map<string, Routine>();

  Object.values(state.routinesByDate).forEach((routines) => {
    routines.forEach((routine) => {
      if (routine.type === 'personal' && routine.scope === 'course') {
        templates.set(routine.id, { ...routine, done: false });
      }
    });
  });

  return Array.from(templates.values());
}

export function courseRoutinePreferencesFor(
  state: AppState,
  level = state.currentCourse.level,
): CourseRoutinePreferences {
  const stored = (state as Partial<AppState>).routinePreferencesByCourse?.[level];
  return {
    hiddenRoutineIds: Array.from(new Set(stored?.hiddenRoutineIds ?? [])),
    order: Array.from(new Set(stored?.order ?? [])),
  };
}

export function applyRoutinePreferences(
  routines: Routine[],
  preferences: CourseRoutinePreferences,
) {
  const hiddenRoutineIds = new Set(preferences.hiddenRoutineIds);
  const orderById = new Map(preferences.order.map((id, index) => [id, index]));
  const fallbackStart = preferences.order.length;

  return routines
    .filter((routine) => routine.type !== 'basic' || !hiddenRoutineIds.has(routine.id))
    .map((routine, index) => ({ index, routine }))
    .sort((left, right) => (
      (orderById.get(left.routine.id) ?? fallbackStart + left.index)
      - (orderById.get(right.routine.id) ?? fallbackStart + right.index)
    ))
    .map(({ routine }) => routine);
}

export function restoreRoutineAtPosition({
  fallbackIndex,
  nextRoutineId,
  previousRoutineId,
  routine,
  routines,
}: {
  fallbackIndex: number;
  nextRoutineId?: string;
  previousRoutineId?: string;
  routine: Routine;
  routines: Routine[];
}) {
  if (routines.some((item) => item.id === routine.id)) return routines;

  const nextIndex = nextRoutineId
    ? routines.findIndex((item) => item.id === nextRoutineId)
    : -1;
  const previousIndex = previousRoutineId
    ? routines.findIndex((item) => item.id === previousRoutineId)
    : -1;
  const insertionIndex = nextIndex >= 0
    ? nextIndex
    : previousIndex >= 0
      ? previousIndex + 1
      : Math.max(0, Math.min(routines.length, fallbackIndex));

  const restored = [...routines];
  restored.splice(insertionIndex, 0, { ...routine });
  return restored;
}

export function routinesForNewDay(state: AppState, day = state.currentCourse.day) {
  const templates = (state as Partial<AppState>).courseRoutineTemplates;
  return applyRoutinePreferences([
    ...cloneRoutines(courseRoutinesFor(state.currentCourse.level, day)),
    ...(Array.isArray(templates) ? cloneRoutines(templates) : courseRoutineTemplates(state)),
  ], courseRoutinePreferencesFor(state));
}

export function resetRoutineCompletion(routines: Routine[]) {
  return routines.map((routine) => ({ ...routine, done: false }));
}

export function createRecordForDay({
  closedAt,
  date,
  day,
  level,
  reflection,
  standard,
  routines,
  status,
}: {
  closedAt: string;
  date: string;
  day: number;
  level: AppState['currentCourse']['level'];
  reflection?: string;
  standard?: string;
  routines: Routine[];
  status: DayRecord['status'];
}): DayRecord {
  return {
    id: `day-${level.toLowerCase()}-${day}`,
    date,
    course: level,
    day,
    stage: stageForDay(day),
    status,
    completedRoutineIds: routines.filter((routine) => routine.done).map((routine) => routine.id),
    missedRoutineIds: routines.filter((routine) => !routine.done).map((routine) => routine.id),
    reflection,
    standard: standard?.trim() || undefined,
    closedAt,
  };
}

export function mergeRecord(records: DayRecord[], record: DayRecord) {
  return [record, ...records.filter((item) => item.course !== record.course || item.day !== record.day)];
}
