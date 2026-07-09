import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  basicRoutines,
  categories,
  dateForCourseDay,
  displayDate,
  scopes,
  stageForDay,
  stageItems,
} from './src/data';
import { AuthUser } from './src/auth/types';
import { useAlphaAuth } from './src/auth/useAlphaAuth';
import { upsertPushToken } from './src/backend/pushTokenStore';
import { doneCount, resultLabel, stageTitleForDay } from './src/domain/alpha';
import { playHaptic } from './src/device/haptics';
import { getExpoPushTokenIfAvailable, syncDailyCloseReminder } from './src/device/notifications';
import { AlphaSyncStatus, useAlphaController } from './src/state/useAlphaController';
import { colors, radius, spacing, typography } from './src/theme';
import { AppState, DayRecord, Routine, ScreenName } from './src/types';
import { visuals } from './src/visuals';

const mainTabs: Array<{ id: ScreenName; label: string; icon: string }> = [
  { id: 'today', label: '오늘', icon: '□' },
  { id: 'records', label: '기록', icon: '▤' },
  { id: 'course', label: '과정', icon: '◷' },
];

function stagePeriodForDay(day: number) {
  const stage = stageForDay(day);
  if (stage === 1) return 'Day 1 - 7';
  if (stage === 2) return 'Day 8 - 14';
  if (stage === 3) return 'Day 15 - 21';
  return 'Day 22 - 30';
}

function stageQuoteForDay(day: number) {
  const stage = stageForDay(day);
  if (stage === 1) return '“너 자신을 깨워라.”';
  if (stage === 2) return '“몸을 먼저 움직여라.”';
  if (stage === 3) return '“기록은 기준을 만든다.”';
  return '“흔들려도 기준으로 돌아와라.”';
}

function stageBulletsForDay(day: number) {
  const stage = stageForDay(day);
  if (stage === 1) return ['물 500ml', '침대 정리', '푸쉬업 30개'];
  if (stage === 2) return ['기초 루틴 유지', '몸 깨우기 루틴 강화', '미완성도 기록'];
  if (stage === 3) return ['하루 회고 고정', '기록 모음 확인', '개인 루틴 조정'];
  return ['마감 기준 유지', '흔들린 날 복귀', '30일 기록 완성'];
}

function phraseForTone(tone: AppState['settings']['phraseTone']) {
  if (tone === 'hard') return { first: '핑계 없이', second: '움직여라.' };
  if (tone === 'cold') return { first: '기록은', second: '거짓말하지 않는다.' };
  return { first: '흔들려도', second: '이어가라.' };
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AlphaApp />
    </SafeAreaProvider>
  );
}

function AlphaApp() {
  const insets = useSafeAreaInsets();
  const auth = useAlphaAuth();
  const alpha = useAlphaController(auth.user?.remoteBacked ? auth.user.supabaseUserId : null);
  const {
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
  } = alpha;
  const { width: windowWidth } = useWindowDimensions();
  const calendarGap = 8;
  const calendarCellSize = Math.floor((windowWidth - spacing.screenX * 2 - calendarGap * 6) / 7);
  const calendarWidth = calendarCellSize * 7 + calendarGap * 6;
  const hapticsEnabled = state.settings.hapticsEnabled;

  useEffect(() => {
    if (!ready) return;
    syncDailyCloseReminder(state.settings.notificationsEnabled)
      .then((result) => {
        if (result === 'denied') showToast('알림 권한이 꺼져 있습니다.');
      })
      .catch(() => {
        showToast('알림 설정에 실패했습니다.');
      });
  }, [ready, state.settings.notificationsEnabled]);

  useEffect(() => {
    const userId = auth.user?.remoteBacked ? auth.user.supabaseUserId : null;
    if (!ready || !userId || !state.settings.notificationsEnabled) return;

    getExpoPushTokenIfAvailable()
      .then((token) => {
        if (!token) return;
        return upsertPushToken({
          enabled: state.settings.notificationsEnabled,
          token,
          userId,
        });
      })
      .catch(() => undefined);
  }, [auth.user?.remoteBacked, auth.user?.supabaseUserId, ready, state.settings.notificationsEnabled]);

  function withHaptic(type: Parameters<typeof playHaptic>[1], action: () => void) {
    return () => {
      playHaptic(hapticsEnabled, type);
      action();
    };
  }

  function renderScreen() {
    switch (screen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            appleAvailable={auth.appleAvailable}
            authMessage={auth.message}
            authStatus={auth.status}
            googleConfigured={auth.googleConfigured}
            user={auth.user}
            onAppleSignIn={withHaptic('light', auth.signInWithApple)}
            onGoogleSignIn={withHaptic('light', auth.signInWithGoogle)}
            onStart={withHaptic('success', startOnboarding)}
          />
        );
      case 'today':
        return (
          <TodayScreen
            done={done}
            missed={missed}
            rate={rate}
            routines={routines}
            state={state}
            streak={streak}
            total={total}
            onAddRoutine={withHaptic('light', openAddRoutine)}
            onCloseDay={withHaptic('success', closeDay)}
            onOpenReflection={withHaptic('light', () => setOverlay('reflection'))}
            onRemoveRoutine={(id) => {
              playHaptic(hapticsEnabled, 'warning');
              removePersonalRoutine(id);
            }}
            onSettings={withHaptic('selection', () => go('settings'))}
            onToggleRoutine={(id) => {
              playHaptic(hapticsEnabled, 'selection');
              toggleRoutine(id);
            }}
          />
        );
      case 'records':
        return (
          <RecordsScreen
            done={done}
            missed={missed}
            rate={rate}
            records={sortedRecords}
            state={state}
            streak={streak}
            total={total}
            onCollection={withHaptic('selection', () => go('collection'))}
            onDetail={withHaptic('selection', () => go('detail'))}
            onSettings={withHaptic('selection', () => go('settings'))}
          />
        );
      case 'course':
        return (
          <CourseScreen
            state={state}
            onDetail={withHaptic('selection', () => go('detail'))}
            onSettings={withHaptic('selection', () => go('settings'))}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            state={state}
            syncStatus={syncStatus}
            user={auth.user}
            onBack={withHaptic('selection', back)}
            onCyclePhraseTone={withHaptic('selection', cyclePhraseTone)}
            onDataReset={withHaptic('warning', () => setOverlay('resetData'))}
            onHapticsToggle={withHaptic('selection', toggleHaptics)}
            onInfo={withHaptic('selection', () => setOverlay('appInfo'))}
            onLogout={() => {
              playHaptic(hapticsEnabled, 'warning');
              auth.signOut();
              logout();
            }}
            onNotificationsToggle={withHaptic('selection', toggleNotifications)}
            onToast={showToast}
          />
        );
      case 'detail':
        return (
          <DetailScreen
            calendarCellSize={calendarCellSize}
            calendarWidth={calendarWidth}
            state={state}
            onBack={withHaptic('selection', back)}
            onOpenDay={(day) => {
              playHaptic(hapticsEnabled, 'selection');
              openDay(day);
            }}
          />
        );
      case 'collection':
        return <CollectionScreen records={sortedRecords} onBack={withHaptic('selection', back)} />;
      default:
        return null;
    }
  }

  if (!ready || !auth.ready) {
    return (
      <LinearGradient colors={['#020202', '#080808', '#030303']} style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>ALPHA</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#020202', '#080808', '#030303']} style={styles.background}>
        <View
          style={[
            styles.screenHost,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: showTabs ? Math.max(insets.bottom, 7) + spacing.tabHeight + 21 : 0,
            },
          ]}
        >
          {renderScreen()}
        </View>
        {showTabs ? (
          <BottomTabs
            active={screen}
            bottomInset={insets.bottom}
            onPress={selectTab}
          />
        ) : null}
        {toast ? <Toast bottom={showTabs ? insets.bottom + 96 : insets.bottom + 26} message={toast} /> : null}
      </LinearGradient>

      <FinishDayModal
        done={done}
        missed={missed}
        open={overlay === 'finish'}
        result={state.today.result ?? (done === total ? 'complete' : 'incomplete')}
        streak={streak}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onReflection={() => {
          playHaptic(hapticsEnabled, 'light');
          setOverlay('reflection');
        }}
      />
      <ReflectionModal
        open={overlay === 'reflection'}
        text={reflectionText}
        onChangeText={(text) => setReflectionText(text.slice(0, 160))}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onSave={withHaptic('success', saveReflection)}
      />
      <AddRoutineModal
        open={overlay === 'addRoutine'}
        routineName={routineName}
        selectedCat={selectedCat}
        selectedScope={selectedScope}
        onAdd={withHaptic('success', addPersonalRoutine)}
        onChangeName={setRoutineName}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onSelectCat={setSelectedCat}
        onSelectScope={setSelectedScope}
      />
      <DayDetailSheet
        day={selectedDay}
        open={overlay === 'dayDetail'}
        records={state.records}
        routines={routines}
        state={state}
        onClose={withHaptic('selection', () => setOverlay(null))}
      />
      <ResetDataModal
        open={overlay === 'resetData'}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onReset={withHaptic('warning', resetData)}
      />
      <AppInfoModal open={overlay === 'appInfo'} onClose={withHaptic('selection', () => setOverlay(null))} />
    </View>
  );
}

