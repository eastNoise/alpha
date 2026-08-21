import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';
import {
  STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  categories,
  courseRoutinesFor,
  createInitialState,
  getTodayKey,
  scopes,
} from '../data';
import {
  courseRoutinePreferencesFor,
  courseStateFor,
  courseResultForRoutines,
  createRecordForDay,
  doneCount,
  mergeRecord,
  recordsForCourse,
  restoreRoutineAtPosition,
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
  resetProgressPreservingSettings,
  restartCurrentCourse,
  startNextCourse,
} from '../domain/stateLifecycle';
import { createI18n } from '../i18n';
import { AppState, DayResult, Routine, ScreenName, SupportedLanguage } from '../types';

export type OverlayName = 'confirmIncomplete' | 'finish' | 'reflection' | 'standard' | 'addRoutine' | 'dayDetail' | 'resetData' | 'appInfo' | 'language' | null;

type ToastState = {
  action?: 'undoRoutineRemoval';
  message: string;
};

type RoutineRemovalUndo = {
  date: string;
  fallbackIndex: number;
  level: AppState['currentCourse']['level'];
  nextRoutineId?: string;
  previousRoutineId?: string;
  routine: Routine;
  wasCourseTemplate: boolean;
};

export function useAlphaController() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('onboarding');
  const [stack, setStack] = useState<ScreenName[]>([]);
  const [overlay, setOverlay] = useState<OverlayName>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [recordCourse, setRecordCourse] = useState<AppState['currentCourse']['level']>('BASIC');
  const [reflectionText, setReflectionText] = useState('');
  const [standardText, setStandardText] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [selectedCat, setSelectedCat] = useState<(typeof categories)[number]>('몸');
  const [selectedScope, setSelectedScope] = useState<(typeof scopes)[number]>('이번 과정 동안');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [routineRemovalUndo, setRoutineRemovalUndo] = useState<RoutineRemovalUndo | null>(null);
  const [, setLocaleRevision] = useState(0);
  const i18n = createI18n(state.settings.language ?? 'system');

  const todayKey = state.today.date || getTodayKey();
  const routines = state.routinesByDate[todayKey] ?? routinesForNewDay(state);
  const routinePreferences = courseRoutinePreferencesFor(state);
  const hasRoutineCustomizations = routinePreferences.hiddenRoutineIds.length > 0
    || routinePreferences.order.length > 0;
  const done = doneCount(routines);
  const total = routines.length || 1;
  const missed = total - done;
  const rate = Math.round((done / total) * 100);
  const currentCourseRecords = useMemo(
    () => sortRecords(recordsForCourse(state.records, state.currentCourse.level)),
    [state.currentCourse.level, state.records],
  );
  const sortedRecords = useMemo(
    () => sortRecords(recordsForCourse(state.records, recordCourse)),
    [recordCourse, state.records],
  );
  const todayRecord = state.records.find(
    (record) => record.course === state.currentCourse.level && record.day === state.currentCourse.day,
  );
  const streak = streakCount(currentCourseRecords);
  const courseComplete = isCourseComplete(state);
  const coursePassed = hasPassedCurrentCourse(state);
  const nextCourseAvailable = canStartNextCourse(state);
  const courseRestartAvailable = canRestartCurrentCourse(state);
  const showTabs = screen === 'today' || screen === 'records' || screen === 'course';

  useEffect(() => {
    setRecordCourse(state.currentCourse.level);
    setSelectedDay(null);
  }, [state.currentCourse.level]);

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
    const timer = setTimeout(() => {
      setToast(null);
      if (toast.action === 'undoRoutineRemoval') setRoutineRemovalUndo(null);
    }, toast.action ? 6000 : 1600);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setRoutineRemovalUndo(null);
    setToast({ message });
  }

  function showRoutineRemovalToast(message: string) {
    setToast({ action: 'undoRoutineRemoval', message });
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

  function commitDayClose(status: DayResult) {
    const closedAt = new Date().toISOString();
    const record = createRecordForDay({
      closedAt,
      date: state.today.date,
      day: state.currentCourse.day,
      level: state.currentCourse.level,
      reflection: todayRecord?.reflection,
      routines,
      standard: state.today.standard,
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
    if (status === 'incomplete') {
      setOverlay('confirmIncomplete');
      return;
    }

    commitDayClose(status);
  }

  function confirmIncompleteClose() {
    if (state.today.isClosed) {
      setOverlay(null);
      return;
    }

    commitDayClose('incomplete');
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
      standard: state.today.standard,
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

  function openTodayStandard() {
    if (state.today.isClosed || courseComplete) {
      showToast(i18n.t('standardLockedToast'));
      return;
    }
    setStandardText(state.today.standard ?? '');
    setOverlay('standard');
  }

  function saveTodayStandard() {
    const standard = standardText.trim();
    setState((prev) => ({
      ...prev,
      today: {
        ...prev.today,
        standard,
      },
    }));
    setStandardText(standard);
    setOverlay(null);
    showToast(i18n.t(standard ? 'standardSavedToast' : 'standardClearedToast'));
  }

  function addPersonalRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('addLockedToast'));
      setOverlay(null);
      return;
    }

    const cleanName = routineName.trim();
    if (!cleanName) {
      showToast(i18n.t('routineNameRequired'));
      return;
    }
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

  function removeRoutine(id: string) {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('deleteLockedToast'));
      return;
    }

    const target = routines.find((routine) => routine.id === id);
    if (!target) return;
    if (target.type === 'basic' && routines.filter((routine) => routine.type === 'basic').length <= 1) {
      showToast(i18n.t('lastCourseRoutineToast'));
      return;
    }

    const targetIndex = routines.findIndex((routine) => routine.id === id);
    setRoutineRemovalUndo({
      date: state.today.date,
      fallbackIndex: targetIndex,
      level: state.currentCourse.level,
      nextRoutineId: routines[targetIndex + 1]?.id,
      previousRoutineId: routines[targetIndex - 1]?.id,
      routine: { ...target },
      wasCourseTemplate: state.courseRoutineTemplates.some((routine) => routine.id === id),
    });

    setState((prev) => {
      const currentRoutines = prev.routinesByDate[prev.today.date] ?? routinesForNewDay(prev);
      const currentTarget = currentRoutines.find((routine) => routine.id === id);
      if (!currentTarget) return prev;
      if (
        currentTarget.type === 'basic'
        && currentRoutines.filter((routine) => routine.type === 'basic').length <= 1
      ) return prev;

      const preferences = courseRoutinePreferencesFor(prev);
      return {
        ...prev,
        courseRoutineTemplates: prev.courseRoutineTemplates.filter((routine) => routine.id !== id),
        routinePreferencesByCourse: {
          ...prev.routinePreferencesByCourse,
          [prev.currentCourse.level]: {
            hiddenRoutineIds: currentTarget.type === 'basic'
              ? Array.from(new Set([...preferences.hiddenRoutineIds, id]))
              : preferences.hiddenRoutineIds,
            order: preferences.order.filter((routineId) => routineId !== id),
          },
        },
        routinesByDate: {
          ...prev.routinesByDate,
          [prev.today.date]: currentRoutines.filter((routine) => routine.id !== id),
        },
      };
    });
    showRoutineRemovalToast(i18n.t('routineRemovedToast'));
  }

  function undoRoutineRemoval() {
    const snapshot = routineRemovalUndo;
    setRoutineRemovalUndo(null);
    setToast(null);
    if (!snapshot) return;

    setState((prev) => {
      if (
        prev.today.date !== snapshot.date
        || prev.currentCourse.level !== snapshot.level
        || prev.today.isClosed
      ) return prev;

      const currentRoutines = prev.routinesByDate[snapshot.date] ?? routinesForNewDay(prev);
      if (currentRoutines.some((routine) => routine.id === snapshot.routine.id)) return prev;

      const restoredRoutines = restoreRoutineAtPosition({
        fallbackIndex: snapshot.fallbackIndex,
        nextRoutineId: snapshot.nextRoutineId,
        previousRoutineId: snapshot.previousRoutineId,
        routine: snapshot.routine,
        routines: currentRoutines,
      });
      const preferences = courseRoutinePreferencesFor(prev, snapshot.level);
      const shouldRestoreTemplate = snapshot.wasCourseTemplate
        && !prev.courseRoutineTemplates.some((routine) => routine.id === snapshot.routine.id);

      return {
        ...prev,
        courseRoutineTemplates: shouldRestoreTemplate
          ? [...prev.courseRoutineTemplates, { ...snapshot.routine, done: false }]
          : prev.courseRoutineTemplates,
        routinePreferencesByCourse: {
          ...prev.routinePreferencesByCourse,
          [snapshot.level]: {
            hiddenRoutineIds: preferences.hiddenRoutineIds.filter((id) => id !== snapshot.routine.id),
            order: restoredRoutines.map((routine) => routine.id),
          },
        },
        routinesByDate: {
          ...prev.routinesByDate,
          [snapshot.date]: restoredRoutines,
        },
      };
    });
  }

  function moveRoutine(id: string, targetIndex: number) {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('editLockedToast'));
      return;
    }

    setState((prev) => {
      const currentRoutines = prev.routinesByDate[prev.today.date] ?? routinesForNewDay(prev);
      const currentIndex = currentRoutines.findIndex((routine) => routine.id === id);
      if (currentIndex === -1) return prev;

      const boundedTargetIndex = Math.max(0, Math.min(currentRoutines.length - 1, targetIndex));
      if (currentIndex === boundedTargetIndex) return prev;

      const nextRoutines = [...currentRoutines];
      const [movedRoutine] = nextRoutines.splice(currentIndex, 1);
      nextRoutines.splice(boundedTargetIndex, 0, movedRoutine);
      const preferences = courseRoutinePreferencesFor(prev);

      return {
        ...prev,
        routinePreferencesByCourse: {
          ...prev.routinePreferencesByCourse,
          [prev.currentCourse.level]: {
            ...preferences,
            order: nextRoutines.map((routine) => routine.id),
          },
        },
        routinesByDate: {
          ...prev.routinesByDate,
          [prev.today.date]: nextRoutines,
        },
      };
    });
  }

  function restoreCourseRoutines() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('editLockedToast'));
      return;
    }

    setState((prev) => {
      const currentRoutines = prev.routinesByDate[prev.today.date] ?? routinesForNewDay(prev);
      const existingRoutines = new Map(currentRoutines.map((routine) => [routine.id, routine]));
      const defaultRoutines = courseRoutinesFor(prev.currentCourse.level, prev.currentCourse.day)
        .map((routine) => ({
          ...routine,
          done: existingRoutines.get(routine.id)?.done ?? false,
        }));
      const personalRoutines = currentRoutines.filter((routine) => routine.type === 'personal');

      return {
        ...prev,
        routinePreferencesByCourse: {
          ...prev.routinePreferencesByCourse,
          [prev.currentCourse.level]: { hiddenRoutineIds: [], order: [] },
        },
        routinesByDate: {
          ...prev.routinesByDate,
          [prev.today.date]: [...defaultRoutines, ...personalRoutines],
        },
      };
    });
    showToast(i18n.t('routinesRestoredToast'));
  }

  function openAddRoutine() {
    if (state.today.isClosed || courseComplete) {
      showToast(courseComplete
        ? i18n.t('finishCourseToast', { level: state.currentCourse.level })
        : i18n.t('addLockedToast'));
      return;
    }
    setRoutineName('');
    setOverlay('addRoutine');
  }

  function openDay(day: number) {
    setSelectedDay(day);
    setOverlay('dayDetail');
  }

  function selectRecordCourse(level: AppState['currentCourse']['level']) {
    setRecordCourse(level);
    setSelectedDay(null);
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
    setState((prev) => resetProgressPreservingSettings(prev));
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
    confirmIncompleteClose,
    courseComplete,
    coursePassed,
    courseRestartAvailable,
    done,
    go,
    hasRoutineCustomizations,
    missed,
    nextCourseAvailable,
    openAddRoutine,
    openDay,
    openTodayStandard,
    overlay,
    rate,
    ready,
    recordCourse,
    reflectionText,
    moveRoutine,
    removeRoutine,
    resetData,
    restoreCourseRoutines,
    restartCourse,
    routineName,
    routines,
    saveReflection,
    saveTodayStandard,
    screen,
    selectTab,
    selectedCat,
    selectedDay,
    selectedScope,
    selectRecordCourse,
    setOverlay,
    setLanguage,
    setNotificationsEnabled,
    setReflectionText,
    setRoutineName,
    setScreen,
    setSelectedCat,
    setSelectedScope,
    setStandardText,
    showTabs,
    showToast,
    sortedRecords,
    startOnboarding,
    state,
    standardText,
    streak,
    toast,
    toggleHaptics,
    toggleNotifications,
    toggleRoutine,
    total,
    undoRoutineRemoval,
  };
}
