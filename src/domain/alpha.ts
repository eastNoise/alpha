import { DayRecord, Routine } from '../types';
import { basicRoutines, dateForCourseDay, getTodayKey, stageForDay } from '../data';
import { AppState, SettingsState } from '../types';

export function doneCount(routines: Routine[]) {
  return routines.filter((routine) => routine.done).length;
}

export function resultLabel(status?: 'complete' | 'incomplete' | null) {
  if (status === 'complete') return '완료';
  if (status === 'incomplete') return '미완성';
  return '진행 중';
}

export function stageTitleForDay(day: number) {
  if (day <= 7) return '기초 통제';
  if (day <= 14) return '몸 깨우기';
  if (day <= 21) return '기록 만들기';
  return '기준 적응';
}

export function cloneRoutines(routines: Routine[]) {
  return routines.map((routine) => ({ ...routine, done: false }));
}

export function streakCount(records: DayRecord[]) {
  const byDay = recordMapByDay(records);
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

export function recordMapByDay(records: DayRecord[]) {
  return new Map(records.map((record) => [record.day, record]));
}

export function uniqueRecordCount(records: DayRecord[]) {
  return recordMapByDay(records).size;
}

export function progressForRecords(records: DayRecord[]) {
  return Math.min(100, Math.round((uniqueRecordCount(records) / 30) * 100));
}

export function courseDayForDate(startedAt: string, dateKey = getTodayKey()) {
  const elapsed = elapsedCourseDayForDate(startedAt, dateKey);
  return Math.min(30, Math.max(1, elapsed));
}

export function elapsedCourseDayForDate(startedAt: string, dateKey = getTodayKey()) {
  const start = new Date(`${startedAt}T00:00:00`);
  const current = new Date(`${dateKey}T00:00:00`);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

export function courseStateFor(state: AppState, dateKey = getTodayKey(), records = state.records) {
  const day = courseDayForDate(state.currentCourse.startedAt, dateKey);
  return {
    ...state.currentCourse,
    day,
    currentStage: stageForDay(day),
    progress: progressForRecords(records),
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

export function routinesForNewDay(state: AppState) {
  return [...cloneRoutines(basicRoutines), ...courseRoutineTemplates(state)];
}

export function resetRoutineCompletion(routines: Routine[]) {
  return routines.map((routine) => ({ ...routine, done: false }));
}

export function createRecordForDay({
  closedAt,
  date,
  day,
  level,
  routines,
  status,
}: {
  closedAt: string;
  date: string;
  day: number;
  level: AppState['currentCourse']['level'];
  routines: Routine[];
  status: DayRecord['status'];
}): DayRecord {
  return {
    id: `day-${day}`,
    date,
    course: level,
    day,
    stage: stageForDay(day),
    status,
    completedRoutineIds: routines.filter((routine) => routine.done).map((routine) => routine.id),
    missedRoutineIds: routines.filter((routine) => !routine.done).map((routine) => routine.id),
    closedAt,
  };
}

export function mergeRecord(records: DayRecord[], record: DayRecord) {
  return [record, ...records.filter((item) => item.day !== record.day)];
}

export function nextPhraseTone(tone: SettingsState['phraseTone']) {
  if (tone === 'basic') return 'hard';
  if (tone === 'hard') return 'cold';
  return 'basic';
}
