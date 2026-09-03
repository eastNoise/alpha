import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  Share,
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

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
import {
  courseDoneCount,
  courseRoutineTotal,
  programDayForCourse,
  programProgressForCourse,
} from './src/domain/alpha';
import { playHaptic } from './src/device/haptics';
import { syncDailyCloseReminder } from './src/device/notifications';
import { createI18n, I18nContext, supportedLanguages, useI18n } from './src/i18n';
import { useAlphaController } from './src/state/useAlphaController';
import { CardVisualTarget, useCardVisuals } from './src/state/useCardVisuals';
import { colors, radius, spacing, typography } from './src/theme';
import { AppState, DayRecord, Routine, ScreenName, SupportedLanguage } from './src/types';
import { visuals } from './src/visuals';
import appConfig from './app.json';

const mainTabs: Array<{
  id: 'today' | 'records' | 'course';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  selectedIcon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  { id: 'today', icon: 'checkmark-circle-outline', selectedIcon: 'checkmark-circle' },
  { id: 'records', icon: 'document-text-outline', selectedIcon: 'document-text' },
  { id: 'course', icon: 'flag-outline', selectedIcon: 'flag' },
];

const programLevels: AppState['currentCourse']['level'][] = ['BASIC', 'STANDARD', 'HARD'];
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ROUTINE_ROW_HEIGHT = 52;
const COMPACT_TEXT_MAX_SCALE = 1.3;
const DISPLAY_TEXT_MAX_SCALE = 1.2;
const FIRE_QUOTE_MAX_SCALE = 1.15;
const APP_BUILD_NUMBER = Platform.OS === 'ios'
  ? appConfig.expo.ios.buildNumber
  : String(appConfig.expo.android.versionCode);
