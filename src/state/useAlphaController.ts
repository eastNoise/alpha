import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';

import {
  STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  basicRoutines,
  categories,
  createInitialState,
  getTodayKey,
  scopes,
} from '../data';
import { cloneRoutines, doneCount, sortRecords, streakCount } from '../domain/alpha';
import { AppState, DayRecord, Routine, ScreenName } from '../types';

export type OverlayName = 'finish' | 'reflection' | 'addRoutine' | 'dayDetail' | null;

export function useAlphaController() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('onboarding');
  const [stack, setStack] = useState<ScreenName[]>([]);
  const [overlay, setOverlay] = useState<OverlayName>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [routineName, setRoutineName] = useState('명상 10분');
  const [selectedCat, setSelectedCat] = useState<(typeof categories)[number]>('몸');
  const [selectedScope, setSelectedScope] = useState<(typeof scopes)[number]>('이번 과정 동안');
  const [toast, setToast] = useState('');

  const todayKey = state.today.date || getTodayKey();
  const routines = state.routinesByDate[todayKey] ?? basicRoutines;
  const done = doneCount(routines);
  const total = routines.length || 1;
  const missed = total - done;
  const rate = Math.round((done / total) * 100);
  const sortedRecords = useMemo(() => sortRecords(state.records), [state.records]);
  const todayRecord = state.records.find((record) => record.day === state.currentCourse.day);
  const streak = streakCount(state.records);
  const showTabs = screen === 'today' || screen === 'records' || screen === 'course';

  useEffect(() => {
    let mounted = true;
    AsyncStorage.multiRemove(['alpha:v19:state']).catch(() => undefined);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          if (parsed.schemaVersion !== STATE_SCHEMA_VERSION) {
            const freshState = createInitialState();
            setState(freshState);
            setScreen('onboarding');
            return;
          }
          const currentDate = getTodayKey();
          const routinesForDate = parsed.routinesByDate?.[parsed.today.date] ?? basicRoutines;
          const hydrated: AppState = {
            ...createInitialState(),
            ...parsed,
            routinesByDate: {
              ...parsed.routinesByDate,
              [parsed.today.date]: routinesForDate,
            },
          };
          if (parsed.today.date !== currentDate) {
            hydrated.today = {
              date: currentDate,
              isClosed: false,
              hasReflection: false,
              result: null,
            };
            hydrated.routinesByDate[currentDate] = cloneRoutines(basicRoutines);
          }
          setState(hydrated);
          setScreen(hydrated.hasOnboarded ? 'today' : 'onboarding');
        }
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      showToast('상태 저장에 실패했습니다.');
    });
  }, [ready, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  function go(next: ScreenName, push = true) {
    if (push && screen !== next) setStack((prev) => [...prev, screen]);
    setScreen(next);
  }

  function back() {
    setStack((prev) => {
      const nextStack = [...prev];
      setScreen(nextStack.pop() ?? 'today');
      return nextStack;
    });
  }

  function startOnboarding() {
    setState((prev) => ({ ...prev, hasOnboarded: true }));
    setStack([]);
    setScreen('today');
  }

  function updateTodayRoutines(nextRoutines: Routine[]) {
    setState((prev) => ({
      ...prev,
      routinesByDate: {
        ...prev.routinesByDate,
        [prev.today.date]: nextRoutines,
      },
    }));
  }

  function toggleRoutine(id: string) {
    if (state.today.isClosed) {
      showToast('마감 후에는 루틴을 수정할 수 없습니다.');
      return;
    }
    updateTodayRoutines(
      routines.map((routine) =>
        routine.id === id ? { ...routine, done: !routine.done } : routine,
      ),
    );
  }

  function closeDay() {
    if (state.today.isClosed) {
      if (!state.today.hasReflection) setOverlay('reflection');
      else showToast('이미 마감 완료된 하루입니다.');
      return;
    }

    const status = done === total ? 'complete' : 'incomplete';
    const closedAt = new Date().toISOString();
    const record: DayRecord = {
      id: `day-${state.currentCourse.day}`,
      date: state.today.date,
      course: state.currentCourse.level,
      day: state.currentCourse.day,
      stage: state.currentCourse.currentStage,
      status,
      completedRoutineIds: routines.filter((routine) => routine.done).map((routine) => routine.id),
      missedRoutineIds: routines.filter((routine) => !routine.done).map((routine) => routine.id),
      closedAt,
      reflection: todayRecord?.reflection,
    };

    setState((prev) => ({
      ...prev,
      today: {
        ...prev.today,
        isClosed: true,
        hasReflection: Boolean(todayRecord?.reflection),
        result: status,
        closedAt,
      },
      records: [record, ...prev.records.filter((item) => item.day !== prev.currentCourse.day)],
    }));
    setOverlay('finish');
  }

  function saveReflection() {
    const text = reflectionText.trim();
    if (!text) {
      showToast('회고를 입력해라.');
      return;
    }

    const closedAt = state.today.closedAt ?? new Date().toISOString();
    const status = state.today.result ?? (done === total ? 'complete' : 'incomplete');
    const record: DayRecord = {
      id: `day-${state.currentCourse.day}`,
      date: state.today.date,
      course: state.currentCourse.level,
      day: state.currentCourse.day,
      stage: state.currentCourse.currentStage,
      status,
      completedRoutineIds: routines.filter((routine) => routine.done).map((routine) => routine.id),
      missedRoutineIds: routines.filter((routine) => !routine.done).map((routine) => routine.id),
      reflection: text,
      closedAt,
    };

    setState((prev) => ({
      ...prev,
      today: {
        ...prev.today,
        isClosed: true,
        hasReflection: true,
        result: status,
        closedAt,
      },
      records: [record, ...prev.records.filter((item) => item.day !== prev.currentCourse.day)],
    }));
    setReflectionText('');
    setOverlay(null);
    showToast('하루 회고가 저장되었습니다.');
    go('records');
  }

  function addPersonalRoutine() {
    if (state.today.isClosed) {
      showToast('마감 후에는 루틴을 추가할 수 없습니다.');
      setOverlay(null);
      return;
    }

    const cleanName = routineName.trim() || '개인 루틴';
    const nextRoutine: Routine = {
      id: `personal-${Date.now()}`,
      name: cleanName,
      done: false,
      category: selectedCat,
      type: 'personal',
      scope: selectedScope === '오늘만' ? 'today' : 'course',
    };
    updateTodayRoutines([...routines, nextRoutine]);
    setRoutineName('');
    setOverlay(null);
    showToast('개인 루틴이 추가되었습니다.');
  }

  function openAddRoutine() {
    if (state.today.isClosed) {
      showToast('마감 후에는 루틴을 추가할 수 없습니다.');
      return;
    }
    setOverlay('addRoutine');
  }

  function openDay(day: number) {
    setSelectedDay(day);
    setOverlay('dayDetail');
  }

  function selectTab(tab: ScreenName) {
    setStack([]);
    setScreen(tab);
  }

  function logout() {
    setState((prev) => ({ ...prev, hasOnboarded: false }));
    setStack([]);
    setScreen('onboarding');
  }

  return {
    addPersonalRoutine,
    back,
    closeDay,
    done,
    go,
    logout,
    missed,
    openAddRoutine,
    openDay,
    overlay,
    rate,
    ready,
    reflectionText,
    routineName,
    routines,
    saveReflection,
    screen,
    selectTab,
    selectedCat,
    selectedDay,
    selectedScope,
    setOverlay,
    setReflectionText,
    setRoutineName,
    setScreen,
    setSelectedCat,
    setSelectedScope,
    showTabs,
    showToast,
    sortedRecords,
    startOnboarding,
    state,
    streak,
    toast,
    toggleRoutine,
    total,
  };
}
