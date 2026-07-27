import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { ImageResult } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  StyleProp,
  Text,
  TextStyle,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  categories,
  courseRoutinesFor,
  courseStageForDay,
  courseStages,
  dateForCourseDay,
  scopes,
  stageForDay,
} from './src/data';
import { CardImageCropEditor } from './src/components/CardImageCropEditor';
import { courseDoneCount, courseRoutineTotal } from './src/domain/alpha';
import { playHaptic } from './src/device/haptics';
import { syncDailyCloseReminder } from './src/device/notifications';
import { createI18n, I18nContext, supportedLanguages, useI18n } from './src/i18n';
import { useAlphaController } from './src/state/useAlphaController';
import { CardVisualTarget, useCardVisuals } from './src/state/useCardVisuals';
import { colors, radius, spacing, typography } from './src/theme';
import { AppState, DayRecord, Routine, ScreenName, SupportedLanguage } from './src/types';
import { visuals } from './src/visuals';

const mainTabs: Array<{ id: 'today' | 'records' | 'course'; icon: string }> = [
  { id: 'today', icon: '□' },
  { id: 'records', icon: '▤' },
  { id: 'course', icon: '◷' },
];

type CardVisualFrame = {
  height: number;
  width: number;
};

type CardVisualSelection = {
  aspectRatio: number;
  target: CardVisualTarget;
};

const fallbackCardAspectRatios: Record<CardVisualTarget, number> = {
  today: 358 / 150,
  records: 358 / 108,
  course: 358 / 200,
};

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AlphaApp />
    </SafeAreaProvider>
  );
}