const APP_VERSION_LABEL = `v${appConfig.expo.version} (${APP_BUILD_NUMBER})`;
const APP_SHARE_URL = '';

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
  const [todayCardEditFrame, setTodayCardEditFrame] = useState<CardVisualFrame | null>(null);
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
    confirmIncompleteClose,
    courseComplete,
    coursePassed,
    courseRestartAvailable,
    done,
    go,
    hasRoutineCustomizations,
    missed,
    moveRoutine,
    nextCourseAvailable,
    openAddRoutine,
    openDay,
    openTodayStandard,
    overlay,
    rate,
    ready,
    recordCourse,
    reflectionText,
    removeRoutine,
    resetData,
    restoreCourseRoutines,
    restartCourse,
    routineName,
    routines,
    saveReflection,
    saveTodayStandard,
    screen,
    selectRecordCourse,
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
    playHaptic(hapticsEnabled, 'light');
    setCardVisualSelection({ aspectRatio: measuredAspectRatio, target });
  }

  async function chooseCardImage(selection: CardVisualSelection) {
    try {
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
      playHaptic(hapticsEnabled, 'error');
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
    playHaptic(hapticsEnabled, 'confirm');
    showToast(t('imageUpdatedToast'));
  }

  async function restoreCardImage(target: CardVisualTarget) {
    setCardVisualSelection(null);
    try {
      await cardVisuals.restoreDefault(target);
      playHaptic(hapticsEnabled, 'confirm');
      showToast(t('imageResetToast'));
    } catch {
      playHaptic(hapticsEnabled, 'error');
      showToast(t('imageSaveFailed'));
    }
  }

  async function shareCompletedProgram() {
    try {
      const message = [t('shareAppMessage'), APP_SHARE_URL].filter(Boolean).join('\n\n');
      await Share.share({
        message,
        title: t('shareAppTitle'),
      });
    } catch {
      playHaptic(hapticsEnabled, 'error');
      showToast(t('shareFailedToast'));
    }
  }

  function openAppShare() {
    playHaptic(hapticsEnabled, 'light');
    void shareCompletedProgram();
  }

  function renderScreen() {
    switch (screen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            onStart={withHaptic('commit', startOnboarding)}
          />
        );
      case 'today':
        return (
          <TodayScreen
            done={done}
            rate={rate}
            courseComplete={courseComplete}
            coursePassed={coursePassed}
            hasRoutineCustomizations={hasRoutineCustomizations}
            nextCourseAvailable={nextCourseAvailable}
            routines={routines}
            state={state}
            streak={streak}
            total={total}
            visualSource={cardSources.today}
            onAddRoutine={withHaptic('light', openAddRoutine)}
            onCloseDay={() => {
              playHaptic(hapticsEnabled, done === total ? 'progressComplete' : 'warning');
              closeDay();
            }}
            onEditCard={(frame) => {
              playHaptic(hapticsEnabled, 'light');
              setTodayCardEditFrame(frame);
            }}
            onOpenReflection={withHaptic('light', () => setOverlay('reflection'))}
            onMoveRoutine={(id, targetIndex) => {
              playHaptic(hapticsEnabled, 'rigid');
              moveRoutine(id, targetIndex);
            }}
            onRemoveRoutine={(id) => {
              playHaptic(hapticsEnabled, 'destructive');
              removeRoutine(id);
            }}
            onRestoreRoutines={withHaptic('confirm', restoreCourseRoutines)}
            onRoutineEditingToggle={() => playHaptic(hapticsEnabled, 'rigid')}
            onShareApp={openAppShare}
            onStartNextCourse={withHaptic('commit', beginNextCourse)}
            onSettings={withHaptic('light', () => go('settings'))}
            onToggleRoutine={(id) => {
              const selectedRoutine = routines.find((routine) => routine.id === id);
              const haptic = selectedRoutine?.done
                ? 'progressDown'
                : done + 1 === total
                  ? 'progressComplete'
                  : 'progressUp';
              playHaptic(hapticsEnabled, haptic);
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
            recordCourse={recordCourse}
            records={sortedRecords}
            state={state}
            streak={streak}
            total={total}
            visualSource={cardSources.records}
            onCollection={withHaptic('light', () => go('collection'))}
            onDetail={withHaptic('light', () => go('detail'))}
            onOpenDay={(day) => {
              playHaptic(hapticsEnabled, 'light');
              openDay(day);
            }}
            onSelectCourse={(level) => {
              if (level === recordCourse) return;
              playHaptic(hapticsEnabled, 'rigid');
              selectRecordCourse(level);
            }}
            onSettings={withHaptic('light', () => go('settings'))}
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
            onDetail={withHaptic('light', () => go('detail'))}
            onSettings={withHaptic('light', () => go('settings'))}
            onShareApp={openAppShare}
            onStartNextCourse={withHaptic('commit', beginNextCourse)}
            onRestartCourse={withHaptic('destructive', restartCourse)}
            onVisualPress={(frame) => openCardVisual('course', frame)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            state={state}
            onBack={withHaptic('light', back)}
            onDataReset={withHaptic('light', () => setOverlay('resetData'))}
            onHapticsToggle={() => {
              playHaptic(true, 'rigid');
              toggleHaptics();
            }}
            onInfo={withHaptic('light', () => setOverlay('appInfo'))}
            onLanguage={withHaptic('light', () => setOverlay('language'))}
            onNotificationsToggle={() => {
              playHaptic(hapticsEnabled, 'rigid');
              toggleNotifications();
            }}
          />
        );
      case 'detail':
        return (
          <DetailScreen
            calendarCellSize={calendarCellSize}
            calendarWidth={calendarWidth}
            recordCourse={recordCourse}
            records={sortedRecords}
            state={state}
            onBack={withHaptic('light', back)}
            onOpenDay={(day) => {
              playHaptic(hapticsEnabled, 'light');
              openDay(day);
            }}
          />
        );
      case 'collection':
        return (
          <CollectionScreen
            recordCourse={recordCourse}
            records={sortedRecords}
            visualSource={cardSources.records}
            onBack={withHaptic('light', back)}
            onOpenDay={(day) => {
              playHaptic(hapticsEnabled, 'light');
              openDay(day);
            }}
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
        <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={styles.loadingText}>ALPHA</Text>
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
              paddingBottom: showTabs ? Math.max(insets.bottom, 7) + spacing.tabHeight + 8 : 0,
            },
          ]}
        >
          {renderScreen()}
        </View>
        {showTabs ? (
          <BottomTabs
            active={screen}
            bottomInset={insets.bottom}
            onPress={(nextScreen) => {
              if (nextScreen === screen) return;
              playHaptic(hapticsEnabled, 'rigid');
              selectTab(nextScreen);
            }}
          />
        ) : null}
        {toast ? (
          <Toast
            actionLabel={toast.action === 'undoRoutineRemoval' ? t('undo') : undefined}
            bottom={showTabs ? insets.bottom + 96 : insets.bottom + 26}
            message={toast.message}
            onAction={toast.action === 'undoRoutineRemoval'
              ? withHaptic('confirm', undoRoutineRemoval)
              : undefined}
          />
        ) : null}
      </LinearGradient>

      <IncompleteCloseModal
        missed={missed}
        open={overlay === 'confirmIncomplete'}
        onBack={withHaptic('light', () => setOverlay(null))}
        onConfirm={withHaptic('warning', confirmIncompleteClose)}
      />
      <FinishDayModal
        done={done}
        missed={missed}
        open={overlay === 'finish'}
        result={state.today.result ?? (done === total ? 'complete' : 'incomplete')}
        streak={streak}
        onClose={withHaptic('light', () => setOverlay(null))}
        onReflection={() => {
          playHaptic(hapticsEnabled, 'light');
          setOverlay('reflection');
        }}
      />
      <ReflectionModal
        open={overlay === 'reflection'}
        text={reflectionText}
        onChangeText={(text) => setReflectionText(text.slice(0, 160))}
        onClose={withHaptic('light', () => setOverlay(null))}
        onSave={() => {
          playHaptic(hapticsEnabled, reflectionText.trim() ? 'confirm' : 'error');
          saveReflection();
        }}
      />
      <TodayStandardModal
        defaultText={i18n.motto(state.currentCourse.level, state.currentCourse.day)}
        open={overlay === 'standard'}
        text={standardText}
        onChangeText={(text) => setStandardText(text.slice(0, 80))}
        onClose={withHaptic('light', () => setOverlay(null))}
        onSave={withHaptic('confirm', saveTodayStandard)}
      />
      <TodayCardEditSheet
        bottomInset={insets.bottom}
        open={todayCardEditFrame !== null}
        onClose={withHaptic('light', () => setTodayCardEditFrame(null))}
        onEditImage={() => {
          const frame = todayCardEditFrame;
          setTodayCardEditFrame(null);
          if (frame) openCardVisual('today', frame);
        }}
        onEditStandard={() => {
          setTodayCardEditFrame(null);
          playHaptic(hapticsEnabled, 'light');
          openTodayStandard();
        }}
      />
      <AddRoutineModal
        open={overlay === 'addRoutine'}
        routineName={routineName}
        selectedCat={selectedCat}
        selectedScope={selectedScope}
        onAdd={withHaptic('confirm', addPersonalRoutine)}
        onChangeName={setRoutineName}
        onClose={withHaptic('light', () => setOverlay(null))}
        onSelectCat={(category) => {
          if (category === selectedCat) return;
          playHaptic(hapticsEnabled, 'rigid');
          setSelectedCat(category);
        }}
        onSelectScope={(scope) => {
          if (scope === selectedScope) return;
          playHaptic(hapticsEnabled, 'rigid');
          setSelectedScope(scope);
        }}
      />
      <DayDetailSheet
        course={recordCourse}
        day={selectedDay}
        open={overlay === 'dayDetail'}
        records={sortedRecords}
        routines={routines}
        state={state}
        onClose={withHaptic('light', () => setOverlay(null))}
      />
      <ResetDataModal
        open={overlay === 'resetData'}
        onClose={withHaptic('light', () => setOverlay(null))}
        onReset={withHaptic('destructive', resetData)}
      />
      <AppInfoModal
        level={state.currentCourse.level}
        open={overlay === 'appInfo'}
        onClose={withHaptic('light', () => setOverlay(null))}
      />
      <LanguageModal
        language={state.settings.language ?? 'system'}
        open={overlay === 'language'}
        onClose={withHaptic('light', () => setOverlay(null))}
        onSelect={(language) => {
          playHaptic(hapticsEnabled, 'rigid');
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
          playHaptic(hapticsEnabled, 'light');
          if (cardVisualSelection) void chooseCardImage(cardVisualSelection);
        }}
        onClose={withHaptic('light', () => setCardVisualSelection(null))}
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
          onCancel={withHaptic('light', () => setCardCropSelection(null))}
          onError={() => {
            setCardCropSelection(null);
            playHaptic(hapticsEnabled, 'error');
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
            <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={styles.iconText}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.topTitleWrap}>
          <Text
            adjustsFontSizeToFit
            maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
            minimumFontScale={0.78}
            numberOfLines={1}
            style={styles.topTitle}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.topSubtitle}>
              {subtitle}
            </Text>
          ) : null}
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
  const taglineWidth = width * 0.64;
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
          accessibilityLabel={i18n.tagline.replace('\n', ' ')}
          accessible
          resizeMode="contain"
          source={visuals.onboardingTagline}
          style={[styles.onboardingTagline, { height: taglineWidth * (190 / 640), top: surfaceHeight * 0.64, width: taglineWidth }]}
        />
      ) : (
        <Text
          maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE}
          style={[styles.onboardingTaglineText, { top: surfaceHeight * 0.64, width: width * 0.78 }]}
        >
          {i18n.tagline}
        </Text>
      )}
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
          <>
            <View pointerEvents="none" style={styles.onboardingStartButtonLocalizedFrame} />
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.onboardingStartButtonText}>{i18n.t('start')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function TodayScreen({
  courseComplete,
  coursePassed,
  done,
  hasRoutineCustomizations,
  nextCourseAvailable,
  rate,
  routines,
  state,
  streak,
  total,
  visualSource,
  onAddRoutine,
  onCloseDay,
  onEditCard,
  onMoveRoutine,
  onOpenReflection,
  onRemoveRoutine,
  onRestoreRoutines,
  onRoutineEditingToggle,
  onShareApp,
  onStartNextCourse,
  onSettings,
  onToggleRoutine,
}: {
  courseComplete: boolean;
  coursePassed: boolean;
  done: number;
  hasRoutineCustomizations: boolean;
  nextCourseAvailable: boolean;
  rate: number;
  routines: Routine[];
  state: AppState;
  streak: number;
  total: number;
  visualSource: ImageSourcePropType;
  onAddRoutine: () => void;
  onCloseDay: () => void;
  onEditCard: (frame: CardVisualFrame) => void;
  onMoveRoutine: (id: string, targetIndex: number) => void;
  onOpenReflection: () => void;
  onRemoveRoutine: (id: string) => void;
  onRestoreRoutines: () => void;
  onRoutineEditingToggle: () => void;
  onShareApp: () => void;
  onStartNextCourse: () => void;
  onSettings: () => void;
  onToggleRoutine: (id: string) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const locked = state.today.isClosed || courseComplete;
  const [editingRoutines, setEditingRoutines] = useState(false);

  useEffect(() => {
    if (locked) setEditingRoutines(false);
  }, [locked]);

  const needsReflection = state.today.isClosed && !state.today.hasReflection;
  const nextCourse = state.currentCourse.level === 'BASIC'
    ? 'STANDARD'
    : state.currentCourse.level === 'STANDARD'
      ? 'HARD'
      : null;
  const canStartNextCourse = courseComplete && coursePassed && nextCourseAvailable && nextCourse !== null;
  const canShareApp = courseComplete && coursePassed && state.currentCourse.level === 'HARD';
  const nextCourseActionLabel = nextCourse ? t('startCourse', { level: nextCourse }) : '';
  const actionLabel = needsReflection
    ? t('writeReflection')
    : canStartNextCourse
      ? nextCourseActionLabel
      : canShareApp
        ? t('shareApp')
        : courseComplete
          ? t('courseState', { level: state.currentCourse.level, state: t(coursePassed ? 'complete' : 'ended') })
          : state.today.isClosed
            ? t('closeComplete')
            : t('closeDayAction');
  const actionDisabled = !needsReflection
    && !canStartNextCourse
    && !canShareApp
    && (courseComplete || state.today.isClosed);
  const action = needsReflection
    ? onOpenReflection
    : canStartNextCourse
      ? onStartNextCourse
      : canShareApp
        ? onShareApp
        : onCloseDay;
  const motto = i18n.motto(state.currentCourse.level, state.currentCourse.day);
  const standard = state.today.standard?.trim() || motto;
  const programDay = programDayForCourse(state.currentCourse.level, state.currentCourse.day);
  const programProgress = programProgressForCourse(state.currentCourse.level, state.currentCourse.day);

  return (
    <View style={styles.todayScreen}>
      <AppScreen>
        <TopBar
          title={t('today')}
          onSettings={onSettings}
        />
        <ProgramProgress
          courseDay={state.currentCourse.day}
          level={state.currentCourse.level}
          programDay={programDay}
          progress={programProgress}
        />
        <FireCard
          source={visualSource}
          label={t('todayStandard')}
          quote={standard}
          onEdit={onEditCard}
        />
        <SectionTitle title={t('todaySummary')} />
        <TodayProgressPanel done={done} rate={rate} streak={streak} total={total} />
        <SectionTitle
          actionLabel={!locked ? t(editingRoutines ? 'finishEditing' : 'edit') : undefined}
          title={t('todayRoutines')}
          onAction={!locked ? () => {
            onRoutineEditingToggle();
            setEditingRoutines((editing) => !editing);
          } : undefined}
        />
        <RoutineList
          editing={editingRoutines}
          locked={locked}
          routines={routines}
          onMove={onMoveRoutine}
          onRemove={onRemoveRoutine}
          onToggle={onToggleRoutine}
        />
        {editingRoutines && hasRoutineCustomizations ? (
          <TouchableOpacity
            accessibilityLabel={t('restoreDefaultRoutines')}
            accessibilityRole="button"
            activeOpacity={0.78}
            style={styles.routineRestoreButton}
            onPress={onRestoreRoutines}
          >
            <Ionicons accessible={false} color={colors.muted} name="refresh" size={15} />
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.routineRestoreText}>{t('restoreDefaultRoutines')}</Text>
          </TouchableOpacity>
        ) : null}
        <LinkButton accent disabled={locked} icon="add" label={t('addPersonalRoutine')} onPress={onAddRoutine} />
      </AppScreen>
      <View style={styles.todayActionDock}>
        <PrimaryButton disabled={actionDisabled} label={actionLabel} onPress={action} />
      </View>
    </View>
  );
}

function RecordsScreen({
  done,
  missed,
  rate,
  recordCourse,
  records,
  state,
  streak,
  total,
  visualSource,
  onCollection,
  onDetail,
  onOpenDay,
  onSelectCourse,
  onSettings,
  onVisualPress,
}: {
  done: number;
  missed: number;
  rate: number;
  recordCourse: AppState['currentCourse']['level'];
  records: DayRecord[];
  state: AppState;
  streak: number;
  total: number;
  visualSource: ImageSourcePropType;
  onCollection: () => void;
  onDetail: () => void;
  onOpenDay: (day: number) => void;
  onSelectCourse: (level: AppState['currentCourse']['level']) => void;
  onSettings: () => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const recent = records.slice(0, 3);
  const doneDays = records.filter((record) => record.status === 'complete').length;
  const missDays = records.filter((record) => record.status === 'incomplete').length;
  const availableCourses = programLevels.filter(
    (level) => level === state.currentCourse.level || state.records.some((record) => record.course === level),
  );
  const selectedCourseDay = recordCourse === state.currentCourse.level
    ? state.currentCourse.day
    : Math.max(1, ...records.map((record) => record.day));
  const selectedCourseProgress = recordCourse === state.currentCourse.level
    ? state.currentCourse.progress
    : Math.min(100, Math.round((records.length / 30) * 100));

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
      <CourseRecordTabs
        levels={availableCourses}
        selected={recordCourse}
        onSelect={onSelectCourse}
      />
      <ProcessCard
        caption={t('courseSummaryCaption', { done: doneDays, missed: missDays })}
        day={selectedCourseDay}
        level={recordCourse}
        progress={selectedCourseProgress}
      />
      <LinkButton label={t('view30Records')} onPress={onDetail} />
      <SectionTitle title={t('recentRecords')} />
      {recent.length ? (
        recent.map((record) => (
          <RecordCard key={record.id} record={record} onPress={() => onOpenDay(record.day)} />
        ))
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
  onShareApp,
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
  onShareApp: () => void;
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
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.stepTitle}>
            {stageMeta.number} {currentStage.title}
          </Text>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.period}>{i18n.dayRange(stageIndex * 7 + 1, stageIndex === 3 ? 30 : stageIndex * 7 + 7)}</Text>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.quote}>{currentStage.quote}</Text>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.bullet}>{t('stageStandards')}</Text>
          {currentStage.bullets.map((item) => (
            <Text key={item} maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.bullet}>- {item}</Text>
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
        <>
          <SettingLike label={t('finalCourse')} value={t(coursePassed ? 'complete' : courseComplete ? 'retryNeeded' : 'inProgress')} />
          {courseComplete && coursePassed ? (
            <View style={styles.nextCourseButton}>
              <PrimaryButton label={t('shareApp')} onPress={onShareApp} />
            </View>
          ) : null}
        </>
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
  recordCourse,
  records,
  state,
  onBack,
  onOpenDay,
}: {
  calendarCellSize: number;
  calendarWidth: number;
  recordCourse: AppState['currentCourse']['level'];
  records: DayRecord[];
  state: AppState;
  onBack: () => void;
  onOpenDay: (day: number) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const doneDays = new Set(
    records
      .filter((record) => record.status === 'complete')
      .map((record) => record.day),
  );
  const failDays = new Set(
    records
      .filter((record) => record.status === 'incomplete')
      .map((record) => record.day),
  );
  const selectedCourseDay = recordCourse === state.currentCourse.level
    ? state.currentCourse.day
    : Math.max(1, ...records.map((record) => record.day));
  const selectedCourseProgress = recordCourse === state.currentCourse.level
    ? state.currentCourse.progress
    : Math.min(100, Math.round((records.length / 30) * 100));

  return (
    <AppScreen>
      <TopBar title={t('records30')} subtitle={i18n.courseName(recordCourse)} onBack={onBack} />
      <ProcessCard
        caption={t('courseSummaryCaption', { done: doneDays.size, missed: failDays.size })}
        day={selectedCourseDay}
        level={recordCourse}
        progress={selectedCourseProgress}
      />
      <SectionTitle title={t('records30')} />
      <View style={[styles.grid30, { width: calendarWidth }]}>
        {Array.from({ length: 30 }, (_, index) => {
          const day = index + 1;
          const future = day > selectedCourseDay;
          const isToday = recordCourse === state.currentCourse.level && day === selectedCourseDay;
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
              <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={[styles.dayCellText, future && styles.dayFutureText]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <SectionTitle title={t('courseStages')} />
      <StageList currentDay={selectedCourseDay} level={recordCourse} />
    </AppScreen>
  );
}

function CollectionScreen({
  recordCourse,
  records,
  visualSource,
  onBack,
  onOpenDay,
  onVisualPress,
}: {
  recordCourse: AppState['currentCourse']['level'];
  records: DayRecord[];
  visualSource: ImageSourcePropType;
  onBack: () => void;
  onOpenDay: (day: number) => void;
  onVisualPress: (frame: CardVisualFrame) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <AppScreen>
      <TopBar title={t('recordCollection')} subtitle={i18n.courseName(recordCourse)} onBack={onBack} />
      <FireCard mini source={visualSource} first={t('recordsLeft')} second={t('countItems', { count: records.length })} onPress={onVisualPress} />
      <SectionTitle title={t('recordsByDate')} />
      {records.length ? (
        records.map((record) => (
          <RecordCard key={record.id} record={record} withDate onPress={() => onOpenDay(record.day)} />
        ))
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
        <View style={styles.profileText}>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.profileTitle}>ALPHA</Text>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.profileLevel}>{state.currentCourse.level} · {i18n.day(state.currentCourse.day)}</Text>
        </View>
      </Card>
      <View style={styles.settingsList}>
        <SettingRow
          checked={state.settings.notificationsEnabled}
          label={t('notificationSettings')}
          value={state.settings.notificationsEnabled ? 'ON' : 'OFF'}
          onPress={onNotificationsToggle}
        />
        <SettingRow
          checked={state.settings.hapticsEnabled}
          label={t('hapticSettings')}
          value={state.settings.hapticsEnabled ? t('vibration') : 'OFF'}
          onPress={onHapticsToggle}
        />
        <SettingRow label={t('language')} value={i18n.languageName(state.settings.language ?? 'system')} onPress={onLanguage} />
        <SettingRow label={t('dataReset')} onPress={onDataReset} />
        <SettingRow label={t('appInfo')} value={`v${appConfig.expo.version}`} onPress={onInfo} />
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
  onEdit,
  onPress,
  quote,
  second,
  source,
}: {
  first?: string;
  label?: string;
  mini?: boolean;
  onEdit?: (frame: CardVisualFrame) => void;
  onPress?: (frame: CardVisualFrame) => void;
  quote?: string;
  second?: string;
  source: ImageSourcePropType;
}) {
  const { locale, t } = useI18n();
  const displayQuote = quote ? formatFireQuote(quote, locale === 'ko') : undefined;
  const denseQuote = Boolean(displayQuote && displayQuote.length > 52);
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
      {label ? (
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.fireLabel}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.fireTextWrap, mini && styles.fireTextWrapMini]}>
        {displayQuote ? (
          <Text
            maxFontSizeMultiplier={FIRE_QUOTE_MAX_SCALE}
            numberOfLines={denseQuote ? 4 : 3}
            style={[styles.fireQuote, denseQuote && styles.fireQuoteDense]}
          >
            {displayQuote}
          </Text>
        ) : (
          <>
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} minimumFontScale={0.68} numberOfLines={1} style={[styles.fireText, mini && styles.fireTextMini]}>{first}</Text>
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} minimumFontScale={0.68} numberOfLines={1} style={[styles.fireText, styles.fireAccent, mini && styles.fireTextMini]}>{second}</Text>
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
      {onEdit ? (
        <TouchableOpacity
          accessibilityLabel={t('editTodayCard')}
          accessibilityRole="button"
          activeOpacity={0.72}
          hitSlop={4}
          style={styles.fireEditButton}
          onPress={() => onEdit(layoutRef.current ?? { height: 0, width: 0 })}
        >
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.75} numberOfLines={1} style={styles.fireEditText}>
            {t('edit')}
          </Text>
        </TouchableOpacity>
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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonPressable,
        style,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={disabled ? ['#351315', '#210b0d'] : ['#ff2b2b', '#ec171d', '#bd0d16']}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <View pointerEvents="none" style={[styles.buttonHighlight, disabled && styles.buttonHighlightDisabled]} />
        <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={[styles.buttonText, disabled && styles.buttonDisabledText, textStyle]}>{label}</Text>
        <Ionicons
          accessible={false}
          color={disabled ? '#7f4a4d' : 'rgba(255,255,255,0.86)'}
          name="arrow-forward"
          size={17}
          style={styles.buttonArrow}
        />
      </LinearGradient>
    </Pressable>
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
      <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={[styles.secondaryButtonText, danger && styles.dangerText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LinkButton({
  accent,
  disabled,
  icon,
  label,
  onPress,
}: {
  accent?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const displayLabel = icon ? label.replace(/^\+\s*/, '') : label;
  return (
    <TouchableOpacity
      accessibilityLabel={displayLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      activeOpacity={disabled ? 1 : 0.82}
      disabled={disabled}
      style={[styles.linkButton, accent && styles.linkButtonAccent, disabled && styles.disabledLink]}
      onPress={onPress}
    >
      <View style={styles.linkButtonContent}>
        {icon ? (
          <Ionicons
            accessible={false}
            color={disabled ? '#8a8a8f' : accent ? '#ff4545' : '#f3f3f3'}
            name={icon}
            size={16}
          />
        ) : null}
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={[styles.linkText, accent && styles.linkTextAccent, disabled && styles.disabledText]}>{displayLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionTitle({
  actionLabel,
  onAction,
  right,
  title,
}: {
  actionLabel?: string;
  onAction?: () => void;
  right?: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.sectionText}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          activeOpacity={0.72}
          hitSlop={10}
          style={styles.sectionAction}
          onPress={onAction}
        >
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.sectionRight}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : right ? <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

function ProgramProgress({
  courseDay,
  level,
  programDay,
  progress,
}: {
  courseDay: number;
  level: AppState['currentCourse']['level'];
  programDay: number;
  progress: number;
}) {
  const i18n = useI18n();
  const activeIndex = programLevels.indexOf(level);

  return (
    <View
      accessible
      accessibilityLabel={`${i18n.t('ninetyDayProgress')}: ${programDay} / 90, ${progress}%`}
      style={styles.programProgress}
    >
      <View style={styles.programTopRow}>
        <Text
          adjustsFontSizeToFit
          maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE}
          minimumFontScale={0.78}
          numberOfLines={1}
          style={styles.programDayLabel}
        >
          DAY <Text style={styles.programDayAccent}>{programDay}</Text> / 90
        </Text>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.programPercent}>{progress}%</Text>
      </View>
      <View style={styles.programSegments}>
        {programLevels.map((programLevel, index) => {
          const segmentProgress = index < activeIndex
            ? 100
            : index === activeIndex
              ? Math.min(100, Math.max(0, Math.round((courseDay / 30) * 100)))
              : 0;
          const active = index === activeIndex;
          return (
            <View key={programLevel} style={styles.programSegment}>
              <View style={styles.programTrack}>
                <View style={[styles.programFill, { width: `${segmentProgress}%` }]} />
              </View>
              <Text
                adjustsFontSizeToFit
                maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE}
                minimumFontScale={0.72}
                numberOfLines={1}
                style={[styles.programLevelLabel, active && styles.programLevelLabelActive]}
              >
                {programLevel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TodayProgressPanel({
  done,
  rate,
  streak,
  total,
}: {
  done: number;
  rate: number;
  streak: number;
  total: number;
}) {
  const i18n = useI18n();
  const reducedMotion = useReducedMotion();
  const animatedRate = useSharedValue(rate);

  useEffect(() => {
    animatedRate.set(withTiming(rate, {
      duration: reducedMotion ? 0 : 200,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    }));
  }, [animatedRate, rate, reducedMotion]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, animatedRate.get()))}%` as `${number}%`,
  }));

  return (
    <View style={styles.todayProgressCard}>
      <View style={styles.todayProgressMetrics}>
        <View>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.todayProgressLabel}>{i18n.t('today')}</Text>
          <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={styles.todayProgressValue}>{done} / {total}</Text>
        </View>
        <View style={styles.todayStreakBlock}>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.todayProgressLabel}>{i18n.t('streak')}</Text>
          <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={styles.todayStreakValue}>{i18n.dayCount(streak)}</Text>
        </View>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: rate, text: i18n.t('completedCount', { done, total }) }}
        style={styles.todayProgressTrack}
      >
        <Animated.View style={[styles.todayProgressFill, progressStyle]} />
      </View>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={[styles.statNum, item.accent && styles.redText]}>{item.value}</Text>
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={2} style={styles.statName}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function RoutineList({
  editing,
  locked,
  routines,
  onMove,
  onRemove,
  onToggle,
}: {
  editing?: boolean;
  locked?: boolean;
  routines: Routine[];
  onMove?: (id: string, targetIndex: number) => void;
  onRemove?: (id: string) => void;
  onToggle?: (id: string) => void;
}) {
  const i18n = useI18n();
  const basicRoutineCount = routines.filter((routine) => routine.type === 'basic').length;
  return (
    <View style={styles.routineList}>
      {routines.map((routine, index) => (
        <AnimatedRoutineRow
          editing={editing}
          index={index}
          key={routine.id}
          last={index === routines.length - 1}
          locked={locked}
          removable={routine.type !== 'basic' || basicRoutineCount > 1}
          routine={routine}
          title={routine.type === 'personal' ? routine.name : i18n.routine(routine.id, routine.name)}
          total={routines.length}
          onMove={onMove}
          onRemove={onRemove}
          onToggle={onToggle}
        />
      ))}
    </View>
  );
}

function AnimatedRoutineRow({
  editing,
  index,
  last,
  locked,
  removable,
  routine,
  title,
  total,
  onMove,
  onRemove,
  onToggle,
}: {
  editing?: boolean;
  index: number;
  last: boolean;
  locked?: boolean;
  removable: boolean;
  routine: Routine;
  title: string;
  total: number;
  onMove?: (id: string, targetIndex: number) => void;
  onRemove?: (id: string) => void;
  onToggle?: (id: string) => void;
}) {
  const i18n = useI18n();
  const reducedMotion = useReducedMotion();
  const rowScale = useSharedValue(1);
  const completion = useSharedValue(routine.done ? 1 : 0);
  const checkScale = useSharedValue(1);
  const dragOffset = useSharedValue(0);
  const dragging = useSharedValue(0);
  const previousDone = useRef(routine.done);

  useEffect(() => {
    const justCompleted = routine.done && !previousDone.current;
    previousDone.current = routine.done;
    completion.set(withTiming(routine.done ? 1 : 0, {
      duration: reducedMotion ? 0 : 160,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    }));
    if (justCompleted && !reducedMotion) {
      checkScale.set(withSequence(
        withTiming(0.88, { duration: 60, easing: EASE_OUT, reduceMotion: ReduceMotion.System }),
        withSpring(1, { duration: 260, dampingRatio: 0.82, reduceMotion: ReduceMotion.System }),
      ));
    } else {
      checkScale.set(1);
    }
  }, [checkScale, completion, reducedMotion, routine.done]);

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dragging.get() ? 0.92 : 1,
    transform: [
      { translateY: dragOffset.get() },
      { scale: rowScale.get() + dragging.get() * 0.012 },
    ],
    zIndex: dragging.get() ? 20 : 0,
  }));
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: completion.get(),
    transform: [{ scale: checkScale.get() }],
  }));

  function handlePressIn() {
    if (editing || locked || reducedMotion) return;
    rowScale.set(withTiming(0.985, { duration: 100, easing: EASE_OUT, reduceMotion: ReduceMotion.System }));
  }

  function handlePressOut() {
    if (editing || locked || reducedMotion) return;
    rowScale.set(withTiming(1, { duration: 120, easing: EASE_OUT, reduceMotion: ReduceMotion.System }));
  }

  function commitMove(targetIndex: number) {
    onMove?.(routine.id, targetIndex);
  }

  const dragGesture = Gesture.Pan()
    .enabled(Boolean(editing && !locked && onMove && total > 1))
    .activateAfterLongPress(90)
    .onBegin(() => {
      dragging.set(1);
    })
    .onUpdate((event) => {
      const minimumOffset = -index * ROUTINE_ROW_HEIGHT;
      const maximumOffset = (total - index - 1) * ROUTINE_ROW_HEIGHT;
      dragOffset.set(Math.max(minimumOffset, Math.min(maximumOffset, event.translationY)));
    })
    .onEnd(() => {
      const targetIndex = Math.max(
        0,
        Math.min(total - 1, index + Math.round(dragOffset.get() / ROUTINE_ROW_HEIGHT)),
      );
      if (targetIndex !== index) runOnJS(commitMove)(targetIndex);
    })
    .onFinalize(() => {
      dragOffset.set(withTiming(0, { duration: reducedMotion ? 0 : 140, easing: EASE_OUT }));
      dragging.set(withTiming(0, { duration: reducedMotion ? 0 : 140, easing: EASE_OUT }));
    });

  const reorderActions = [
    ...(index > 0
      ? [{ name: 'decrement' as const, label: i18n.t('moveRoutineUp', { name: title }) }]
      : []),
    ...(index < total - 1
      ? [{ name: 'increment' as const, label: i18n.t('moveRoutineDown', { name: title }) }]
      : []),
  ];

  return (
    <Animated.View
      style={[
        styles.routinePressSurface,
        styles.routineRow,
        editing && styles.routineRowEditing,
        last && styles.lastRow,
        rowAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: routine.done, disabled: Boolean(locked || editing) }}
        activeOpacity={1}
        disabled={locked || editing}
        pressRetentionOffset={10}
        style={styles.routineToggle}
        onPress={() => onToggle?.(routine.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.check}>
          <Animated.View style={[styles.checkFill, checkAnimatedStyle]} />
          <Animated.Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={[styles.checkText, checkAnimatedStyle]}>✓</Animated.Text>
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={[styles.routineText, locked && styles.lockedText]}>{title}</Text>
        {routine.type === 'personal' ? <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={styles.personalBadge}>{i18n.t('personal')}</Text> : null}
      </TouchableOpacity>
      {editing && !locked ? (
        <View style={styles.routineEditActions}>
          <GestureDetector gesture={dragGesture}>
            <Animated.View
              accessible
              accessibilityActions={reorderActions}
              accessibilityLabel={i18n.t('reorderRoutine', { name: title })}
              accessibilityRole="adjustable"
              accessibilityValue={{ text: `${index + 1} / ${total}` }}
              style={styles.routineDragHandle}
              onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === 'decrement' && index > 0) commitMove(index - 1);
                if (event.nativeEvent.actionName === 'increment' && index < total - 1) commitMove(index + 1);
              }}
            >
              <Ionicons accessible={false} color={colors.soft} name="reorder-three-outline" size={21} />
            </Animated.View>
          </GestureDetector>
          <TouchableOpacity
            accessibilityLabel={i18n.t('deleteRoutine', { name: title })}
            accessibilityRole="button"
            accessibilityState={{ disabled: !removable }}
            activeOpacity={0.78}
            disabled={!removable}
            style={[styles.routineDeleteButton, !removable && styles.routineEditButtonDisabled]}
            onPress={() => onRemove?.(routine.id)}
          >
            <Ionicons accessible={false} color={removable ? colors.red : colors.muted} name="trash-outline" size={19} />
          </TouchableOpacity>
        </View>
      ) : locked ? (
        <Ionicons accessible={false} color={colors.muted} name="lock-closed-outline" size={15} />
      ) : null}
    </Animated.View>
  );
}

function CourseRecordTabs({
  levels,
  selected,
  onSelect,
}: {
  levels: AppState['currentCourse']['level'][];
  selected: AppState['currentCourse']['level'];
  onSelect: (level: AppState['currentCourse']['level']) => void;
}) {
  const i18n = useI18n();
  if (levels.length <= 1) return null;

  return (
    <View style={styles.recordCourseTabs}>
      {levels.map((level) => {
        const active = level === selected;
        return (
          <TouchableOpacity
            accessibilityLabel={i18n.courseName(level)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            activeOpacity={0.8}
            key={level}
            style={[styles.recordCourseTab, active && styles.recordCourseTabActive]}
            onPress={() => onSelect(level)}
          >
            <Text
              adjustsFontSizeToFit
              maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.recordCourseTabText, active && styles.recordCourseTabTextActive]}
            >
              {i18n.courseName(level)}
            </Text>
          </TouchableOpacity>
        );
      })}
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
      <View style={styles.processCopy}>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.processTitle}>{i18n.courseName(level)}</Text>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.processDay}>{i18n.day(day)} / 30</Text>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.processCaption}>{caption}</Text>
      </View>
      <CircularProgress progress={progress} />
    </Card>
  );
}

function CircularProgress({ progress }: { progress: number }) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const roundedProgress = Math.round(normalizedProgress);
  const size = 60;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedProgress / 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: roundedProgress, text: `${roundedProgress}%` }}
      style={styles.ring}
    >
      <Svg height={size} width={size}>
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          fill="none"
          origin={`${center}, ${center}`}
          r={radius}
          rotation="-90"
          stroke={normalizedProgress > 0 ? colors.red : 'transparent'}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </Svg>
      <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={styles.ringText}>{roundedProgress}%</Text>
    </View>
  );
}

function RecordCard({
  empty,
  onPress,
  record,
  withDate,
}: {
  empty?: boolean;
  onPress?: () => void;
  record?: DayRecord;
  withDate?: boolean;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  if (empty || !record) {
    return (
      <Card style={styles.recordCard}>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.recordText}>{t('noRecord')}</Text>
      </Card>
    );
  }

  const status = t(record.status === 'complete' ? 'complete' : 'incomplete');
  const reflection = record.reflection || t('noRecord');
  return (
    <Pressable
      accessible
      accessibilityLabel={`${withDate ? `${i18n.date(record.date)}, ` : ''}${i18n.day(record.day)}, ${status}, ${reflection}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.recordPressablePressed}
    >
      <Card style={styles.recordCard}>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.recordDay}>
          {withDate ? `${i18n.date(record.date)} · ` : ''}{i18n.day(record.day)} ·{' '}
          <Text style={styles.badge}>{status}</Text>
        </Text>
        {record.standard ? (
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.recordStandard}>
            <Text style={styles.recordStandardLabel}>{t('todayStandard')} · </Text>{record.standard}
          </Text>
        ) : null}
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={3} style={styles.recordText}>{reflection}</Text>
        <Ionicons accessible={false} color="#777" name="chevron-forward" size={19} style={styles.recordArrow} />
      </Card>
    </Pressable>
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
  const dayRange = i18n.dayRange(index * 7 + 1, index === 3 ? 30 : index * 7 + 7);
  const stateLabel = i18n.t(state === 'done' ? 'complete' : state === 'active' ? 'inProgress' : 'locked');
  const stateIcon = state === 'done' ? 'checkmark-circle' : state === 'active' ? 'radio-button-on' : 'lock-closed';

  return (
    <View
      accessible
      accessibilityLabel={`${item.number} ${localizedStage.title}, ${dayRange}, ${stateLabel}`}
      style={[
        styles.stageItem,
        last && styles.lastRow,
        state === 'active' && styles.stageActive,
        state === 'locked' && styles.stageLocked,
      ]}
    >
      {state === 'active' ? <View pointerEvents="none" style={styles.stageActiveBorder} /> : null}
      <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} numberOfLines={1} style={[styles.stageNumber, state === 'active' && styles.stageActiveText]}>
        {item.number}
      </Text>
      <Text
        adjustsFontSizeToFit
        maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
        minimumFontScale={0.76}
        numberOfLines={2}
        style={[styles.stageTitle, state === 'active' && styles.stageActiveText]}
      >
        {localizedStage.title}
      </Text>
      <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.stagePeriod}>{dayRange}</Text>
      <Ionicons
        accessible={false}
        color={state === 'active' ? colors.red : '#777'}
        name={stateIcon}
        size={state === 'active' ? 13 : 14}
        style={styles.stageStateIcon}
      />
    </View>
  );
}

function SettingLike({ label, style, value }: { label: string; style?: object; value?: string }) {
  return (
    <View style={[styles.settingLike, style]}>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.settingLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.settingValue}>{value}</Text>
      <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={styles.settingArrow}>›</Text>
    </View>
  );
}

function SettingRow({
  checked,
  label,
  value,
  onPress,
}: {
  checked?: boolean;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole={checked === undefined ? 'button' : 'switch'}
      accessibilityState={checked === undefined ? undefined : { checked }}
      accessibilityValue={value ? { text: value } : undefined}
      activeOpacity={0.8}
      style={styles.settingRow}
      onPress={onPress}
    >
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.settingLabel}>{label}</Text>
      {value ? <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.settingValue}>{value}</Text> : null}
      <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={styles.settingArrow}>›</Text>
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
    <View style={[styles.tabs, { bottom: Math.max(bottomInset, 7) }]}>
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
            <Ionicons
              accessible={false}
              color={selected ? colors.red : '#777'}
              name={selected ? tab.selectedIcon : tab.icon}
              size={22}
            />
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={[styles.tabText, selected && styles.tabActiveText]}>{t(tab.id)}</Text>
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
  const insets = useSafeAreaInsets();
  return (
    <Modal animationType="fade" transparent visible={open} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.modalOverlay,
          alignBottom && styles.modalBottomOverlay,
          !alignBottom && {
            paddingBottom: Math.max(insets.bottom, 14),
            paddingTop: Math.max(insets.top, 14),
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function IncompleteCloseModal({
  missed,
  open,
  onBack,
  onConfirm,
}: {
  missed: number;
  open: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  return (
    <BaseModal open={open} onClose={onBack}>
      <View style={styles.incompleteCloseModal}>
        <View style={styles.incompleteCloseIcon}>
          <Ionicons accessible={false} color={colors.red} name="alert-outline" size={30} />
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.incompleteCloseTitle}>{t('incompleteCloseTitle', { count: missed })}</Text>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.incompleteCloseCopy}>{t('incompleteCloseCopy')}</Text>
        <View style={styles.incompleteCloseActions}>
          <SecondaryButton label={t('returnToRoutines')} style={styles.incompleteCloseSecondary} onPress={onBack} />
          <PrimaryButton label={t('closeIncomplete')} onPress={onConfirm} />
        </View>
      </View>
    </BaseModal>
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
            <Text maxFontSizeMultiplier={DISPLAY_TEXT_MAX_SCALE} style={styles.resultIconText}>{complete ? '✓' : '!'}</Text>
          </View>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={[styles.finishTitle, !complete && styles.failTitle, !complete && styles.finishTitleWithoutCopy]}>{t(complete ? 'resultCompleteTitle' : 'resultIncompleteTitle')}</Text>
          {complete ? <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.finishCopy}>{t('resultCompleteCopy')}</Text> : null}
        </View>
        <View style={styles.resultTable}>
          <ResultRow label={t('completedRoutines')} value={t('countItems', { count: done })} />
          <ResultRow label={t('incompleteRoutines')} value={t('countItems', { count: missed })} />
          <ResultRow label={t('completionStreakLabel')} value={i18n.dayCount(streak)} last />
        </View>
        <View style={styles.finishActions}>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('reflection')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('todayRecord')}</Text>
        <TextInput
          maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
          maxLength={160}
          multiline
          placeholder=""
          placeholderTextColor={colors.muted}
          style={styles.textarea}
          textAlignVertical="top"
          value={text}
          onChangeText={onChangeText}
        />
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.counter}>{text.length} / 160</Text>
        <View style={styles.row2}>
          <SecondaryButton label={t('cancel')} style={styles.evenModalButton} onPress={onClose} />
          <PrimaryButton label={t('save')} style={styles.evenModalButton} onPress={onSave} />
        </View>
      </View>
    </BaseModal>
  );
}

function TodayStandardModal({
  defaultText,
  open,
  text,
  onChangeText,
  onClose,
  onSave,
}: {
  defaultText: string;
  open: boolean;
  text: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <BaseModal open={open} onClose={onClose}>
      <View style={[styles.centerModal, styles.standardModal]}>
        <View style={styles.modalHead}>
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('todayStandard')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.standardModalScroll}
          contentContainerStyle={styles.standardModalContent}
        >
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('defaultStandardLabel')}</Text>
          <View style={styles.standardDefaultBox}>
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={3} style={styles.standardDefaultText}>{defaultText}</Text>
          </View>
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('standardPrompt')}</Text>
          <TextInput
            autoFocus
            maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
            maxLength={80}
            multiline
            placeholder={t('standardPlaceholder')}
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            style={styles.standardInput}
            textAlignVertical="top"
            value={text}
            onChangeText={onChangeText}
          />
          <View style={styles.standardInputMeta}>
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.standardHelper}>{t('standardDefaultHelper')}</Text>
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.standardCounter}>{text.length} / 80</Text>
          </View>
        </ScrollView>
        <View style={styles.standardModalActions}>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('personalRoutineAdd')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('routineName')}</Text>
        <TextInput
          maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE}
          maxLength={40}
          placeholder={t('routinePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={routineName}
          onChangeText={onChangeName}
        />
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('category')}</Text>
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
              <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={2} style={[styles.chipText, selectedCat === category && styles.chipActiveText]}>{i18n.category(category)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.field}>{t('scope')}</Text>
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
              <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={2} style={[styles.segText, selectedScope === scope && styles.segActiveText]}>{i18n.scope(scope)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row2WithTop}>
          <SecondaryButton label={t('cancel')} style={styles.evenModalButton} onPress={onClose} />
          <PrimaryButton disabled={!routineName.trim()} label={t('add')} style={styles.evenModalButton} onPress={onAdd} />
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('dataReset')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.resetCopy}>{t('resetCopy')}</Text>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('appInfo')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <DateRow label={t('app')} value="ALPHA: REFORGE" />
        <DateRow label={t('version')} value={APP_VERSION_LABEL} />
        <DateRow label={t('course')} value={t('course30Days', { level })} />
        <DateRow label={t('storage')} value={t('storedOnDevice')} />
      </View>
    </BaseModal>
  );
}

function DayDetailSheet({
  course,
  day,
  open,
  records,
  routines,
  state,
  onClose,
}: {
  course: AppState['currentCourse']['level'];
  day: number | null;
  open: boolean;
  records: DayRecord[];
  routines: Routine[];
  state: AppState;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const i18n = useI18n();
  const { t } = i18n;
  const currentCourseSelected = course === state.currentCourse.level;
  const selectedCourseDay = currentCourseSelected
    ? state.currentCourse.day
    : Math.max(1, ...records.map((record) => record.day));
  const selected = day ?? selectedCourseDay;
  const future = selected > selectedCourseDay;
  const record = records.find((item) => item.course === course && item.day === selected);
  const today = currentCourseSelected && selected === state.currentCourse.day;
  const anchorRecord = records[records.length - 1];
  const courseStartedAt = currentCourseSelected
    ? state.currentCourse.startedAt
    : anchorRecord
      ? dateForCourseDay(anchorRecord.date, 2 - anchorRecord.day)
      : state.today.date;
  const date = future
    ? dateForCourseDay(courseStartedAt, selected)
    : record?.date ?? (today ? state.today.date : dateForCourseDay(courseStartedAt, selected));
  const storedRoutines = state.routinesByDate[date];
  const recordRoutineIds = new Set([...(record?.completedRoutineIds ?? []), ...(record?.missedRoutineIds ?? [])]);
  const storedRoutinesMatchRecord = storedRoutines?.some((routine) => recordRoutineIds.has(routine.id));
  const shownRoutines = today
    ? routines
    : storedRoutinesMatchRecord
      ? storedRoutines
      : courseRoutinesFor(course, selected);
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
        <View style={[styles.modalHead, styles.bottomSheetHeader]}>
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{i18n.day(selected)}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator
          style={styles.bottomSheetScroll}
          contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: Math.max(insets.bottom, 28) }]}
        >
          <DateRow label={t('date')} value={i18n.date(date)} />
          <DateRow accent={!future && statusKey === 'incomplete'} label={t('status')} muted={future} value={t(statusKey)} />
          <DateRow
            label={t('stage')}
            value={`${String(stageForDay(selected)).padStart(2, '0')}. ${i18n.stage(course, stageForDay(selected) - 1).title}`}
          />
          <DateRow label={t('routineCompletion')} value={future ? '-' : `${completed} / ${courseRoutineTotal(shownRoutines)}`} />
          <DateRow
            label={t('todayStandard')}
            muted={future}
            value={future ? '-' : (today ? state.today.standard : record?.standard) || t('noStandard')}
          />
          <SectionTitle title={t('routines')} />
          <RoutineList
            locked
            routines={shownRoutines.map((routine) => ({
              ...routine,
              done: future ? false : today ? routine.done : record ? record.completedRoutineIds.includes(routine.id) : false,
            }))}
          />
          <SectionTitle title={t('reflection')} />
          <View style={styles.noteBox}>
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} style={styles.noteText}>{note}</Text>
          </View>
        </ScrollView>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('languageTitle')}</Text>
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
                accessibilityRole="button"
                accessibilityState={{ selected }}
                activeOpacity={0.8}
                key={item}
                style={[styles.languageRow, selected && styles.languageRowSelected]}
                onPress={() => onSelect(item)}
              >
                <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={[styles.languageText, selected && styles.languageTextSelected]}>{i18n.languageName(item)}</Text>
                <Ionicons
                  accessible={false}
                  color={selected ? colors.red : colors.muted}
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </BaseModal>
  );
}

