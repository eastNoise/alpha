import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';
import {
  STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  categories,
  createInitialState,
  getTodayKey,
  scopes,
} from '../data';
import {
  courseStateFor,
  courseDoneCount,
  courseResultForRoutines,
  courseRoutineTotal,
  createRecordForDay,
  mergeRecord,
  recordsForCourse,
  resetRoutineCompletion,
  routinesForNewDay,
  sortRecords,
  streakCount,
} from '../domain/alpha';
import {
  canStartNextCourse,
  isCourseComplete,
  reconcileStateForDate,
  reopenTodayForEditing,
  startNextCourse,
} from '../domain/stateLifecycle';
import { AppState, Routine, ScreenName } from '../types';

export type OverlayName = 'finish' | 'reflection' | 'addRoutine' | 'dayDetail' | 'resetData' | 'appInfo' | null;
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
  const routines = state.routinesByDate[todayKey] ?? routinesForNewDay(state);
  const done = courseDoneCount(routines);
  const total = courseRoutineTotal(routines) || 1;
  const missed = total - done;
  const rate = Math.round((done / total) * 100);
  const sortedRecords = useMemo(
    () => sortRecords(recordsForCourse(state.records, state.currentCourse.level)),
    [state.currentCourse.level, state.records],
  );
  const todayRecord = state.records.find(
    (record) => record.course === state.currentCourse.level && record.day === state.currentCourse.day,
  );
  const streak = streakCount(sortedRecords);
  const courseComplete = isCourseComplete(state);
  const nextCourseAvailable = canStartNextCourse(state);
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
          const hydrated = reconcileStateForDate(parsed, currentDate);
          setState(hydrated);
          setScreen(hydrated.hasOnboarded ? 'today' : 'onboarding');
        }
      })
      .catch(() => {
        if (!mounted) return;
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
        setState(createInitialState());
        setScreen('onboarding');
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
    const subscription = NativeAppState.addEventListener('change', (nextStatus) => {
      if (nextStatus === 'active') setState((prev) => reconcileStateForDate(prev, getTodayKey()));
    });
    return () => subscription.remove();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let active = true;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      if (active) showToast('상태 저장에 실패했습니다.');
    });
    return () => {
      active = false;
    };
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
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete ? `${state.currentCourse.level} 30일 과정을 완료했습니다.` : '마감 후에는 루틴을 수정할 수 없습니다.');
      return;
    }
    updateTodayRoutines(
      routines.map((routine) =>
        routine.id === id ? { ...routine, done: !routine.done } : routine,
      ),
    );
  }

  function closeDay() {
    if (courseComplete) {
      showToast(`${state.currentCourse.level} 30일 과정을 완료했습니다.`);
      return;
    }
    if (state.today.isClosed) {
      if (!state.today.hasReflection) setOverlay('reflection');
      else showToast('이미 마감 완료된 하루입니다.');
      return;
    }

    const status = courseResultForRoutines(routines);
    const closedAt = new Date().toISOString();
    const record = createRecordForDay({
      closedAt,
      date: state.today.date,
      day: state.currentCourse.day,
      level: state.currentCourse.level,
      reflection: todayRecord?.reflection,
      routines,
      status,
    });

    setState((prev) => {
      const records = mergeRecord(prev.records, record);
      return {
        ...prev,
        currentCourse: courseStateFor(prev, prev.today.date, records),
        today: {
          ...prev.today,
          isClosed: true,
          hasReflection: Boolean(todayRecord?.reflection),
          result: status,
          closedAt,
        },
        records,
      };
    });
    setOverlay('finish');
  }

  function undoCloseDay() {
    if (!state.today.isClosed) {
      setOverlay(null);
      return;
    }
    setState((prev) => reopenTodayForEditing(prev));
    setReflectionText('');
    setOverlay(null);
    setScreen('today');
    showToast('마감을 취소했습니다.');
  }

  function saveReflection() {
    const text = reflectionText.trim();
    if (!text) {
      showToast('회고를 입력해라.');
      return;
    }

    const closedAt = state.today.closedAt ?? new Date().toISOString();
    const status = state.today.result ?? courseResultForRoutines(routines);
    const record = createRecordForDay({
      closedAt,
      date: state.today.date,
      day: state.currentCourse.day,
      level: state.currentCourse.level,
      reflection: text,
      routines,
      status,
    });

    setState((prev) => {
      const records = mergeRecord(prev.records, record);
      return {
        ...prev,
        currentCourse: courseStateFor(prev, prev.today.date, records),
        today: {
          ...prev.today,
          isClosed: true,
          hasReflection: true,
          result: status,
          closedAt,
        },
        records,
      };
    });
    setReflectionText('');
    setOverlay(null);
    showToast('하루 회고가 저장되었습니다.');
    go('records');
  }

  function addPersonalRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete ? `${state.currentCourse.level} 30일 과정을 완료했습니다.` : '마감 후에는 루틴을 추가할 수 없습니다.');
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
    setState((prev) => {
      const currentRoutines = prev.routinesByDate[prev.today.date] ?? routinesForNewDay(prev);
      return {
        ...prev,
        courseRoutineTemplates:
          nextRoutine.scope === 'course'
            ? [...prev.courseRoutineTemplates, { ...nextRoutine, done: false }]
            : prev.courseRoutineTemplates,
        routinesByDate: {
          ...prev.routinesByDate,
          [prev.today.date]: [...currentRoutines, nextRoutine],
        },
      };
    });
    setRoutineName('');
    setOverlay(null);
    showToast('개인 루틴이 추가되었습니다.');
  }

  function removePersonalRoutine(id: string) {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete ? `${state.currentCourse.level} 30일 과정을 완료했습니다.` : '마감 후에는 루틴을 삭제할 수 없습니다.');
      return;
    }
    setState((prev) => {
      const currentRoutines = prev.routinesByDate[prev.today.date] ?? routinesForNewDay(prev);
      return {
        ...prev,
        courseRoutineTemplates: prev.courseRoutineTemplates.filter((routine) => routine.id !== id),
        routinesByDate: {
          ...prev.routinesByDate,
          [prev.today.date]: currentRoutines.filter((routine) => routine.id !== id),
        },
      };
    });
    showToast('개인 루틴이 삭제되었습니다.');
  }

  function openAddRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete ? `${state.currentCourse.level} 30일 과정을 완료했습니다.` : '마감 후에는 루틴을 추가할 수 없습니다.');
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

  function setNotificationsEnabled(enabled: boolean) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: enabled,
      },
    }));
  }

  function toggleNotifications() {
    setNotificationsEnabled(!state.settings.notificationsEnabled);
  }

  function toggleHaptics() {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hapticsEnabled: !prev.settings.hapticsEnabled,
      },
    }));
  }

  function resetData() {
    const fresh = createInitialState();
    setState({
      ...fresh,
      hasOnboarded: true,
      routinesByDate: {
        [fresh.today.date]: resetRoutineCompletion(fresh.routinesByDate[fresh.today.date]),
      },
    });
    setStack([]);
    setScreen('today');
    setOverlay(null);
    showToast('기록이 초기화되었습니다.');
  }

  function beginNextCourse() {
    if (!canStartNextCourse(state)) {
      showToast('현재 과정을 완료한 뒤 다음 과정을 시작할 수 있습니다.');
      return;
    }
    setState((prev) => startNextCourse(prev));
    setStack([]);
    setScreen('today');
    showToast('다음 과정을 시작합니다.');
  }

  return {
    addPersonalRoutine,
    back,
    beginNextCourse,
    closeDay,
    courseComplete,
    done,
    go,
    missed,
    nextCourseAvailable,
    openAddRoutine,
    openDay,
    overlay,
    rate,
    ready,
    reflectionText,
    removePersonalRoutine,
    resetData,
    routineName,
    routines,
    saveReflection,
    screen,
    selectTab,
    selectedCat,
    selectedDay,
    selectedScope,
    setOverlay,
    setNotificationsEnabled,
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
    toggleHaptics,
    toggleNotifications,
    toggleRoutine,
    total,
    undoCloseDay,
  };
}