function AppScreen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  );
}

function TopBar({
  title,
  subtitle,
  onBack,
  onSettings,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSettings?: () => void;
}) {
  return (
    <View style={styles.topbar}>
      <View style={styles.backrow}>
        {onBack ? (
          <TouchableOpacity
            accessibilityLabel="뒤로가기"
            accessibilityRole="button"
            activeOpacity={0.78}
            style={styles.iconButton}
            onPress={onBack}
          >
            <Text style={styles.iconText}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <View>
          <Text style={styles.topTitle}>{title}</Text>
          {subtitle ? <Text style={styles.topSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {onSettings ? (
        <TouchableOpacity
          accessibilityLabel="설정"
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.iconButton}
          onPress={onSettings}
        >
          <Text style={styles.iconText}>⚙</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function OnboardingScreen({
  appleAvailable,
  authMessage,
  authStatus,
  googleConfigured,
  user,
  onAppleSignIn,
  onGoogleSignIn,
  onStart,
}: {
  appleAvailable: boolean;
  authMessage: string;
  authStatus: 'idle' | 'loading' | 'error';
  googleConfigured: boolean;
  user: AuthUser | null;
  onAppleSignIn: () => void;
  onGoogleSignIn: () => void;
  onStart: () => void;
}) {
  const signedIn = Boolean(user);
  const providerLabel = user?.provider === 'apple' ? 'Apple' : user?.provider === 'google' ? 'Google' : '';

  return (
    <AppScreen>
      <Text style={styles.alphaTitle}>ALPHA</Text>
      <Text style={styles.subtitle}>흔들려도,{'\n'}이어가라.</Text>
      <Text style={styles.desc}>
        ALPHA는 오늘 루틴을 체크하고, 하루를 마감하고, 회고를 남기며 30일 과정을 이어가는 앱입니다.
      </Text>
      <VisualCard source={visuals.onboarding} style={styles.heroCard}>
        <Text style={styles.heroCaption}>BASIC 과정이 자동으로 시작됩니다.</Text>
      </VisualCard>
      <Card style={styles.howToCard}>
        <HowToStep index="01" text="오늘 루틴을 완료할 때마다 체크합니다." />
        <HowToStep index="02" text="하루 마감으로 완료/미완성을 기록합니다." />
        <HowToStep index="03" text="오늘의 기록에 직접 회고를 남깁니다." />
        <HowToStep index="04" text="기록과 과정에서 30일 흐름을 확인합니다." last />
      </Card>
      <View style={styles.authBlock}>
        {signedIn ? (
          <View style={styles.authSignedCard}>
            <Text style={styles.authSignedLabel}>{providerLabel} 계정으로 로그인됨</Text>
            <Text style={styles.authSignedName}>{user?.name || user?.email || 'ALPHA 사용자'}</Text>
          </View>
        ) : (
          <>
            <AuthButton
              disabled={!appleAvailable || authStatus === 'loading'}
              label="Apple로 계속하기"
              note={!appleAvailable ? '이 기기에서 사용할 수 없음' : undefined}
              onPress={onAppleSignIn}
            />
            <AuthButton
              disabled={!googleConfigured || authStatus === 'loading'}
              label="Google로 계속하기"
              note={!googleConfigured ? 'Google Client ID 설정 필요' : undefined}
              onPress={onGoogleSignIn}
            />
          </>
        )}
        {authMessage ? <Text style={styles.authMessage}>{authMessage}</Text> : null}
      </View>
      <PrimaryButton disabled={!signedIn || authStatus === 'loading'} label="시작하기" onPress={onStart} />
      <Text style={styles.onboardingNote}>로그인 후 BASIC 과정 Day 1/30이 시작됩니다.</Text>
    </AppScreen>
  );
}

function HowToStep({ index, last, text }: { index: string; last?: boolean; text: string }) {
  return (
    <View style={[styles.howToStep, last && styles.howToLast]}>
      <Text style={styles.howToIndex}>{index}</Text>
      <Text style={styles.howToText}>{text}</Text>
    </View>
  );
}

function AuthButton({
  disabled,
  label,
  note,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  note?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      activeOpacity={disabled ? 1 : 0.82}
      disabled={disabled}
      style={[styles.authButton, disabled && styles.authButtonDisabled]}
      onPress={onPress}
    >
      <Text style={[styles.authButtonText, disabled && styles.authButtonTextDisabled]}>{label}</Text>
      {note ? <Text style={styles.authButtonNote}>{note}</Text> : null}
    </TouchableOpacity>
  );
}

function TodayScreen({
  done,
  missed,
  rate,
  routines,
  state,
  streak,
  total,
  onAddRoutine,
  onCloseDay,
  onOpenReflection,
  onRemoveRoutine,
  onSettings,
  onToggleRoutine,
}: {
  done: number;
  missed: number;
  rate: number;
  routines: Routine[];
  state: AppState;
  streak: number;
  total: number;
  onAddRoutine: () => void;
  onCloseDay: () => void;
  onOpenReflection: () => void;
  onRemoveRoutine: (id: string) => void;
  onSettings: () => void;
  onToggleRoutine: (id: string) => void;
}) {
  const actionLabel = state.today.isClosed
    ? state.today.hasReflection
      ? '마감 완료'
      : '하루 회고 작성하기'
    : '하루 마감 ›';
  const actionDisabled = state.today.isClosed && state.today.hasReflection;
  const action = state.today.isClosed && !state.today.hasReflection ? onOpenReflection : onCloseDay;
  const phrase = phraseForTone(state.settings.phraseTone);

  return (
    <AppScreen>
      <TopBar
        title="오늘"
        subtitle={`Day ${state.currentCourse.day} · ${state.currentCourse.level} 과정`}
        onSettings={onSettings}
      />
      <FireCard source={visuals.todayFire} label="오늘의 불씨" first={phrase.first} second={phrase.second} />
      <SectionTitle right={`${done} / ${total} 완료`} title="오늘 요약" />
      <SummaryGrid
        items={[
          { label: '완료', value: String(done) },
          { label: '연속', value: String(streak) },
          { label: '오늘', value: `${rate}%` },
        ]}
      />
      <SectionTitle right={`${done} / ${total} 완료`} title="오늘 루틴" />
      <RoutineList
        locked={state.today.isClosed}
        routines={routines}
        onRemove={onRemoveRoutine}
        onToggle={onToggleRoutine}
      />
      <LinkButton disabled={state.today.isClosed} label="+ 개인 루틴 추가" onPress={onAddRoutine} />
      <View style={styles.stickyButton}>
        <PrimaryButton disabled={actionDisabled} label={actionLabel} onPress={action} />
      </View>
      <View style={styles.hiddenStat}>
        <Text>{missed}</Text>
      </View>
    </AppScreen>
  );
}

function RecordsScreen({
  done,
  missed,
  rate,
  records,
  state,
  streak,
  total,
  onCollection,
  onDetail,
  onSettings,
}: {
  done: number;
  missed: number;
  rate: number;
  records: DayRecord[];
  state: AppState;
  streak: number;
  total: number;
  onCollection: () => void;
  onDetail: () => void;
  onSettings: () => void;
}) {
  const recent = records.slice(0, 3);
  const doneDays = state.records.filter((record) => record.status === 'complete').length;
  const missDays = state.records.filter((record) => record.status === 'incomplete').length;

  return (
    <AppScreen>
      <TopBar title="기록" subtitle="쌓인 기록이 너를 본다" onSettings={onSettings} />
      <FireCard mini source={visuals.recordsHeader} first="연속 완료" second={`${streak}일`} />
      <SectionTitle right={`${done} / ${total} 완료`} title="오늘 요약" />
      <Card style={styles.progressCard}>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${rate}%` }]} />
        </View>
        <SummaryGrid
          compact
          items={[
            { label: '완료', value: String(done) },
            { label: '미완성', value: String(missed) },
            { label: '달성률', value: `${rate}%`, accent: true },
          ]}
        />
      </Card>
      <SectionTitle title="30일 과정 요약" />
      <ProcessCard
        caption={`완료 ${doneDays}일 · 미완성 ${missDays}일`}
        day={state.currentCourse.day}
        progress={state.currentCourse.progress}
      />
      <LinkButton label="30일 기록 보기 ›" onPress={onDetail} />
      <SectionTitle title="최근 기록" />
      {recent.length ? (
        recent.map((record) => <RecordCard key={record.id} record={record} />)
      ) : (
        <RecordCard empty />
      )}
      <LinkButton label="기록 모음 ›" onPress={onCollection} />
    </AppScreen>
  );
}

function CourseScreen({
  state,
  onDetail,
  onSettings,
}: {
  state: AppState;
  onDetail: () => void;
  onSettings: () => void;
}) {
  return (
    <AppScreen>
      <TopBar title="과정" subtitle="현재 과정과 다음 단계" onSettings={onSettings} />
      <ProcessCard
        caption="현재 진행률"
        day={state.currentCourse.day}
        highlighted
        progress={state.currentCourse.progress}
      />
      <LinkButton label="30일 기록 보기 ›" onPress={onDetail} />
      <SectionTitle title="현재 단계" />
      <VisualCard source={visuals.courseStage} style={styles.stepCard}>
        <View style={styles.visualTextLayer}>
          <Text style={styles.stepTitle}>
            {String(state.currentCourse.currentStage).padStart(2, '0')} {stageTitleForDay(state.currentCourse.day)}
          </Text>
          <Text style={styles.period}>{stagePeriodForDay(state.currentCourse.day)}</Text>
          <Text style={styles.quote}>{stageQuoteForDay(state.currentCourse.day)}</Text>
          <Text style={styles.bullet}>이번 단계 기준</Text>
          {stageBulletsForDay(state.currentCourse.day).map((item) => (
            <Text key={item} style={styles.bullet}>- {item}</Text>
          ))}
        </View>
      </VisualCard>
      <SectionTitle title="과정 단계" />
      <StageList currentDay={state.currentCourse.day} />
      <SectionTitle title="다음 과정" />
      <SettingLike label="STANDARD 과정" value="잠김" />
      <SettingLike label="HARD 과정" value="잠김" style={styles.settingGap} />
    </AppScreen>
  );
}

function DetailScreen({
  calendarCellSize,
  calendarWidth,
  state,
  onBack,
  onOpenDay,
}: {
  calendarCellSize: number;
  calendarWidth: number;
  state: AppState;
  onBack: () => void;
  onOpenDay: (day: number) => void;
}) {
  const doneDays = new Set(
    state.records.filter((record) => record.status === 'complete').map((record) => record.day),
  );
  const failDays = new Set(
    state.records.filter((record) => record.status === 'incomplete').map((record) => record.day),
  );

  return (
    <AppScreen>
      <TopBar title="30일 기록" onBack={onBack} />
      <ProcessCard
        caption={`완료 ${doneDays.size}일 · 미완성 ${failDays.size}일`}
        day={state.currentCourse.day}
        progress={state.currentCourse.progress}
      />
      <SectionTitle title="30일 기록" />
      <View style={[styles.grid30, { width: calendarWidth }]}>
        {Array.from({ length: 30 }, (_, index) => {
          const day = index + 1;
          const future = day > state.currentCourse.day;
          const isToday = day === state.currentCourse.day;
          const statusStyle = future
            ? styles.dayFuture
            : doneDays.has(day)
              ? styles.dayDone
              : failDays.has(day)
                ? styles.dayFail
                : null;
          return (
            <TouchableOpacity
              accessibilityLabel={`Day ${day}`}
              accessibilityRole="button"
              activeOpacity={0.8}
              key={day}
              style={[
                styles.dayCell,
                { height: calendarCellSize, width: calendarCellSize },
                statusStyle,
                isToday && styles.dayToday,
              ]}
              onPress={() => onOpenDay(day)}
            >
              <Text style={[styles.dayCellText, future && styles.dayFutureText]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <SectionTitle title="과정 단계" />
      <StageList currentDay={state.currentCourse.day} />
    </AppScreen>
  );
}

function CollectionScreen({ records, onBack }: { records: DayRecord[]; onBack: () => void }) {
  return (
    <AppScreen>
      <TopBar title="기록 모음" onBack={onBack} />
      <FireCard mini source={visuals.recordsHeader} first="남긴 기록 개수" second={`${records.length}개`} />
      <SectionTitle title="날짜별 기록" />
      {records.length ? (
        records.map((record) => <RecordCard key={record.id} record={record} withDate />)
      ) : (
        <RecordCard empty />
      )}
    </AppScreen>
  );
}

function SettingsScreen({
  state,
  syncStatus,
  user,
  onBack,
  onCyclePhraseTone,
  onDataReset,
  onHapticsToggle,
  onInfo,
  onLogout,
  onNotificationsToggle,
  onToast,
}: {
  state: AppState;
  syncStatus: AlphaSyncStatus;
  user: AuthUser | null;
  onBack: () => void;
  onCyclePhraseTone: () => void;
  onDataReset: () => void;
  onHapticsToggle: () => void;
  onInfo: () => void;
  onLogout: () => void;
  onNotificationsToggle: () => void;
  onToast: (message: string) => void;
}) {
  const providerLabel = user?.provider === 'apple' ? 'Apple' : user?.provider === 'google' ? 'Google' : '로그인 없음';
  const phraseLabel = state.settings.phraseTone === 'basic' ? '기본' : state.settings.phraseTone === 'hard' ? '하드' : '냉정';
  const syncLabel =
    syncStatus.mode === 'remote'
      ? '서버 연결'
      : syncStatus.mode === 'syncing'
        ? '동기화 중'
        : syncStatus.mode === 'error'
          ? '확인 필요'
          : '로그인 필요';
  return (
    <AppScreen>
      <TopBar title="설정" onBack={onBack} />
      <Card style={styles.profile}>
        <Image source={visuals.avatar} style={styles.avatar as object} />
        <View>
          <Text style={styles.profileTitle}>{user?.name || user?.email || 'ALPHA'}</Text>
          <Text style={styles.profileLevel}>{providerLabel} · LEVEL 1</Text>
        </View>
      </Card>
      <View style={styles.settingsList}>
        <SettingRow label="문구 톤 설정" value={phraseLabel} onPress={onCyclePhraseTone} />
        <SettingRow
          label="알림 설정"
          value={state.settings.notificationsEnabled ? 'ON' : 'OFF'}
          onPress={onNotificationsToggle}
        />
        <SettingRow
          label="탭 피드백 설정"
          value={state.settings.hapticsEnabled ? '진동' : 'OFF'}
          onPress={onHapticsToggle}
        />
        <SettingRow label="동기화 상태" value={syncLabel} onPress={() => onToast(syncStatus.message)} />
        <SettingRow label="데이터 초기화" onPress={onDataReset} />
        <SettingRow label="앱 정보" value="v19" onPress={onInfo} />
      </View>
      <SecondaryButton label="로그아웃" danger onPress={onLogout} />
    </AppScreen>
  );
}

function VisualCard({
  children,
  source,
  style,
  overlayOpacity = 0.2,
}: {
  children?: React.ReactNode;
  source: number;
  style?: object;
  overlayOpacity?: number;
}) {
  return (
    <ImageBackground
      imageStyle={styles.visualImage as object}
      resizeMode="cover"
      source={source}
      style={[styles.card, style]}
    >
      <LinearGradient
        colors={[`rgba(0,0,0,${overlayOpacity + 0.3})`, `rgba(0,0,0,${overlayOpacity})`, 'rgba(0,0,0,0.38)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.visualOverlay}
      />
      {children}
    </ImageBackground>
  );
}

function FireCard({
  first,
  label,
  mini,
  second,
  source,
}: {
  first: string;
  label?: string;
  mini?: boolean;
  second: string;
  source: number;
}) {
  return (
    <ImageBackground
      imageStyle={styles.visualImage as object}
      resizeMode="cover"
      source={source}
      style={[styles.card, styles.fireCard, mini && styles.fireMini]}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.66)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0.32)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.visualOverlay}
      />
      {label ? <Text style={styles.fireLabel}>{label}</Text> : null}
      <View style={styles.fireTextWrap}>
        <Text style={[styles.fireText, mini && styles.fireTextMini]}>{first}</Text>
        <Text style={[styles.fireText, styles.fireAccent, mini && styles.fireTextMini]}>{second}</Text>
      </View>
    </ImageBackground>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function PrimaryButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      activeOpacity={disabled ? 1 : 0.82}
      disabled={disabled}
      onPress={onPress}
    >
      <LinearGradient
        colors={disabled ? ['#323236', '#171719'] : ['#f51c1c', '#a70707']}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonDisabledText]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  danger,
  label,
  onPress,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.82}
      style={[styles.secondaryButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <Text style={[styles.secondaryButtonText, danger && styles.dangerText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LinkButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      activeOpacity={disabled ? 1 : 0.82}
      disabled={disabled}
      style={[styles.linkButton, disabled && styles.disabledLink]}
      onPress={onPress}
    >
      <Text style={[styles.linkText, disabled && styles.disabledText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ right, title }: { right?: string; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionText}>{title}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

function SummaryGrid({
  compact,
  items,
}: {
  compact?: boolean;
  items: Array<{ accent?: boolean; label: string; value: string }>;
}) {
  return (
    <View style={[styles.summaryGrid, compact && styles.summaryCompact]}>
      {items.map((item) => (
        <View key={item.label} style={styles.stat}>
          <Text style={[styles.statNum, item.accent && styles.redText]}>{item.value}</Text>
          <Text style={styles.statName}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function RoutineList({
  locked,
  routines,
  onRemove,
  onToggle,
}: {
  locked?: boolean;
  routines: Routine[];
  onRemove?: (id: string) => void;
  onToggle?: (id: string) => void;
}) {
  return (
    <View style={styles.routineList}>
      {routines.map((routine, index) => (
        <TouchableOpacity
          accessibilityLabel={routine.name}
          accessibilityRole="button"
          accessibilityState={{ checked: routine.done, disabled: Boolean(locked) }}
          activeOpacity={locked ? 1 : 0.78}
          key={routine.id}
          style={[styles.routineRow, index === routines.length - 1 && styles.lastRow]}
          onPress={() => onToggle?.(routine.id)}
        >
          <View style={[styles.check, routine.done && styles.checkDone]}>
            <Text style={styles.checkText}>{routine.done ? '✓' : ''}</Text>
          </View>
          <Text style={[styles.routineText, locked && styles.lockedText]}>{routine.name}</Text>
          {routine.type === 'personal' ? <Text style={styles.personalBadge}>개인</Text> : null}
          {routine.type === 'personal' && !locked ? (
            <TouchableOpacity
              accessibilityLabel={`${routine.name} 삭제`}
              accessibilityRole="button"
              activeOpacity={0.78}
              style={styles.removeRoutineButton}
              onPress={() => onRemove?.(routine.id)}
            >
              <Text style={styles.removeRoutineText}>×</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.chev}>{locked ? '잠김' : '›'}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ProcessCard({
  caption,
  day,
  highlighted,
  progress,
}: {
  caption: string;
  day: number;
  highlighted?: boolean;
  progress: number;
}) {
  return (
    <Card style={[styles.processCard, highlighted && styles.processHighlighted]}>
      <View>
        <Text style={styles.processTitle}>BASIC 과정</Text>
        <Text style={styles.processDay}>Day {day} / 30</Text>
        <Text style={styles.processCaption}>{caption}</Text>
      </View>
      <View style={styles.ring}>
        <View style={styles.ringInner}>
          <Text style={styles.ringText}>{progress}%</Text>
        </View>
      </View>
    </Card>
  );
}

function RecordCard({
  empty,
  record,
  withDate,
}: {
  empty?: boolean;
  record?: DayRecord;
  withDate?: boolean;
}) {
  if (empty || !record) {
    return (
      <Card style={styles.recordCard}>
        <Text style={styles.recordDay}>아직 기록 없음</Text>
        <Text style={styles.recordText}>기록을 남기지 않았다.</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.recordCard}>
      <Text style={styles.recordDay}>
        {withDate ? `${displayDate(record.date)} · ` : ''}Day {record.day} ·{' '}
        <Text style={styles.badge}>{resultLabel(record.status)}</Text>
      </Text>
      <Text style={styles.recordText}>{record.reflection || '기록을 남기지 않았다.'}</Text>
      <Text style={styles.recordArrow}>›</Text>
    </Card>
  );
}

function StageList({ currentDay }: { currentDay: number }) {
  const activeStage = stageForDay(currentDay);
  return (
    <View style={styles.stageList}>
      {stageItems.map((item, index) => (
        <StageItem
          activeStage={activeStage}
          index={index}
          item={item}
          key={item.number}
        />
      ))}
    </View>
  );
}

function StageItem({
  activeStage,
  index,
  item,
}: {
  activeStage: number;
  index: number;
  item: (typeof stageItems)[number];
}) {
  const stageNumber = index + 1;
  const state = stageNumber < activeStage ? 'done' : stageNumber === activeStage ? 'active' : 'locked';

  return (
    <View
      style={[
        styles.stageItem,
        index === stageItems.length - 1 && styles.lastRow,
        state === 'active' && styles.stageActive,
        state === 'locked' && styles.stageLocked,
      ]}
    >
      {state === 'active' ? <View pointerEvents="none" style={styles.stageActiveBorder} /> : null}
      <Text style={[styles.stageNumber, state === 'active' && styles.stageActiveText]}>
        {item.number}
      </Text>
      <Text style={[styles.stageTitle, state === 'active' && styles.stageActiveText]}>{item.title}</Text>
      <Text style={styles.stagePeriod}>{item.period}</Text>
      <Text style={styles.stageState}>{state === 'done' ? '✓' : state === 'active' ? '●' : '잠김'}</Text>
    </View>
  );
}

function SettingLike({ label, style, value }: { label: string; style?: object; value?: string }) {
  return (
    <View style={[styles.settingLike, style]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Text style={styles.settingArrow}>›</Text>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.8}
      style={styles.settingRow}
      onPress={onPress}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );
}

function BottomTabs({
  active,
  bottomInset,
  onPress,
}: {
  active: ScreenName;
  bottomInset: number;
  onPress: (screen: ScreenName) => void;
}) {
  return (
    <View style={[styles.tabs, { bottom: Math.max(bottomInset, 7) + 13 }]}>
      {mainTabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <TouchableOpacity
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            activeOpacity={0.82}
            key={tab.id}
            style={[styles.tab, selected && styles.tabActive]}
            onPress={() => onPress(tab.id)}
          >
            <Text style={[styles.tabIcon, selected && styles.tabActiveText]}>{tab.icon}</Text>
            <Text style={[styles.tabText, selected && styles.tabActiveText]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BaseModal({
  alignBottom,
  children,
  open,
  onClose,
}: {
  alignBottom?: boolean;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={open} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalOverlay, alignBottom && styles.modalBottomOverlay]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FinishDayModal({
  done,
  missed,
  open,
  result,
  streak,
  onClose,
  onReflection,
}: {
  done: number;
  missed: number;
  open: boolean;
  result: 'complete' | 'incomplete';
  streak: number;
  onClose: () => void;
  onReflection: () => void;
}) {
  const complete = result === 'complete';
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.finishModal}>
        <TouchableOpacity
          accessibilityLabel="닫기"
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <View style={[styles.finishHero, !complete && styles.finishHeroFail]}>
          <View style={styles.resultIcon}>
            <Text style={styles.resultIconText}>{complete ? '✓' : '!'}</Text>
          </View>
          <Text style={[styles.finishTitle, !complete && styles.failTitle]}>{complete ? '완료.' : '미완성.'}</Text>
          <Text style={styles.finishCopy}>
            {complete ? '오늘은 도망치지 않았다.' : '남은 루틴은 기록에 남았다.'}
          </Text>
        </View>
        <View style={styles.resultTable}>
          <ResultRow label="완료 루틴" value={`${done}개`} />
          <ResultRow label="미완성 루틴" value={`${missed}개`} />
          <ResultRow label="연속 완료" value={`${streak}일`} last />
        </View>
        <PrimaryButton label="하루 회고 작성하기" onPress={onReflection} />
        <View style={styles.modalButtonGap}>
          <SecondaryButton label="닫기" onPress={onClose} />
        </View>
      </View>
    </BaseModal>
  );
}

function ReflectionModal({
  open,
  text,
  onChangeText,
  onClose,
  onSave,
}: {
  open: boolean;
  text: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>하루 회고</Text>
          <TouchableOpacity accessibilityLabel="닫기" accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.field}>오늘의 기록</Text>
        <TextInput
          maxLength={160}
          multiline
          placeholder=""
          placeholderTextColor={colors.muted}
          style={styles.textarea}
          textAlignVertical="top"
          value={text}
          onChangeText={onChangeText}
        />
        <Text style={styles.counter}>{text.length} / 160</Text>
        <View style={styles.row2}>
          <SecondaryButton label="취소" onPress={onClose} />
          <PrimaryButton label="저장" onPress={onSave} />
        </View>
      </View>
    </BaseModal>
  );
}

function AddRoutineModal({
  open,
  routineName,
  selectedCat,
  selectedScope,
  onAdd,
  onChangeName,
  onClose,
  onSelectCat,
  onSelectScope,
}: {
  open: boolean;
  routineName: string;
  selectedCat: (typeof categories)[number];
  selectedScope: (typeof scopes)[number];
  onAdd: () => void;
  onChangeName: (name: string) => void;
  onClose: () => void;
  onSelectCat: (category: (typeof categories)[number]) => void;
  onSelectScope: (scope: (typeof scopes)[number]) => void;
}) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>개인 루틴 추가</Text>
          <TouchableOpacity accessibilityLabel="닫기" accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.field}>루틴명</Text>
        <TextInput
          placeholder="예) 턱걸이 10개"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={routineName}
          onChangeText={onChangeName}
        />
        <Text style={styles.field}>카테고리</Text>
        <View style={styles.chips}>
          {categories.map((category) => (
            <TouchableOpacity
              accessibilityLabel={category}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCat === category }}
              activeOpacity={0.8}
              key={category}
              style={[styles.chip, selectedCat === category && styles.chipActive]}
              onPress={() => onSelectCat(category)}
            >
              <Text style={[styles.chipText, selectedCat === category && styles.chipActiveText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.field}>적용 범위</Text>
        <View style={styles.row2}>
          {scopes.map((scope) => (
            <TouchableOpacity
              accessibilityLabel={scope}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedScope === scope }}
              activeOpacity={0.8}
              key={scope}
              style={[styles.seg, selectedScope === scope && styles.segActive]}
              onPress={() => onSelectScope(scope)}
            >
              <Text style={[styles.segText, selectedScope === scope && styles.segActiveText]}>{scope}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row2WithTop}>
          <SecondaryButton label="취소" onPress={onClose} />
          <PrimaryButton label="추가" onPress={onAdd} />
        </View>
      </View>
    </BaseModal>
  );
}

function ResetDataModal({
  open,
  onClose,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>데이터 초기화</Text>
          <TouchableOpacity accessibilityLabel="닫기" accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resetCopy}>현재 루틴 체크, 마감 기록, 회고, 과정 진행률을 처음 상태로 되돌립니다.</Text>
        <View style={styles.row2WithTop}>
          <SecondaryButton label="취소" onPress={onClose} />
          <PrimaryButton label="초기화" onPress={onReset} />
        </View>
      </View>
    </BaseModal>
  );
}

function AppInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>앱 정보</Text>
          <TouchableOpacity accessibilityLabel="닫기" accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <DateRow label="앱" value="ALPHA: REFORGE" />
        <DateRow label="버전" value="v19 · iOS 1.0.0" />
        <DateRow label="과정" value="BASIC 30일" />
        <DateRow label="저장" value="이 기기 AsyncStorage" />
        <View style={styles.modalButtonGap}>
          <SecondaryButton label="닫기" onPress={onClose} />
        </View>
      </View>
    </BaseModal>
  );
}

function DayDetailSheet({
  day,
  open,
  records,
  routines,
  state,
  onClose,
}: {
  day: number | null;
  open: boolean;
  records: DayRecord[];
  routines: Routine[];
  state: AppState;
  onClose: () => void;
}) {
  const selected = day ?? state.currentCourse.day;
  const future = selected > state.currentCourse.day;
  const record = records.find((item) => item.day === selected);
  const today = selected === state.currentCourse.day;
  const date = future
    ? dateForCourseDay(state.currentCourse.startedAt, selected)
    : record?.date ?? (today ? state.today.date : dateForCourseDay(state.currentCourse.startedAt, selected));
  const shownRoutines = today ? routines : state.routinesByDate[date] ?? basicRoutines;
  const completed = today ? doneCount(routines) : record ? record.completedRoutineIds.length : 0;
  const status = future ? '예정' : record ? resultLabel(record.status) : today ? '진행 중' : '미완성';
  const note = future ? '아직 기록이 없습니다.' : record?.reflection || '기록을 남기지 않았다.';

  return (
    <BaseModal alignBottom open={open} onClose={onClose}>
      <View style={styles.bottomSheet}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>Day {selected}</Text>
          <TouchableOpacity accessibilityLabel="닫기" accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <DateRow label="날짜" value={displayDate(date)} />
        <DateRow accent={!future && status === '미완성'} label="상태" muted={future} value={status} />
        <DateRow
          label="단계"
          value={`${String(stageForDay(selected)).padStart(2, '0')}. ${stageTitleForDay(selected)}`}
        />
        <DateRow label="루틴 완료" value={future ? '-' : `${completed} / ${shownRoutines.length}`} />
        <SectionTitle title="기본 루틴" />
        <RoutineList
          locked
          routines={shownRoutines.map((routine, index) => ({
            ...routine,
            done: future ? false : today ? routine.done : record ? record.completedRoutineIds.includes(routine.id) : false,
          }))}
        />
        <SectionTitle title="하루 회고" />
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      </View>
    </BaseModal>
  );
}

function ResultRow({ label, last, value }: { label: string; last?: boolean; value: string }) {
  return (
    <View style={[styles.resultRow, last && styles.lastRow]}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

function DateRow({
  accent,
  label,
  muted,
  value,
}: {
  accent?: boolean;
  label: string;
  muted?: boolean;
  value: string;
}) {
  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={[styles.dateValue, accent && styles.redText, muted && styles.mutedText]}>{value}</Text>
    </View>
  );
}

function Toast({ bottom, message }: { bottom: number; message: string }) {
  return (
    <View style={[styles.toast, { bottom }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    ...typography,
  },
  background: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.red,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 0,
  },
  screenHost: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
    paddingHorizontal: spacing.screenX,
  },
  topbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
    minHeight: 42,
  },
  backrow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  topTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 24,
  },
  topSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  alphaTitle: {
    color: colors.red,
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 65,
    marginTop: 2,
    textShadowColor: 'rgba(241,25,25,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  subtitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
    marginBottom: 18,
  },
  desc: {
    color: '#c7c7ca',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.line,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  visualImage: {
    borderRadius: radius.card,
  },
  visualOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroCard: {
    borderColor: 'rgba(241,25,25,0.36)',
    height: 385,
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  heroCaption: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 60,
    marginLeft: 18,
  },
  onboardingNote: {
    color: '#777',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 16,
  },
  howToCard: {
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  howToStep: {
    alignItems: 'center',
    borderBottomColor: colors.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
  },
  howToLast: {
    borderBottomWidth: 0,
  },
  howToIndex: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
    width: 24,
  },
  howToText: {
    color: colors.soft,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  authBlock: {
    gap: 8,
    marginBottom: 12,
  },
  authButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.button,
    borderWidth: 1,
    height: spacing.buttonHeight,
    justifyContent: 'center',
  },
  authButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  authButtonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '900',
  },
  authButtonTextDisabled: {
    color: '#85858a',
  },
  authButtonNote: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },
  authSignedCard: {
    backgroundColor: 'rgba(241,25,25,0.12)',
    borderColor: 'rgba(241,25,25,0.34)',
    borderRadius: radius.button,
    borderWidth: 1,
    minHeight: spacing.buttonHeight,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  authSignedLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '900',
  },
  authSignedName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  authMessage: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  fireCard: {
    borderColor: 'rgba(241,25,25,0.42)',
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 2,
    padding: 16,
  },
  fireMini: {
    height: 108,
    justifyContent: 'center',
  },
  fireLabel: {
    color: '#e7e7e7',
    fontSize: 11,
    fontWeight: '900',
    left: 16,
    position: 'absolute',
    top: 14,
  },
  fireTextWrap: {
    zIndex: 2,
  },
  fireText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 37,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  fireTextMini: {
    fontSize: 25,
    lineHeight: 27,
  },
  fireAccent: {
    color: colors.red,
  },
  section: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
    marginHorizontal: 2,
    marginTop: 18,
  },
  sectionText: {
    color: '#eeeeee',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionRight: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCompact: {
    marginTop: 13,
  },
  stat: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.stat,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
  },
  statNum: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  statName: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  routineList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.11)',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  routineRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.075)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  check: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkDone: {
    backgroundColor: colors.red,
    borderColor: '#ff4747',
    shadowColor: colors.red,
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  checkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  routineText: {
    color: '#f1f1f1',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  lockedText: {
    color: colors.soft,
  },
  personalBadge: {
    borderColor: 'rgba(241,25,25,0.35)',
    borderRadius: 999,
    borderWidth: 1,
    color: colors.red,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  chev: {
    color: '#777',
    fontSize: 12,
    fontWeight: '800',
  },
  removeRoutineButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  removeRoutineText: {
    color: colors.red,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  linkButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    height: 45,
    justifyContent: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#f3f3f3',
    fontSize: 13,
    fontWeight: '900',
  },
  disabledLink: {
    opacity: 0.55,
  },
  disabledText: {
    color: '#8a8a8f',
  },
  stickyButton: {
    marginTop: 16,
  },
  hiddenStat: {
    height: 0,
    opacity: 0,
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.button,
    height: spacing.buttonHeight,
    justifyContent: 'center',
    shadowColor: colors.red,
    shadowOpacity: 0.26,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
  },
  buttonDisabled: {
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  buttonDisabledText: {
    color: '#aaa',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.button,
    borderWidth: 1,
    flex: 1,
    height: spacing.buttonHeight,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  dangerButton: {
    flex: 0,
    marginTop: 14,
  },
  dangerText: {
    color: colors.red,
  },
  progressCard: {
    padding: 15,
  },
  progress: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 9,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.red,
    borderRadius: 999,
    height: '100%',
  },
  processCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  processHighlighted: {
    borderColor: 'rgba(241,25,25,0.32)',
  },
  processTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  processDay: {
    color: colors.red,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  processCaption: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  ring: {
    alignItems: 'center',
    backgroundColor: 'rgba(241,25,25,0.22)',
    borderColor: colors.red,
    borderRadius: 30,
    borderWidth: 8,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  ringInner: {
    alignItems: 'center',
    backgroundColor: '#101012',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  ringText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  recordCard: {
    marginBottom: 10,
    minHeight: 74,
    padding: 14,
  },
  recordDay: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  badge: {
    color: colors.red,
    fontWeight: '900',
  },
  recordText: {
    color: '#e9e9e9',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    paddingRight: 18,
  },
  recordArrow: {
    color: '#777',
    fontSize: 27,
    position: 'absolute',
    right: 14,
    top: 25,
  },
  stepCard: {
    borderColor: 'rgba(241,25,25,0.3)',
    minHeight: 152,
    padding: 16,
  },
  visualTextLayer: {
    zIndex: 2,
  },
  stepTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 5,
  },
  period: {
    color: '#9a9aa0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 16,
  },
  quote: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  bullet: {
    color: '#eeeeee',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 19,
  },
  stageList: {
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stageItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.027)',
    borderBottomColor: 'rgba(255,255,255,0.075)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 47,
    paddingHorizontal: 12,
    position: 'relative',
  },
  stageActive: {
    backgroundColor: 'rgba(241,25,25,0.08)',
  },
  stageActiveBorder: {
    borderColor: 'rgba(241,25,25,0.72)',
    borderWidth: 1,
    bottom: 0,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 0,
  },
  stageLocked: {
    opacity: 0.55,
  },
  stageNumber: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '900',
    width: 42,
  },
  stageTitle: {
    color: colors.white,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  stageActiveText: {
    color: colors.red,
  },
  stagePeriod: {
    color: '#9a9aa0',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
    width: 82,
  },
  stageState: {
    color: '#777',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
    width: 34,
  },
  settingLike: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 14,
  },
  settingGap: {
    marginTop: 8,
  },
  settingsList: {
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 19,
    borderWidth: 1,
    marginTop: 14,
    overflow: 'hidden',
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderBottomColor: 'rgba(255,255,255,0.075)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 14,
  },
  settingLabel: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  settingValue: {
    color: '#777',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 10,
  },
  settingArrow: {
    color: '#777',
    fontSize: 18,
    fontWeight: '800',
  },
  grid30: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  dayDone: {
    backgroundColor: 'rgba(241,25,25,0.25)',
    borderColor: 'rgba(241,25,25,0.7)',
  },
  dayFail: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(241,25,25,0.58)',
  },
  dayToday: {
    shadowColor: colors.red,
    shadowOpacity: 0.38,
    shadowRadius: 16,
  },
  dayFuture: {
    opacity: 0.55,
  },
  dayCellText: {
    color: '#d0d0d3',
    fontSize: 12,
    fontWeight: '900',
  },
  dayFutureText: {
    color: '#69696d',
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    padding: 15,
  },
  avatar: {
    borderColor: 'rgba(241,25,25,0.4)',
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    width: 58,
  },
  profileTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  profileLevel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  tabs: {
    backgroundColor: 'rgba(7,7,8,0.94)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.tab,
    borderWidth: 1,
    flexDirection: 'row',
    height: spacing.tabHeight,
    left: 10,
    padding: 7,
    position: 'absolute',
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.42,
    shadowRadius: 35,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 17,
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(241,25,25,0.09)',
  },
  tabIcon: {
    color: '#777',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 20,
  },
  tabText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '900',
  },
  tabActiveText: {
    color: colors.red,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  modalBottomOverlay: {
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  finishModal: {
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderRadius: radius.modal,
    borderWidth: 1,
    padding: 18,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 3,
  },
  closeText: {
    color: '#ddd',
    fontSize: 25,
    fontWeight: '500',
  },
  finishHero: {
    alignItems: 'center',
    backgroundColor: '#0b0b0c',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  finishHeroFail: {
    backgroundColor: '#0d0505',
  },
  resultIcon: {
    alignItems: 'center',
    borderColor: colors.red,
    borderRadius: 41,
    borderWidth: 2,
    height: 82,
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.red,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    width: 82,
  },
  resultIconText: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '900',
  },
  finishTitle: {
    color: '#f4f4f5',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 10,
  },
  failTitle: {
    color: colors.red,
  },
  finishCopy: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
    textAlign: 'center',
  },
  resultTable: {
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 12,
    marginTop: 14,
    overflow: 'hidden',
  },
  resultRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomColor: 'rgba(255,255,255,0.075)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  resultLabel: {
    color: '#b8b8bd',
    fontSize: 13,
    fontWeight: '800',
  },
  resultValue: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  modalButtonGap: {
    marginTop: 10,
  },
  centerModal: {
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderRadius: radius.modal,
    borderWidth: 1,
    padding: 18,
    width: '100%',
  },
  modalHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  field: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 16,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.white,
    fontSize: 15,
    height: 190,
    lineHeight: 24,
    padding: 13,
  },
  counter: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  resetCopy: {
    color: colors.soft,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.white,
    fontSize: 15,
    height: 48,
    paddingHorizontal: 13,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  row2WithTop: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 58,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.red2,
    borderColor: '#ff5151',
  },
  chipText: {
    color: '#ddd',
    fontSize: 11,
    fontWeight: '900',
  },
  chipActiveText: {
    color: colors.white,
  },
  seg: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 46,
    justifyContent: 'center',
  },
  segActive: {
    backgroundColor: 'rgba(241,25,25,0.18)',
    borderColor: 'rgba(241,25,25,0.65)',
  },
  segText: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '900',
  },
  segActiveText: {
    color: colors.white,
  },
  bottomSheet: {
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    borderWidth: 1,
    maxHeight: '88%',
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 19,
    width: '100%',
  },
  dateRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dateLabel: {
    color: '#8b8b90',
    fontSize: 12,
    fontWeight: '800',
  },
  dateValue: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  noteBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    padding: 14,
  },
  noteText: {
    color: '#f0f0f1',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 22,
  },
  redText: {
    color: colors.red,
  },
  mutedText: {
    color: colors.muted,
  },
  toast: {
    backgroundColor: '#141416',
    borderColor: 'rgba(241,25,25,0.45)',
    borderRadius: 18,
    borderWidth: 1,
    left: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 45,
    zIndex: 20,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