function TodayCardEditSheet({
  bottomInset,
  open,
  onClose,
  onEditImage,
  onEditStandard,
}: {
  bottomInset: number;
  open: boolean;
  onClose: () => void;
  onEditImage: () => void;
  onEditStandard: () => void;
}) {
  const { t } = useI18n();
  return (
    <BaseModal alignBottom open={open} onClose={onClose}>
      <View style={[styles.cardImageSheet, { paddingBottom: Math.max(bottomInset, 16) }]}>
        <View style={styles.modalHead}>
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{t('editTodayCard')}</Text>
          <TouchableOpacity accessibilityLabel={t('close')} accessibilityRole="button" activeOpacity={0.78} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          accessibilityLabel={t('todayStandard')}
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.cardImageAction}
          onPress={onEditStandard}
        >
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.cardImageActionText}>{t('todayStandard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={t('cardImage')}
          accessibilityRole="button"
          activeOpacity={0.78}
          style={styles.cardImageAction}
          onPress={onEditImage}
        >
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.cardImageActionText}>{t('cardImage')}</Text>
        </TouchableOpacity>
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
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} minimumFontScale={0.72} numberOfLines={1} style={styles.modalTitle}>{title}</Text>
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
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.cardImageActionText}>{t('choosePhoto')}</Text>
        </TouchableOpacity>
        {hasCustomImage ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.78}
            style={styles.cardImageAction}
            onPress={onRestore}
          >
            <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.cardImageRestoreText}>{t('restoreDefaultImage')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </BaseModal>
  );
}

