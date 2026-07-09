import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';

import { chooseStateForUser, pushRemoteState } from '../backend/alphaRemoteStore';
import {
  STATE_SCHEMA_VERSION,
  STORAGE_KEY,
  categories,
  createInitialState,
  dateForCourseDay,
  getTodayKey,
  scopes,
} from '../data';
import {
  courseStateFor,
  createRecordForDay,
  doneCount,
  elapsedCourseDayForDate,
  mergeRecord,
  nextPhraseTone,
  resetRoutineCompletion,
  routinesForNewDay,
  sortRecords,
  streakCount,
} from '../domain/alpha';
import { AppState, DayRecord, Routine, ScreenName } from '../types';

export type OverlayName = 'finish' | 'reflection' | 'addRoutine' | 'dayDetail' | 'resetData' | 'appInfo' | null;
export type AlphaSyncStatus = {
  mode: 'local' | 'remote' | 'syncing' | 'error';
  lastSyncedAt?: string;
  message: string;
};

export function useAlphaController(syncUserId?: string | null) {
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
  const [syncStatus, setSyncStatus] = useState<AlphaSyncStatus>({
    mode: 'local',
    message: '로컬 저장 중',
  });
  const remoteHydratedForRef = useRef<string | null>(null);

  const todayKey = state.today.date || getTodayKey();
  const routines = state.routinesByDate[todayKey] ?? routinesForNewDay(state);
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
          const hydrated: AppState = {
            ...createInitialState(),
            ...parsed,
            routinesByDate: {
              ...(parsed.routinesByDate ?? {}),
            },
          };
          hydrated.currentCourse = courseStateFor(hydrated, hydrated.today.date, hydrated.records);

          if (parsed.today.date !== currentDate) {
            let records = hydrated.records;
            let routinesByDate = hydrated.routinesByDate;

            if (hydrated.hasOnboarded) {
              const lastClosableDay = Math.min(30, elapsedCourseDayForDate(hydrated.currentCourse.startedAt, currentDate) - 1);
              for (let day = hydrated.currentCourse.day; day <= lastClosableDay; day += 1) {
                if (records.some((record) => record.day === day)) continue;
                const date = day === hydrated.currentCourse.day
                  ? hydrated.today.date
                  : dateForCourseDay(hydrated.currentCourse.startedAt, day);
                const dayRoutines = routinesByDate[date] ?? routinesForNewDay({ ...hydrated, records, routinesByDate });
                const status = doneCount(dayRoutines) === dayRoutines.length ? 'complete' : 'incomplete';
                records = mergeRecord(
                  records,
                  createRecordForDay({
                    closedAt: new Date().toISOString(),
                    date,
                    day,
                    level: hydrated.currentCourse.level,
                    routines: dayRoutines,
                    status,
                  }),
                );
                routinesByDate = {
                  ...routinesByDate,
                  [date]: dayRoutines,
                };
              }
            }

            hydrated.today = {
              date: currentDate,
              isClosed: false,
              hasReflection: false,
              result: null,
            };
            hydrated.routinesByDate = {
              ...routinesByDate,
              [currentDate]: routinesByDate[currentDate] ?? routinesForNewDay({ ...hydrated, records, routinesByDate }),
            };
            hydrated.records = records;
          }
          hydrated.currentCourse = courseStateFor(hydrated, currentDate, hydrated.records);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      .then(async () => {
        if (!syncUserId || remoteHydratedForRef.current !== syncUserId) {
          setSyncStatus({
            mode: 'local',
            message: '로컬 저장 중',
          });
          return;
        }
        setSyncStatus((prev) => ({
          ...prev,
          mode: 'syncing',
          message: '서버 동기화 중',
        }));
        const lastSyncedAt = await pushRemoteState(syncUserId, state);
        setSyncStatus({
          mode: 'remote',
          lastSyncedAt: lastSyncedAt ?? undefined,
          message: '서버 동기화 완료',
        });
      })
      .catch(() => {
        setSyncStatus({
          mode: syncUserId ? 'error' : 'local',
          message: syncUserId ? '서버 동기화 실패' : '로컬 저장 실패',
        });
        showToast('상태 저장에 실패했습니다.');
      });
  }, [ready, state, syncUserId]);

  useEffect(() => {
    if (!ready) return undefined;
    if (!syncUserId) {
      remoteHydratedForRef.current = null;
      setSyncStatus({
        mode: 'local',
        message: '로컬 저장 중',
      });
      return undefined;
    }
    if (remoteHydratedForRef.current === syncUserId) return undefined;

    let mounted = true;
    setSyncStatus({
      mode: 'syncing',
      message: '서버 상태 확인 중',
    });
    chooseStateForUser(syncUserId, state)
      .then(async ({ remoteUpdatedAt, shouldPushLocal, state: nextState }) => {
        if (!mounted) return;
        remoteHydratedForRef.current = syncUserId;
        if (nextState !== state) {
          setState(nextState);
          setScreen(nextState.hasOnboarded ? 'today' : 'onboarding');
        }
        if (shouldPushLocal && !remoteUpdatedAt) {
          const lastSyncedAt = await pushRemoteState(syncUserId, nextState);
          setSyncStatus({
            mode: 'remote',
            lastSyncedAt: lastSyncedAt ?? undefined,
            message: '서버 동기화 완료',
          });
        } else {
          setSyncStatus({
            mode: 'remote',
            lastSyncedAt: remoteUpdatedAt,
            message: '서버 상태 적용 완료',
          });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSyncStatus({
          mode: 'error',
          message: '서버 동기화 실패',
        });
        showToast('원격 동기화에 실패했습니다. 로컬 상태로 계속합니다.');
      });

    return () => {
      mounted = false;
    };
  }, [ready, syncUserId]);

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
      ...createRecordForDay({
        closedAt,
        date: state.today.date,
        day: state.currentCourse.day,
        level: state.currentCourse.level,
        routines,
        status,
      }),
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

  function saveReflection() {
    const text = reflectionText.trim();
    if (!text) {
      showToast('회고를 입력해라.');
      return;
    }

    const closedAt = state.today.closedAt ?? new Date().toISOString();
    const status = state.today.result ?? (done === total ? 'complete' : 'incomplete');
    const record: DayRecord = {
      ...createRecordForDay({
        closedAt,
        date: state.today.date,
        day: state.currentCourse.day,
        level: state.currentCourse.level,
        routines,
        status,
      }),
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

  function removePersonalRoutine(id: string) {
    if (state.today.isClosed) {
      showToast('마감 후에는 루틴을 삭제할 수 없습니다.');
      return;
    }
    updateTodayRoutines(routines.filter((routine) => routine.id !== id));
    showToast('개인 루틴이 삭제되었습니다.');
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

  function cyclePhraseTone() {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        phraseTone: nextPhraseTone(prev.settings.phraseTone),
      },
    }));
  }

  function toggleNotifications() {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: !prev.settings.notificationsEnabled,
      },
    }));
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

  return {
    addPersonalRoutine,
    back,
    closeDay,
    cyclePhraseTone,
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
    syncStatus,
    toast,
    toggleHaptics,
    toggleNotifications,
    toggleRoutine,
    total,
  };
}
