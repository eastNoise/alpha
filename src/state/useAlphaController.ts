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
  courseResultForRoutines,
  createRecordForDay,
  doneCount,
  mergeRecord,
  recordsForCourse,
  resetRoutineCompletion,
  routinesForNewDay,
  sortRecords,
  streakCount,
} from '../domain/alpha';
import {
  canStartNextCourse,
  canRestartCurrentCourse,
  hasPassedCurrentCourse,
  isCourseComplete,
  reconcileStateForDate,
  reopenTodayForEditing,
  restartCurrentCourse,
  startNextCourse,
} from '../domain/stateLifecycle';
import { createI18n } from '../i18n';
import { AppState, Routine, ScreenName, SupportedLanguage } from '../types';

export type OverlayName = 'finish' | 'reflection' | 'addRoutine' | 'dayDetail' | 'resetData' | 'appInfo' | 'language' | null;
export function useAlphaController() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('onboarding');
  const [stack, setStack] = useState<ScreenName[]>([]);
  const [overlay, setOverlay] = useState<OverlayName>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [selectedCat, setSelectedCat] = useState<(typeof categories)[number]>('몸');
  const [selectedScope, setSelectedScope] = useState<(typeof scopes)[number]>('이번 과정 동안');
  const [toast, setToast] = useState('');
  const [, setLocaleRevision] = useState(0);
  const i18n = createI18n(state.settings.language ?? 'system');

  const todayKey = state.today.date || getTodayKey();
  const routines = state.routinesByDate[todayKey] ?? routinesForNewDay(state);
  const done = doneCount(routines);
  const total = routines.length || 1;
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
  const coursePassed = hasPassedCurrentCourse(state);
  const nextCourseAvailable = canStartNextCourse(state);
  const courseRestartAvailable = canRestartCurrentCourse(state);
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
          const hydrated = reconcileStateForDate({
            ...parsed,
            settings: {
              ...createInitialState().settings,
              ...parsed.settings,
              language: parsed.settings?.language ?? 'system',
            },
          }, currentDate);
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
      if (nextStatus === 'active') {
        setState((prev) => reconcileStateForDate(prev, getTodayKey()));
        setLocaleRevision((revision) => revision + 1);
      }
    });
    return () => subscription.remove();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let active = true;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      if (active) showToast(i18n.t('saveFailed'));
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
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('editLockedToast'));
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
      showToast(i18n.t('finishCourseToast', { level: state.currentCourse.level }));
      return;
    }
    if (state.today.isClosed) {
      if (!state.today.hasReflection) setOverlay('reflection');
      else showToast(i18n.t('alreadyClosedToast'));
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
    showToast(i18n.t('closeUndoneToast'));
  }

  function saveReflection() {
    const text = reflectionText.trim();
    if (!text) {
      showToast(i18n.t('enterReflectionToast'));
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
    showToast(i18n.t('reflectionSavedToast'));
    go('records');
  }

  function addPersonalRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('addLockedToast'));
      setOverlay(null);
      return;
    }

    const cleanName = routineName.trim() || i18n.t('personalRoutine');
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
    showToast(i18n.t('personalAddedToast'));
  }

  function removePersonalRoutine(id: string) {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('deleteLockedToast'));
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
    showToast(i18n.t('personalDeletedToast'));
  }

  function openAddRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('addLockedToast'));
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

  function setLanguage(language: SupportedLanguage) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        language,
      },
    }));
  }

  function resetData() {
    const fresh = createInitialState();
    setState({
      ...fresh,
      hasOnboarded: true,
      settings: {
        ...fresh.settings,
        language: state.settings.language ?? 'system',
      },
      routinesByDate: {
        [fresh.today.date]: resetRoutineCompletion(fresh.routinesByDate[fresh.today.date]),
      },
    });
    setStack([]);
    setScreen('today');
    setOverlay(null);
    showToast(i18n.t('resetDoneToast'));
  }

  function beginNextCourse() {
    if (!canStartNextCourse(state)) {
      showToast(i18n.t('nextCourseBlockedToast'));
      return;
    }
    setState((prev) => startNextCourse(prev));
    setStack([]);
    setScreen('today');
    showToast(i18n.t('nextCourseStartedToast'));
  }

  function restartCourse() {
    if (!canRestartCurrentCourse(state)) {
      showToast(i18n.t('restartBlockedToast'));
      return;
    }
    setState((prev) => restartCurrentCourse(prev));
    setStack([]);
    setScreen('today');
    showToast(i18n.t('restartedToast', { level: state.currentCourse.level }));
  }

  return {
    addPersonalRoutine,
    back,
    beginNextCourse,
    closeDay,
    courseComplete,
    coursePassed,
    courseRestartAvailable,
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
    restartCourse,
    routineName,
    routines,
    saveReflection,
    screen,
    selectTab,
    selectedCat,
    selectedDay,
    selectedScope,
    setOverlay,
    setLanguage,
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