function ResultRow({ label, last, value }: { label: string; last?: boolean; value: string }) {
  return (
    <View style={[styles.resultRow, last && styles.lastRow]}>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.resultLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.resultValue}>{value}</Text>
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
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={2} style={styles.dateLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={3} style={[styles.dateValue, accent && styles.redText, muted && styles.mutedText]}>{value}</Text>
    </View>
  );
}

function Toast({
  actionLabel,
  bottom,
  message,
  onAction,
}: {
  actionLabel?: string;
  bottom: number;
  message: string;
  onAction?: () => void;
}) {
  return (
    <View accessibilityLiveRegion="polite" style={[styles.toast, { bottom }]}>
      <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={3} style={styles.toastText}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          activeOpacity={0.76}
          style={styles.toastAction}
          onPress={onAction}
        >
          <Text maxFontSizeMultiplier={COMPACT_TEXT_MAX_SCALE} numberOfLines={1} style={styles.toastActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
    paddingBottom: 52,
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
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 13,
    minHeight: 42,
  },
  backrow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 9,
    minWidth: 0,
  },
  topTitleWrap: {
    flex: 1,
    minWidth: 0,
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
  onboardingStartButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    position: 'absolute',
  },
  onboardingStartButtonLocalizedFrame: {
    borderColor: 'rgba(241, 25, 25, 0.82)',
    borderRadius: 10,
    borderWidth: 1,
    bottom: '19%',
    left: '7.3%',
    position: 'absolute',
    right: '7.3%',
    top: '19%',
  },
  onboardingStartButtonImage: {
    height: '100%',
    width: '100%',
  },
  onboardingStartButtonText: {
    color: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 19,
    textAlign: 'center',
  },
  programProgress: {
    marginBottom: 14,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  programTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  programDayLabel: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 22,
    fontWeight: '900',
  },
  programDayAccent: {
    color: colors.red,
  },
  programPercent: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 12,
  },
  programSegments: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },
  programSegment: {
    flex: 1,
    minWidth: 0,
  },
  programTrack: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
  },
  programFill: {
    backgroundColor: colors.red,
    borderRadius: 999,
    height: '100%',
  },
  programLevelLabel: {
    color: '#68686d',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 5,
    textAlign: 'center',
  },
  programLevelLabelActive: {
    color: colors.red,
  },
  fireCard: {
    borderColor: 'rgba(241,25,25,0.42)',
    height: 142,
    justifyContent: 'flex-end',
    marginBottom: 2,
    padding: 16,
  },
  cardImagePressTarget: {
    ...StyleSheet.absoluteFill,
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
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 24,
    zIndex: 2,
  },
  fireTextWrapMini: {
    justifyContent: 'center',
    paddingTop: 0,
  },
  fireEditButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 1,
    width: 64,
    zIndex: 5,
  },
  fireEditText: {
    color: '#d9d9dc',
    fontSize: 11,
    fontWeight: '900',
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
    fontSize: 17,
    fontWeight: '900',
    includeFontPadding: false,
    paddingRight: 2,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
    ...(Platform.OS === 'ios' ? { lineHeight: 24 } : {}),
  },
  fireQuoteDense: {
    fontSize: 15,
    ...(Platform.OS === 'ios' ? { lineHeight: 18 } : {}),
  },
  section: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 9,
    marginHorizontal: 2,
    marginTop: 18,
  },
  sectionText: {
    color: '#eeeeee',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 36,
  },
  sectionRight: {
    color: colors.red,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '900',
  },
  todayProgressCard: {
    paddingHorizontal: 2,
  },
  todayProgressMetrics: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayProgressLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  todayProgressValue: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 26,
    marginTop: 3,
  },
  todayStreakBlock: {
    alignItems: 'flex-end',
  },
  todayStreakValue: {
    color: colors.soft,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
  },
  todayProgressTrack: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    height: 7,
    marginTop: 13,
    overflow: 'hidden',
  },
  todayProgressFill: {
    backgroundColor: colors.red,
    borderRadius: 999,
    height: '100%',
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
  routinePressSurface: {
    width: '100%',
  },
  routineRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.075)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: ROUTINE_ROW_HEIGHT,
    paddingLeft: 12,
    paddingRight: 6,
  },
  routineRowEditing: {
    backgroundColor: 'rgba(255,255,255,0.018)',
  },
  routineToggle: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: '100%',
    minWidth: 0,
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
  checkFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.red,
    borderColor: '#ff4747',
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: colors.red,
    shadowOpacity: 0.28,
    shadowRadius: 14,
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
  routineEditActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 2,
    width: 80,
  },
  routineDragHandle: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 40,
  },
  routineDeleteButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 40,
  },
  routineEditButtonDisabled: {
    opacity: 0.38,
  },
  routineRestoreButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
  },
  routineRestoreText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
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
  linkButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  linkButtonAccent: {
    backgroundColor: 'rgba(241,25,25,0.045)',
    borderColor: 'rgba(241,25,25,0.32)',
  },
  linkTextAccent: {
    color: '#ff4545',
  },
  disabledLink: {
    opacity: 0.55,
  },
  disabledText: {
    color: '#8a8a8f',
  },
  todayScreen: {
    flex: 1,
  },
  todayActionDock: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.screenX,
    paddingTop: 6,
  },
  hiddenStat: {
    height: 0,
    opacity: 0,
  },
  buttonPressable: {
    borderRadius: radius.button,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  button: {
    alignItems: 'center',
    borderColor: 'rgba(255,105,105,0.34)',
    borderRadius: radius.button,
    borderWidth: 1,
    height: spacing.buttonHeight,
    justifyContent: 'center',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  buttonHighlight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: 1,
    left: 18,
    position: 'absolute',
    right: 18,
    top: 0,
  },
  buttonHighlightDisabled: {
    backgroundColor: 'rgba(255,75,75,0.1)',
  },
  buttonDisabled: {
    borderColor: 'rgba(241,25,25,0.18)',
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    paddingHorizontal: 42,
    textAlign: 'center',
  },
  buttonArrow: {
    position: 'absolute',
    right: 18,
  },
  buttonDisabledText: {
    color: '#956a6d',
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
  recordCourseTabs: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    padding: 4,
  },
  recordCourseTab: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  recordCourseTabActive: {
    backgroundColor: 'rgba(241,25,25,0.16)',
    borderColor: 'rgba(241,25,25,0.42)',
    borderWidth: 1,
  },
  recordCourseTabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  recordCourseTabTextActive: {
    color: colors.white,
  },
  processCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  processCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
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
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: 60,
  },
  ringText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  recordCard: {
    marginBottom: 10,
    minHeight: 74,
    padding: 14,
  },
  recordPressablePressed: {
    opacity: 0.78,
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
  recordStandard: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
    marginBottom: 5,
    paddingRight: 18,
  },
  recordStandardLabel: {
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
    position: 'absolute',
    right: 14,
    top: 27,
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
    backgroundColor: colors.red,
    borderRadius: 999,
    bottom: 8,
    left: 0,
    position: 'absolute',
    top: 8,
    width: 3,
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
  stageStateIcon: {
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
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  settingLabel: {
    color: colors.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 0,
  },
  settingValue: {
    color: '#777',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 10,
    maxWidth: '48%',
    textAlign: 'right',
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
  profileText: {
    flex: 1,
    minWidth: 0,
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
  incompleteCloseModal: {
    alignItems: 'center',
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderRadius: radius.modal,
    borderWidth: 1,
    padding: 22,
    width: '100%',
  },
  incompleteCloseIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(236,23,29,0.1)',
    borderColor: 'rgba(255,43,43,0.36)',
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    marginBottom: 18,
    width: 60,
  },
  incompleteCloseTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center',
  },
  incompleteCloseCopy: {
    color: '#a9a9ae',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  incompleteCloseActions: {
    gap: 10,
    marginTop: 24,
    width: '100%',
  },
  incompleteCloseSecondary: {
    flex: 0,
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
  finishTitleWithoutCopy: {
    marginBottom: 0,
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
    width: '100%',
  },
  finishReflectionButton: {
    width: '100%',
  },
  centerModal: {
    backgroundColor: '#070707',
    borderColor: 'rgba(255,255,255,0.17)',
    borderRadius: radius.modal,
    borderWidth: 1,
    maxHeight: '100%',
    padding: 18,
    width: '100%',
  },
  standardModal: {
    overflow: 'hidden',
  },
  standardModalScroll: {
    flexShrink: 1,
  },
  standardModalContent: {
    paddingBottom: 2,
  },
  standardModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
  modalHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.white,
    flex: 1,
    flexShrink: 1,
    fontSize: 19,
    fontWeight: '900',
    minWidth: 0,
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
  standardInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    height: 108,
    lineHeight: 25,
    padding: 13,
  },
  standardDefaultBox: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 78,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  standardDefaultText: {
    color: '#d4d4d7',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
  },
  standardInputMeta: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 7,
  },
  standardHelper: {
    color: '#85858a',
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  standardCounter: {
    color: '#888',
    fontSize: 11,
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
    overflow: 'hidden',
    paddingTop: 19,
    width: '100%',
  },
  bottomSheetHeader: {
    marginHorizontal: 16,
  },
  bottomSheetScroll: {
    flexShrink: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
  },
  dateRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingVertical: 12,
  },
  dateLabel: {
    color: '#8b8b90',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  dateValue: {
    color: colors.white,
    flex: 1.7,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 16,
    textAlign: 'right',
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
    alignItems: 'center',
    backgroundColor: '#141416',
    borderColor: 'rgba(241,25,25,0.45)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
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
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  toastAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 2,
  },
  toastActionText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
});
