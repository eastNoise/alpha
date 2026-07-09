import { DayRecord, Routine } from '../types';

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
  return routines.map((routine) => ({ ...routine }));
}

export function streakCount(records: DayRecord[]) {
  return records.filter((record) => record.status === 'complete').length;
}

export function sortRecords(records: DayRecord[]) {
  return [...records].sort((a, b) => b.day - a.day);
}