function AlphaApp() {
  const insets = useSafeAreaInsets();
  const alpha = useAlphaController();
  const cardVisuals = useCardVisuals();
  const [cardVisualSelection, setCardVisualSelection] = useState<CardVisualSelection | null>(null);
  const [cardCropSelection, setCardCropSelection] = useState<{
    aspectRatio: number;
    asset: ImagePicker.ImagePickerAsset;
    target: CardVisualTarget;
  } | null>(null);
  const {
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
  } = alpha;
  const { width: windowWidth } = useWindowDimensions();
  const calendarGap = 8;
  const calendarCellSize = Math.floor((windowWidth - spacing.screenX * 2 - calendarGap * 6) / 7);
  const calendarWidth = calendarCellSize * 7 + calendarGap * 6;
  const hapticsEnabled = state.settings.hapticsEnabled;
  const i18n = createI18n(state.settings.language ?? 'system');
  const { t } = i18n;
  const cardSources: Record<CardVisualTarget, ImageSourcePropType> = {
    today: cardVisuals.uris.today ? { uri: cardVisuals.uris.today } : visuals.todayFire,
    records: cardVisuals.uris.records ? { uri: cardVisuals.uris.records } : visuals.recordsHeader,
    course: cardVisuals.uris.course ? { uri: cardVisuals.uris.course } : visuals.courseStage,
  };

  useEffect(() => {
    if (!ready || !state.hasOnboarded) return;
    syncDailyCloseReminder(state.settings.notificationsEnabled, state.settings.language)
      .then((result) => {
        if (result === 'denied') {
          setNotificationsEnabled(false);
          showToast(t('notificationDenied'));
        }
      })
      .catch(() => {
        showToast(t('notificationFailed'));
      });
  }, [ready, state.hasOnboarded, state.settings.language, state.settings.notificationsEnabled]);

  function withHaptic(type: Parameters<typeof playHaptic>[1], action: () => void) {
    return () => {
      playHaptic(hapticsEnabled, type);
      action();
    };
  }

  function openCardVisual(target: CardVisualTarget, frame: CardVisualFrame | null) {
    const measuredAspectRatio = frame && frame.width > 0 && frame.height > 0
      ? frame.width / frame.height
      : fallbackCardAspectRatios[target];
    playHaptic(hapticsEnabled, 'selection');
    setCardVisualSelection({ aspectRatio: measuredAspectRatio, target });
  }

  async function chooseCardImage(selection: CardVisualSelection) {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast(t('imagePermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 0.9,
        selectionLimit: 1,
      });
      if (result.canceled) return;

      setCardCropSelection({
        aspectRatio: selection.aspectRatio,
        asset: result.assets[0],
        target: selection.target,
      });
    } catch {
      showToast(t('imageSaveFailed'));
    } finally {
      setCardVisualSelection(null);
    }
  }

  async function saveCroppedCardImage(target: CardVisualTarget, image: ImageResult) {
    await cardVisuals.save(target, {
      fileName: `${target}.jpg`,
      mimeType: 'image/jpeg',
      uri: image.uri,
    });
    setCardCropSelection(null);
    playHaptic(hapticsEnabled, 'success');
    showToast(t('imageUpdatedToast'));
  }

  async function restoreCardImage(target: CardVisualTarget) {
    setCardVisualSelection(null);
    try {
      await cardVisuals.restoreDefault(target);
      playHaptic(hapticsEnabled, 'selection');
      showToast(t('imageResetToast'));
    } catch {
      showToast(t('imageSaveFailed'));
    }
  }

  function renderScreen() {
    switch (screen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            onStart={withHaptic('success', startOnboarding)}
          />
        );
      case 'today':
        return (
          <TodayScreen
            done={done}
            missed={missed}
            rate={rate}
            courseComplete={courseComplete}
            coursePassed={coursePassed}
            routines={routines}
            state={state}
            streak={streak}
            total={total}
            visualSource={cardSources.today}
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
            onVisualPress={(frame) => openCardVisual('today', frame)}
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
            visualSource={cardSources.records}
            onCollection={withHaptic('selection', () => go('collection'))}
            onDetail={withHaptic('selection', () => go('detail'))}
            onSettings={withHaptic('selection', () => go('settings'))}
            onVisualPress={(frame) => openCardVisual('records', frame)}
          />
        );
      case 'course':
        return (
          <CourseScreen
            courseComplete={courseComplete}
            coursePassed={coursePassed}
            courseRestartAvailable={courseRestartAvailable}
            nextCourseAvailable={nextCourseAvailable}
            state={state}
            visualSource={cardSources.course}
            onDetail={withHaptic('selection', () => go('detail'))}
            onSettings={withHaptic('selection', () => go('settings'))}
            onStartNextCourse={withHaptic('success', beginNextCourse)}
            onRestartCourse={withHaptic('warning', restartCourse)}
            onVisualPress={(frame) => openCardVisual('course', frame)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            state={state}
            onBack={withHaptic('selection', back)}
            onDataReset={withHaptic('warning', () => setOverlay('resetData'))}
            onHapticsToggle={withHaptic('selection', toggleHaptics)}
            onInfo={withHaptic('selection', () => setOverlay('appInfo'))}
            onLanguage={withHaptic('selection', () => setOverlay('language'))}
            onNotificationsToggle={withHaptic('selection', toggleNotifications)}
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
        return (
          <CollectionScreen
            records={sortedRecords}
            visualSource={cardSources.records}
            onBack={withHaptic('selection', back)}
            onVisualPress={(frame) => openCardVisual('records', frame)}
          />
        );
      default:
        return null;
    }
  }

  if (!ready || !cardVisuals.ready) {
    return (
      <LinearGradient colors={['#020202', '#080808', '#030303']} style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>ALPHA</Text>
      </LinearGradient>
    );
  }

  return (
    <I18nContext.Provider value={i18n}>
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={['#020202', '#080808', '#030303']} style={styles.background}>
        <View
          style={[
            styles.screenHost,
            {
              paddingTop: screen === 'onboarding' ? 0 : Math.max(insets.top, 24),
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
        onCancel={withHaptic('warning', undoCloseDay)}
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
        records={sortedRecords}
        routines={routines}
        state={state}
        onClose={withHaptic('selection', () => setOverlay(null))}
      />
      <ResetDataModal
        open={overlay === 'resetData'}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onReset={withHaptic('warning', resetData)}
      />
      <AppInfoModal
        level={state.currentCourse.level}
        open={overlay === 'appInfo'}
        onClose={withHaptic('selection', () => setOverlay(null))}
      />
      <LanguageModal
        language={state.settings.language ?? 'system'}
        open={overlay === 'language'}
        onClose={withHaptic('selection', () => setOverlay(null))}
        onSelect={(language) => {
          playHaptic(hapticsEnabled, 'selection');
          setLanguage(language);
          setOverlay(null);
        }}
      />
      <CardImageSheet
        bottomInset={insets.bottom}
        hasCustomImage={Boolean(cardVisualSelection && cardVisuals.uris[cardVisualSelection.target])}
        open={cardVisualSelection !== null}
        target={cardVisualSelection?.target ?? null}
        onChoose={() => {
          if (cardVisualSelection) void chooseCardImage(cardVisualSelection);
        }}
        onClose={withHaptic('selection', () => setCardVisualSelection(null))}
        onRestore={() => {
          if (cardVisualSelection) void restoreCardImage(cardVisualSelection.target);
        }}
      />
      {cardCropSelection ? (
        <CardImageCropEditor
          aspectRatio={cardCropSelection.aspectRatio}
          asset={cardCropSelection.asset}
          bottomInset={insets.bottom}
          labels={{
            apply: t('apply'),
            cancel: t('cancel'),
            instruction: t('cropImageInstruction'),
            title: `${t(cardCropSelection.target)} · ${t('adjustCardImage')}`,
          }}
          topInset={insets.top}
          onApply={(image) => saveCroppedCardImage(cardCropSelection.target, image)}
          onCancel={withHaptic('selection', () => setCardCropSelection(null))}
          onError={() => {
            setCardCropSelection(null);
            showToast(t('imageSaveFailed'));
          }}
        />
      ) : null}
    </View>
    </I18nContext.Provider>
  );
}

function AppScreen({ children, immersive = false }: { children: React.ReactNode; immersive?: boolean }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, immersive && styles.immersiveScrollContent]}
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
  const { t } = useI18n();
  return (
    <View style={styles.topbar}>
      <View style={styles.backrow}>
        {onBack ? (
          <TouchableOpacity
            accessibilityLabel={t('back')}
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
          accessibilityLabel={t('settings')}
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.iconButton}
          onPress={onSettings}
        >
          <Image source={visuals.settingsIcon} style={styles.settingsIcon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const i18n = useI18n();
  const { height, width } = useWindowDimensions();
  const surfaceHeight = Math.max(height, 690);
  const wordmarkWidth = width * 0.435;
  const alphaWidth = width * 0.59;
  const taglineWidth = width * 0.49;
  const buttonWidth = width * 0.675;

  return (
    <View style={[styles.onboardingSurface, { minHeight: surfaceHeight, width }]}>
      <Image
        source={visuals.onboardingWordmark}
        style={[styles.onboardingWordmark, { height: wordmarkWidth * (115 / 450), top: surfaceHeight * 0.195, width: wordmarkWidth }]}
      />
      <Image
        source={visuals.onboardingAlphaMark}
        style={[styles.onboardingAlphaMark, { height: alphaWidth * (590 / 580), top: surfaceHeight * 0.28, width: alphaWidth }]}
      />
      {i18n.locale === 'ko' ? (
        <Image
          source={visuals.onboardingTagline}
          style={[styles.onboardingTagline, { height: taglineWidth * (130 / 480), top: surfaceHeight * 0.64, width: taglineWidth }]}
        />
      ) : (
        <Text style={[styles.onboardingTaglineText, { top: surfaceHeight * 0.64, width: width * 0.78 }]}>
          {i18n.tagline}
        </Text>
      )}
      <View style={[styles.onboardingRule, { top: surfaceHeight * 0.718 }]} />
      <TouchableOpacity
        accessibilityLabel={i18n.t('start')}
        accessibilityRole="button"
        activeOpacity={0.76}
        style={[styles.onboardingStartButton, { height: buttonWidth * (210 / 630), top: surfaceHeight * 0.78, width: buttonWidth }]}
        onPress={onStart}
      >
        {i18n.locale === 'ko' ? (
          <Image source={visuals.onboardingStartButton} style={styles.onboardingStartButtonImage} />
        ) : (
          <Text style={styles.onboardingStartButtonText}>{i18n.t('start')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function TodayScreen({
  courseComplete,
  coursePassed,
  done,
  missed,
  rate,
  routines,
  state,
  streak,
  total,
  visualSource,
  onAddRoutine,
  onCloseDay,
  onOpenReflection,
  onRemoveRoutine,
  onSettings,
  onToggleRoutine,
  onVisualPress,
}: {
  courseComplete: boolean;
  coursePassed: boolean;
  done: number;
  missed: number;
  rate: number;
  routines: Routine[];
  state: AppState;
  streak: number;
  total: number;
  visualSource: ImageSourcePropType;
  onAddRoutine: () => void;
  onCloseDay: () => void;
  onOpenReflection: () => void;
  onRemoveRoutine: (id: string) => void;
  onSettings: () => void;
  onToggleRoutine: (id: string) => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const needsReflection = state.today.isClosed && !state.today.hasReflection;
  const actionLabel = needsReflection
    ? t('writeReflection')
    : courseComplete
      ? t('courseState', { level: state.currentCourse.level, state: t(coursePassed ? 'complete' : 'ended') })
      : state.today.isClosed
        ? t('closeComplete')
        : t('complete');
  const actionDisabled = !needsReflection && (courseComplete || state.today.isClosed);
  const action = needsReflection ? onOpenReflection : onCloseDay;
  const motto = i18n.motto(state.currentCourse.level, state.currentCourse.day);

  return (
    <AppScreen>
      <TopBar
        title={t('today')}
        subtitle={`${i18n.day(state.currentCourse.day)} · ${i18n.courseName(state.currentCourse.level)}`}
        onSettings={onSettings}
      />
      <FireCard source={visualSource} label={t('todayFire')} quote={motto} onPress={onVisualPress} />
      <SectionTitle right={t('completedCount', { done, total })} title={t('todaySummary')} />
      <SummaryGrid
        items={[
          { label: t('completedMetric'), value: String(done) },
          { label: t('streak'), value: String(streak) },
          { label: t('today'), value: `${rate}%` },
        ]}
      />
      <SectionTitle right={t('completedCount', { done, total })} title={t('todayRoutines')} />
      <RoutineList
        locked={state.today.isClosed || courseComplete}
        routines={routines}
        onRemove={onRemoveRoutine}
        onToggle={onToggleRoutine}
      />
      <LinkButton disabled={state.today.isClosed || courseComplete} label={t('addPersonalRoutine')} onPress={onAddRoutine} />
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
  visualSource,
  onCollection,
  onDetail,
  onSettings,
  onVisualPress,
}: {
  done: number;
  missed: number;
  rate: number;
  records: DayRecord[];
  state: AppState;
  streak: number;
  total: number;
  visualSource: ImageSourcePropType;
  onCollection: () => void;
  onDetail: () => void;
  onSettings: () => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const recent = records.slice(0, 3);
  const doneDays = records.filter((record) => record.status === 'complete').length;
  const missDays = records.filter((record) => record.status === 'incomplete').length;

  return (
    <AppScreen>
      <TopBar title={t('records')} subtitle={t('recordsSubtitle')} onSettings={onSettings} />
      <FireCard mini source={visualSource} first={t('completionStreak')} second={i18n.dayCount(streak)} onPress={onVisualPress} />
      <SectionTitle right={t('completedCount', { done, total })} title={t('todaySummary')} />
      <Card style={styles.progressCard}>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${rate}%` }]} />
        </View>
        <SummaryGrid
          compact
          items={[
            { label: t('completedMetric'), value: String(done) },
            { label: t('incomplete'), value: String(missed) },
            { label: t('achievement'), value: `${rate}%`, accent: true },
          ]}
        />
      </Card>
      <SectionTitle title={t('course30Summary')} />
      <ProcessCard
        caption={t('courseSummaryCaption', { done: doneDays, missed: missDays })}
        day={state.currentCourse.day}
        level={state.currentCourse.level}
        progress={state.currentCourse.progress}
      />
      <LinkButton label={t('view30Records')} onPress={onDetail} />
      <SectionTitle title={t('recentRecords')} />
      {recent.length ? (
        recent.map((record) => <RecordCard key={record.id} record={record} />)
      ) : (
        <RecordCard empty />
      )}
      <LinkButton label={t('recordCollectionLink')} onPress={onCollection} />
    </AppScreen>
  );
}

function CourseScreen({
  courseComplete,
  coursePassed,
  courseRestartAvailable,
  nextCourseAvailable,
  state,
  visualSource,
  onDetail,
  onSettings,
  onRestartCourse,
  onStartNextCourse,
  onVisualPress,
}: {
  courseComplete: boolean;
  coursePassed: boolean;
  courseRestartAvailable: boolean;
  nextCourseAvailable: boolean;
  state: AppState;
  visualSource: ImageSourcePropType;
  onDetail: () => void;
  onSettings: () => void;
  onRestartCourse: () => void;
  onStartNextCourse: () => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const stageIndex = stageForDay(state.currentCourse.day) - 1;
  const stageMeta = courseStageForDay(state.currentCourse.level, state.currentCourse.day);
  const currentStage = i18n.stage(state.currentCourse.level, stageIndex);
  const nextCourse = state.currentCourse.level === 'BASIC'
    ? 'STANDARD'
    : state.currentCourse.level === 'STANDARD'
      ? 'HARD'
      : null;
  return (
    <AppScreen>
      <TopBar title={t('course')} subtitle={t('currentAndNext')} onSettings={onSettings} />
      <ProcessCard
        caption={t('currentProgress')}
        day={state.currentCourse.day}
        highlighted
        level={state.currentCourse.level}
        progress={state.currentCourse.progress}
      />
      <LinkButton label={t('view30Records')} onPress={onDetail} />
      <SectionTitle title={t('currentStage')} />
      <VisualCard
        accessibilityLabel={`${t('course')} · ${t('cardImage')}`}
        source={visualSource}
        style={styles.stepCard}
        onPress={onVisualPress}
      >
        <View style={styles.visualTextLayer}>
          <Text style={styles.stepTitle}>
            {stageMeta.number} {currentStage.title}
          </Text>
          <Text style={styles.period}>{i18n.dayRange(stageIndex * 7 + 1, stageIndex === 3 ? 30 : stageIndex * 7 + 7)}</Text>
          <Text style={styles.quote}>{currentStage.quote}</Text>
          <Text style={styles.bullet}>{t('stageStandards')}</Text>
          {currentStage.bullets.map((item) => (
            <Text key={item} style={styles.bullet}>- {item}</Text>
          ))}
        </View>
      </VisualCard>
      <SectionTitle title={t('courseStages')} />
      <StageList currentDay={state.currentCourse.day} level={state.currentCourse.level} />
      <SectionTitle title={t('nextCourse')} />
      {nextCourse ? (
        <>
          <SettingLike label={i18n.courseName(nextCourse)} value={t(nextCourseAvailable ? 'available' : 'locked')} />
          {nextCourseAvailable ? (
            <View style={styles.nextCourseButton}>
              <PrimaryButton label={t('startCourse', { level: nextCourse })} onPress={onStartNextCourse} />
            </View>
          ) : null}
        </>
      ) : (
        <SettingLike label={t('finalCourse')} value={t(coursePassed ? 'complete' : courseComplete ? 'retryNeeded' : 'inProgress')} />
      )}
      {courseRestartAvailable ? (
        <View style={styles.nextCourseButton}>
          <PrimaryButton label={t('restartCourse', { level: state.currentCourse.level })} onPress={onRestartCourse} />
        </View>
      ) : null}
      {state.currentCourse.level === 'BASIC' ? <SettingLike label={i18n.courseName('HARD')} value={t('locked')} style={styles.settingGap} /> : null}
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
  const i18n = useI18n();
  const { t } = i18n;
  const doneDays = new Set(
    state.records
      .filter((record) => record.course === state.currentCourse.level && record.status === 'complete')
      .map((record) => record.day),
  );
  const failDays = new Set(
    state.records
      .filter((record) => record.course === state.currentCourse.level && record.status === 'incomplete')
      .map((record) => record.day),
  );

  return (
    <AppScreen>
      <TopBar title={t('records30')} onBack={onBack} />
      <ProcessCard
        caption={t('courseSummaryCaption', { done: doneDays.size, missed: failDays.size })}
        day={state.currentCourse.day}
        level={state.currentCourse.level}
        progress={state.currentCourse.progress}
      />
      <SectionTitle title={t('records30')} />
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
              accessibilityLabel={i18n.day(day)}
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
      <SectionTitle title={t('courseStages')} />
      <StageList currentDay={state.currentCourse.day} level={state.currentCourse.level} />
    </AppScreen>
  );
}

function CollectionScreen({
  records,
  visualSource,
  onBack,
  onVisualPress,
}: {
  records: DayRecord[];
  visualSource: ImageSourcePropType;
  onBack: () => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const { t } = useI18n();
  return (
    <AppScreen>
      <TopBar title={t('recordCollection')} onBack={onBack} />
      <FireCard mini source={visualSource} first={t('recordsLeft')} second={t('countItems', { count: records.length })} onPress={onVisualPress} />
      <SectionTitle title={t('recordsByDate')} />
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
  onBack,
  onDataReset,
  onHapticsToggle,
  onInfo,
  onLanguage,
  onNotificationsToggle,
}: {
  state: AppState;
  onBack: () => void;
  onDataReset: () => void;
  onHapticsToggle: () => void;
  onInfo: () => void;
  onLanguage: () => void;
  onNotificationsToggle: () => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <AppScreen>
      <TopBar title={t('settings')} onBack={onBack} />
      <Card style={styles.profile}>
        <Image source={visuals.avatar} style={styles.avatar as object} />
        <View>
          <Text style={styles.profileTitle}>ALPHA</Text>
          <Text style={styles.profileLevel}>{state.currentCourse.level} · {i18n.day(state.currentCourse.day)}</Text>
        </View>
      </Card>
      <View style={styles.settingsList}>
        <SettingRow
          label={t('notificationSettings')}
          value={state.settings.notificationsEnabled ? 'ON' : 'OFF'}
          onPress={onNotificationsToggle}
        />
        <SettingRow
          label={t('hapticSettings')}
          value={state.settings.hapticsEnabled ? t('vibration') : 'OFF'}
          onPress={onHapticsToggle}
        />
        <SettingRow label={t('language')} value={i18n.languageName(state.settings.language ?? 'system')} onPress={onLanguage} />
        <SettingRow label={t('dataReset')} onPress={onDataReset} />
        <SettingRow label={t('appInfo')} value="v19" onPress={onInfo} />
      </View>
    </AppScreen>
  );
}

function VisualCard({
  accessibilityLabel,
  children,
  onPress,
  source,
  style,
  overlayOpacity = 0.2,
}: {
  accessibilityLabel?: string;
  children?: React.ReactNode;
  onPress?: (frame: CardVisualFrame) => void;
  source: ImageSourcePropType;
  style?: object;
  overlayOpacity?: number;
}) {
  const layoutRef = useRef<CardVisualFrame | null>(null);

  return (
    <ImageBackground
      imageStyle={styles.visualImage as object}
      resizeMode="cover"
      source={source}
      style={[styles.card, style]}
      onLayout={({ nativeEvent }) => {
        layoutRef.current = {
          height: nativeEvent.layout.height,
          width: nativeEvent.layout.width,
        };
      }}
    >
      <LinearGradient
        colors={[`rgba(0,0,0,${overlayOpacity + 0.3})`, `rgba(0,0,0,${overlayOpacity})`, 'rgba(0,0,0,0.38)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.visualOverlay}
      />
      {children}
      {onPress ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          style={styles.cardImagePressTarget}
          onPress={() => onPress(layoutRef.current ?? { height: 0, width: 0 })}
        />
      ) : null}
    </ImageBackground>
  );
}

function FireCard({
  first,
  label,
  mini,
  onPress,
  quote,
  second,
  source,
}: {
  first?: string;
  label?: string;
  mini?: boolean;
  onPress?: (frame: CardVisualFrame) => void;
  quote?: string;
  second?: string;
  source: ImageSourcePropType;
}) {
  const { locale, t } = useI18n();
  const displayQuote = quote ? formatFireQuote(quote, locale === 'ko') : undefined;
  const layoutRef = useRef<CardVisualFrame | null>(null);

  return (
    <ImageBackground
      imageStyle={styles.visualImage as object}
      resizeMode="cover"
      source={source}
      style={[styles.card, styles.fireCard, mini && styles.fireMini]}
      onLayout={({ nativeEvent }) => {
        layoutRef.current = {
          height: nativeEvent.layout.height,
          width: nativeEvent.layout.width,
        };
      }}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.66)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0.32)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.visualOverlay}
      />
      {label ? <Text style={styles.fireLabel}>{label}</Text> : null}
      <View style={styles.fireTextWrap}>
        {displayQuote ? (
          <Text style={styles.fireQuote}>{displayQuote}</Text>
        ) : (
          <>
            <Text style={[styles.fireText, mini && styles.fireTextMini]}>{first}</Text>
            <Text style={[styles.fireText, styles.fireAccent, mini && styles.fireTextMini]}>{second}</Text>
          </>
        )}
      </View>
      {onPress ? (
        <Pressable
          accessibilityLabel={t('cardImage')}
          accessibilityRole="button"
          style={styles.cardImagePressTarget}
          onPress={() => onPress(layoutRef.current ?? { height: 0, width: 0 })}
        />
      ) : null}
    </ImageBackground>
  );
}

function formatFireQuote(quote: string, useKoreanLineBreaks: boolean) {
  if (!useKoreanLineBreaks) return quote;
  if (quote.includes('\n')) return quote;

  const sentences = quote
    .split('\n')
    .flatMap((line) => line.match(/[^.!?]+[.!?]?/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) return quote;

  // The card has room for three deliberate lines. Split only at a word or
  // phrase boundary so React Native never leaves a single trailing character.
  const lines: string[] = [];
  for (const [index, sentence] of sentences.entries()) {
    const remainingSentences = sentences.length - index - 1;
    const availableLines = Math.max(1, 3 - lines.length - remainingSentences);
    const split = splitFireSentence(sentence);
    lines.push(...(split.length <= availableLines ? split : [sentence]));
  }

  return lines.join('\n');
}

function splitFireSentence(sentence: string) {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (sentence.length <= 20 || words.length < 2) return [sentence];

  // Korean connective endings make the most natural visual break: for example
  // "아무것도 하지 않으면" / "아무 일도 일어나지 않는다."
  const connectiveIndex = words.findIndex((word, index) => (
    index > 0
    && index < words.length - 1
    && /(?:으면|면|지만|는데|거나|면서|도록|고)[.!?]?$/.test(word)
  ));
  if (connectiveIndex !== -1) {
    return [words.slice(0, connectiveIndex + 1).join(' '), words.slice(connectiveIndex + 1).join(' ')];
  }

  const target = sentence.length / 2;
  let splitAt = 1;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const firstLength = words.slice(0, index).join(' ').length;
    const distance = Math.abs(target - firstLength);
    if (distance < shortestDistance) {
      splitAt = index;
      shortestDistance = distance;
    }
  }

  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function PrimaryButton({
  disabled,
  label,
  onPress,
  style,
  textStyle,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      activeOpacity={disabled ? 1 : 0.82}
      disabled={disabled}
      style={style}
      onPress={onPress}
    >
      <LinearGradient
        colors={disabled ? ['#323236', '#171719'] : ['#f51c1c', '#a70707']}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.buttonText, disabled && styles.buttonDisabledText, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  danger,
  label,
  onPress,
  style,
  textStyle,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      activeOpacity={0.82}
      style={[styles.secondaryButton, danger && styles.dangerButton, style]}
      onPress={onPress}
    >
      <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.secondaryButtonText, danger && styles.dangerText, textStyle]}>{label}</Text>
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
  const i18n = useI18n();
  return (
    <View style={styles.routineList}>
      {routines.map((routine, index) => (
        <TouchableOpacity
          accessibilityLabel={routine.type === 'personal' ? routine.name : i18n.routine(routine.id, routine.name)}
          accessibilityRole="button"
          accessibilityState={{ checked: routine.done, disabled: Boolean(locked) }}
          activeOpacity={locked ? 1 : 0.78}
          disabled={locked}
          key={routine.id}
          style={[styles.routineRow, index === routines.length - 1 && styles.lastRow]}
          onPress={() => onToggle?.(routine.id)}
        >
          <View style={[styles.check, routine.done && styles.checkDone]}>
            <Text style={styles.checkText}>{routine.done ? '✓' : ''}</Text>
          </View>
          <Text style={[styles.routineText, locked && styles.lockedText]}>
            {routine.type === 'personal' ? routine.name : i18n.routine(routine.id, routine.name)}
          </Text>
          {routine.type === 'personal' ? <Text style={styles.personalBadge}>{i18n.t('personal')}</Text> : null}
          {routine.type === 'personal' && !locked ? (
            <TouchableOpacity
              accessibilityLabel={i18n.t('deleteRoutine', { name: routine.name })}
              accessibilityRole="button"
              activeOpacity={0.78}
              style={styles.removeRoutineButton}
              onPress={(event) => {
                event.stopPropagation();
                onRemove?.(routine.id);
              }}
            >
              <Text style={styles.removeRoutineText}>×</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.chev}>{locked ? i18n.t('locked') : '›'}</Text>
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
  level,
  progress,
}: {
  caption: string;
  day: number;
  highlighted?: boolean;
  level: AppState['currentCourse']['level'];
  progress: number;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <Card style={[styles.processCard, highlighted && styles.processHighlighted]}>
      <View>
        <Text style={styles.processTitle}>{i18n.courseName(level)}</Text>
        <Text style={styles.processDay}>{i18n.day(day)} / 30</Text>
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
  const i18n = useI18n();
  const { t } = i18n;
  if (empty || !record) {
    return (
      <Card style={styles.recordCard}>
        <Text style={styles.recordText}>{t('noRecord')}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.recordCard}>
      <Text style={styles.recordDay}>
        {withDate ? `${i18n.date(record.date)} · ` : ''}{i18n.day(record.day)} ·{' '}
        <Text style={styles.badge}>{t(record.status === 'complete' ? 'complete' : 'incomplete')}</Text>
      </Text>
      <Text style={styles.recordText}>{record.reflection || t('noRecord')}</Text>
      <Text style={styles.recordArrow}>›</Text>
    </Card>
  );
}

function StageList({ currentDay, level }: { currentDay: number; level: AppState['currentCourse']['level'] }) {
  const activeStage = stageForDay(currentDay);
  const stages = courseStages[level];
  return (
    <View style={styles.stageList}>
      {stages.map((item, index) => (
        <StageItem
          activeStage={activeStage}
          index={index}
          item={item}
          key={item.number}
          last={index === stages.length - 1}
          level={level}
        />
      ))}
    </View>
  );
}

function StageItem({
  activeStage,
  index,
  item,
  last,
  level,
}: {
  activeStage: number;
  index: number;
  item: (typeof courseStages.BASIC)[number];
  last: boolean;
  level: AppState['currentCourse']['level'];
}) {
  const i18n = useI18n();
  const stageNumber = index + 1;
  const state = stageNumber < activeStage ? 'done' : stageNumber === activeStage ? 'active' : 'locked';
  const localizedStage = i18n.stage(level, index);

  return (
    <View
      style={[
        styles.stageItem,
        last && styles.lastRow,
        state === 'active' && styles.stageActive,
        state === 'locked' && styles.stageLocked,
      ]}
    >
      {state === 'active' ? <View pointerEvents="none" style={styles.stageActiveBorder} /> : null}
      <Text style={[styles.stageNumber, state === 'active' && styles.stageActiveText]}>
        {item.number}
      </Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.76}
        numberOfLines={2}
        style={[styles.stageTitle, state === 'active' && styles.stageActiveText]}
      >
        {localizedStage.title}
      </Text>
      <Text style={styles.stagePeriod}>{i18n.dayRange(index * 7 + 1, index === 3 ? 30 : index * 7 + 7)}</Text>
      <Text accessibilityLabel={state === 'locked' ? i18n.t('locked') : undefined} style={styles.stageState}>
        {state === 'done' ? '✓' : state === 'active' ? '●' : '🔒'}
      </Text>
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
  const { t } = useI18n();
  return (
    <View style={[styles.tabs, { bottom: Math.max(bottomInset, 7) + 13 }]}>
      {mainTabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <TouchableOpacity
            accessibilityLabel={t(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            activeOpacity={0.82}
            key={tab.id}
            style={[styles.tab, selected && styles.tabActive]}
            onPress={() => onPress(tab.id)}
          >
            <Text style={[styles.tabIcon, selected && styles.tabActiveText]}>{tab.icon}</Text>
            <Text style={[styles.tabText, selected && styles.tabActiveText]}>{t(tab.id)}</Text>
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
  onCancel,
  open,
  result,
  streak,
  onClose,
  onReflection,
}: {
  done: number;
  missed: number;
  onCancel: () => void;
  open: boolean;
  result: 'complete' | 'incomplete';
  streak: number;
  onClose: () => void;
  onReflection: () => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const complete = result === 'complete';
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.finishModal}>
        <TouchableOpacity
          accessibilityLabel={t('close')}
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
          <Text style={[styles.finishTitle, !complete && styles.failTitle]}>{t(complete ? 'resultCompleteTitle' : 'resultIncompleteTitle')}</Text>
          <Text style={styles.finishCopy}>
            {t(complete ? 'resultCompleteCopy' : 'resultIncompleteCopy')}
          </Text>
        </View>
        <View style={styles.resultTable}>
          <ResultRow label={t('completedRoutines')} value={t('countItems', { count: done })} />
          <ResultRow label={t('incompleteRoutines')} value={t('countItems', { count: missed })} />
          <ResultRow label={t('completionStreakLabel')} value={i18n.dayCount(streak)} last />
        </View>
        <View style={styles.finishActions}>
          <SecondaryButton label={t('cancel')} style={styles.finishActionButton} textStyle={styles.finishCancelText} onPress={onCancel} />
          <PrimaryButton label={t('writeReflection')} style={styles.finishReflectionButton} onPress={onReflection} />
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
  const { t } = useI18n();
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{t('reflection')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.field}>{t('todayRecord')}</Text>
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
          <SecondaryButton label={t('cancel')} style={styles.evenModalButton} onPress={onClose} />
          <PrimaryButton label={t('save')} style={styles.evenModalButton} onPress={onSave} />
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
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{t('personalRoutineAdd')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.field}>{t('routineName')}</Text>
        <TextInput
          placeholder={t('routinePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={routineName}
          onChangeText={onChangeName}
        />
        <Text style={styles.field}>{t('category')}</Text>
        <View style={styles.chips}>
          {categories.map((category) => (
            <TouchableOpacity
              accessibilityLabel={i18n.category(category)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCat === category }}
              activeOpacity={0.8}
              key={category}
              style={[styles.chip, selectedCat === category && styles.chipActive]}
              onPress={() => onSelectCat(category)}
            >
              <Text style={[styles.chipText, selectedCat === category && styles.chipActiveText]}>{i18n.category(category)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.field}>{t('scope')}</Text>
        <View style={styles.row2}>
          {scopes.map((scope) => (
            <TouchableOpacity
              accessibilityLabel={i18n.scope(scope)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedScope === scope }}
              activeOpacity={0.8}
              key={scope}
              style={[styles.seg, selectedScope === scope && styles.segActive]}
              onPress={() => onSelectScope(scope)}
            >
              <Text style={[styles.segText, selectedScope === scope && styles.segActiveText]}>{i18n.scope(scope)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row2WithTop}>
          <SecondaryButton label={t('cancel')} style={styles.evenModalButton} onPress={onClose} />
          <PrimaryButton label={t('add')} style={styles.evenModalButton} onPress={onAdd} />
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
  const { t } = useI18n();
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{t('dataReset')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resetCopy}>{t('resetCopy')}</Text>
        <View style={styles.row2WithTop}>
          <SecondaryButton label={t('cancel')} style={styles.evenModalButton} onPress={onClose} />
          <PrimaryButton label={t('reset')} style={styles.evenModalButton} onPress={onReset} />
        </View>
      </View>
    </BaseModal>
  );
}

function AppInfoModal({
  level,
  open,
  onClose,
}: {
  level: AppState['currentCourse']['level'];
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{t('appInfo')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <DateRow label={t('app')} value="ALPHA: REFORGE" />
        <DateRow label={t('version')} value="v19 · 1.0.0" />
        <DateRow label={t('course')} value={t('course30Days', { level })} />
        <DateRow label={t('storage')} value={t('storedOnDevice')} />
        <View style={styles.modalButtonGap}>
          <SecondaryButton label={t('close')} onPress={onClose} />
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
  const i18n = useI18n();
  const { t } = i18n;
  const selected = day ?? state.currentCourse.day;
  const future = selected > state.currentCourse.day;
  const record = records.find((item) => item.course === state.currentCourse.level && item.day === selected);
  const today = selected === state.currentCourse.day;
  const date = future
    ? dateForCourseDay(state.currentCourse.startedAt, selected)
    : record?.date ?? (today ? state.today.date : dateForCourseDay(state.currentCourse.startedAt, selected));
  const shownRoutines = today ? routines : state.routinesByDate[date] ?? courseRoutinesFor(state.currentCourse.level, selected);
  const completed = today
    ? courseDoneCount(routines)
    : record
      ? shownRoutines.filter((routine) => routine.type === 'basic' && record.completedRoutineIds.includes(routine.id)).length
      : 0;
  const statusKey = future ? 'scheduled' : record ? (record.status === 'complete' ? 'complete' : 'incomplete') : today ? 'inProgress' : 'incomplete';
  const note = future ? t('noRecordYet') : record?.reflection || t('noRecord');

  return (
    <BaseModal alignBottom open={open} onClose={onClose}>
      <View style={styles.bottomSheet}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{i18n.day(selected)}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <DateRow label={t('date')} value={i18n.date(date)} />
        <DateRow accent={!future && statusKey === 'incomplete'} label={t('status')} muted={future} value={t(statusKey)} />
        <DateRow
          label={t('stage')}
          value={`${String(stageForDay(selected)).padStart(2, '0')}. ${i18n.stage(state.currentCourse.level, stageForDay(selected) - 1).title}`}
        />
        <DateRow label={t('routineCompletion')} value={future ? '-' : `${completed} / ${courseRoutineTotal(shownRoutines)}`} />
        <SectionTitle title={t('routines')} />
        <RoutineList
          locked
          routines={shownRoutines.map((routine, index) => ({
            ...routine,
            done: future ? false : today ? routine.done : record ? record.completedRoutineIds.includes(routine.id) : false,
          }))}
        />
        <SectionTitle title={t('reflection')} />
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      </View>
    </BaseModal>
  );
}

function LanguageModal({
  language,
  open,
  onClose,
  onSelect,
}: {
  language: SupportedLanguage;
  open: boolean;
  onClose: () => void;
  onSelect: (language: SupportedLanguage) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={styles.centerModal}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{t('languageTitle')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {supportedLanguages.map((item) => {
            const selected = language === item;
            return (
              <TouchableOpacity
                accessibilityLabel={i18n.languageName(item)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                activeOpacity={0.8}
                key={item}
                style={[styles.languageRow, selected && styles.languageRowSelected]}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.languageText, selected && styles.languageTextSelected]}>{i18n.languageName(item)}</Text>
                <Text style={[styles.languageCheck, selected && styles.languageTextSelected]}>{selected ? '●' : '○'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </BaseModal>
  );
}

function CardImageSheet({
  bottomInset,
  hasCustomImage,
  open,
  target,
  onChoose,
  onClose,
  onRestore,
}: {
  bottomInset: number;
  hasCustomImage: boolean;
  open: boolean;
  target: CardVisualTarget | null;
  onChoose: () => void;
  onClose: () => void;
  onRestore: () => void;
}) {
  const { t } = useI18n();
  const title = target ? `${t(target)} · ${t('cardImage')}` : t('cardImage');

  return (
    <BaseModal alignBottom open={open} onClose={onClose}>
      <View style={[styles.cardImageSheet, { paddingBottom: Math.max(bottomInset, 16) }]}>
        <View style={styles.modalHead}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.cardImageAction}
          onPress={onChoose}
        >
          <Text style={styles.cardImageActionText}>{t('choosePhoto')}</Text>
        </TouchableOpacity>
        {hasCustomImage ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.78}
            style={styles.cardImageAction}
            onPress={onRestore}
          >
            <Text style={styles.cardImageRestoreText}>{t('restoreDefaultImage')}</Text>
          </TouchableOpacity>
        ) : null}
        <SecondaryButton label={t('cancel')} style={styles.cardImageCancel} onPress={onClose} />
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
  immersiveScrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
    paddingHorizontal: 0,
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
  settingsIcon: {
    height: 22,
    width: 22,
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
  onboardingSurface: {
    backgroundColor: colors.black,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  onboardingWordmark: {
    alignSelf: 'center',
    position: 'absolute',
  },
  onboardingAlphaMark: {
    alignSelf: 'center',
    position: 'absolute',
  },
  onboardingTagline: {
    alignSelf: 'center',
    position: 'absolute',
  },
  onboardingTaglineText: {
    alignSelf: 'center',
    color: '#b9b9bd',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 21,
    lineHeight: 28,
    position: 'absolute',
    textAlign: 'center',
  },
  onboardingRule: {
    alignSelf: 'center',
    backgroundColor: colors.red,
    height: 2,
    position: 'absolute',
    width: 42,
  },
  onboardingStartButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: colors.red,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
  },
  onboardingStartButtonImage: {
    height: '100%',
    width: '100%',
  },
  onboardingStartButtonText: {
    color: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 21,
    textAlign: 'center',
  },
  fireCard: {
    borderColor: 'rgba(241,25,25,0.42)',
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 2,
    padding: 16,
  },
  cardImagePressTarget: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
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
  fireQuote: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 27,
    paddingRight: 2,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
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
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    paddingHorizontal: 8,
    textAlign: 'center',
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
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    paddingHorizontal: 8,
    textAlign: 'center',
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
    height: 56,
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
  nextCourseButton: {
    marginTop: 10,
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
  cardImageSheet: {
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    borderWidth: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 20,
    width: '100%',
  },
  cardImageAction: {
    alignItems: 'center',
    backgroundColor: '#111112',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.button,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
    width: '100%',
  },
  cardImageActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  cardImageRestoreText: {
    color: colors.red,
    fontSize: 16,
    fontWeight: '900',
  },
  cardImageCancel: {
    marginTop: 12,
    width: '100%',
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
  finishActions: {
    flexDirection: 'row',
    gap: 10,
  },
  finishActionButton: {
    flex: 0.44,
  },
  finishCancelText: {
    fontSize: 13,
  },
  finishReflectionButton: {
    flex: 1,
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
  languageList: {
    maxHeight: 430,
  },
  languageRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 8,
  },
  languageRowSelected: {
    backgroundColor: 'rgba(241,25,25,0.1)',
  },
  languageText: {
    color: colors.soft,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  languageTextSelected: {
    color: colors.red,
  },
  languageCheck: {
    color: '#777',
    fontSize: 15,
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
  evenModalButton: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    paddingHorizontal: 5,
    textAlign: 'center',
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
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 6,
    textAlign: 'center',
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
