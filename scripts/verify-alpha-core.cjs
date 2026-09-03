const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const outputDirectory = mkdtempSync(join(tmpdir(), 'alpha-core-'));
const tsc = resolve('node_modules/.bin/tsc');

try {
  execFileSync(tsc, [
    '--ignoreConfig',
    '--module', 'commonjs',
    '--target', 'es2020',
    '--moduleResolution', 'node',
    '--ignoreDeprecations', '6.0',
    '--skipLibCheck',
    '--outDir', outputDirectory,
    'src/types.ts',
    'src/data.ts',
    'src/domain/alpha.ts',
    'src/domain/stateLifecycle.ts',
  ], { stdio: 'inherit' });

  const { basicRoutines, courseRoutinesFor, courseStageForDay, createInitialState, dailyMottos, dailyMottoFor, dateForCourseDay } = require(join(outputDirectory, 'data.js'));
  const { applyRoutinePreferences, courseResultForRoutines, courseRoutinePreferencesFor, courseStateFor, createRecordForDay, doneCount, elapsedCourseDayForDate, mergeRecord, programDayForCourse, programProgressForCourse, progressForRecords, recordsForCourse, restoreRoutineAtPosition, routinesForNewDay, streakCount } = require(join(outputDirectory, 'domain/alpha.js'));
  const { canRestartCurrentCourse, canStartNextCourse, courseCompletionRate, courseRoutineTemplatesFor, hasPassedCurrentCourse, isCourseComplete, nextCourseLevel, reconcileStateForDate, reopenTodayForEditing, resetProgressPreservingSettings, restartCurrentCourse, startNextCourse } = require(join(outputDirectory, 'domain/stateLifecycle.js'));
  const appSource = readFileSync(resolve('App.tsx'), 'utf8');

  assert.equal(appSource.includes('>BASIC 과정</Text>'), false);
  assert.equal(appSource.includes('value="BASIC 30일"'), false);
  assert.equal(appSource.includes('basicRoutines'), false);
  assert.equal(appSource.includes('stageItems'), false);
  assert.equal(appSource.includes('<SectionTitle title="기본 루틴" />'), false);
  assert.equal(appSource.includes('accessibilityRole="tab"'), false);
  assert.equal(appSource.includes('accessibilityRole="radio"'), false);
  assert.ok(appSource.includes('name="reorder-three-outline"'));
  assert.ok(appSource.includes('disabled={!routineName.trim()}'));
  assert.equal(appSource.includes('v19 · 1.0.0'), false);
  assert.ok(appSource.includes('value={APP_VERSION_LABEL}'));
  assert.ok(appSource.includes('style={styles.standardModalScroll}'));
  assert.ok(appSource.includes('style={styles.bottomSheetScroll}'));
  assert.ok(appSource.includes("accessibilityRole={checked === undefined ? 'button' : 'switch'}"));
  assert.ok(appSource.includes('onPress={() => onOpenDay(record.day)}'));
  assert.ok(appSource.includes('await Share.share'));
  assert.ok(appSource.includes("const APP_SHARE_URL = '';"));
  assert.equal(appSource.includes('apps.apple.com'), false);
  assert.equal(appSource.includes('play.google.com'), false);

  const todayScreenSource = appSource.slice(
    appSource.indexOf('function TodayScreen'),
    appSource.indexOf('function RecordsScreen'),
  );
  assert.ok(todayScreenSource.includes('canStartNextCourse'));
  assert.ok(todayScreenSource.includes('canShareApp'));
  assert.ok(todayScreenSource.includes("t('shareApp')"));
  assert.ok(todayScreenSource.includes('onStartNextCourse'));
  assert.ok(todayScreenSource.includes('onShareApp'));

  const courseScreenSource = appSource.slice(
    appSource.indexOf('function CourseScreen'),
    appSource.indexOf('function DetailScreen'),
  );
  assert.ok(courseScreenSource.includes("state.currentCourse.level === 'BASIC'"));
  assert.ok(courseScreenSource.includes("t('shareApp')"));
  assert.ok(courseScreenSource.includes('onShareApp'));

  const chooseCardImageSource = appSource.slice(
    appSource.indexOf('async function chooseCardImage'),
    appSource.indexOf('async function saveCroppedCardImage'),
  );
  assert.ok(chooseCardImageSource.indexOf('launchImageLibraryAsync') >= 0);
  assert.ok(
    chooseCardImageSource.indexOf('launchImageLibraryAsync') <
      chooseCardImageSource.lastIndexOf('setCardVisualSelection(null)'),
    'The card image sheet must stay mounted until the native image picker finishes.',
  );
  assert.ok(
    chooseCardImageSource.includes('setCardCropSelection'),
    'A selected card image must open the crop editor before it is saved.',
  );
  assert.equal(
    chooseCardImageSource.includes('cardVisuals.save'),
    false,
    'The original camera image must not be persisted before crop confirmation.',
  );
  assert.ok(appSource.includes('<CardImageCropEditor'));
  assert.ok(
    appSource.includes('frame.width / frame.height'),
    'Card image cropping must use the dimensions of the card the user actually tapped.',
  );
  assert.ok(
    appSource.includes('aspectRatio={cardCropSelection.aspectRatio}'),
    'The measured card aspect ratio must reach the crop editor.',
  );

  function stateFor(date, startedAt = date) {
    const state = createInitialState();
    state.hasOnboarded = true;
    state.currentCourse.startedAt = startedAt;
    state.today = { date, isClosed: false, hasReflection: false, result: null };
    state.routinesByDate = { [date]: basicRoutines.map((routine) => ({ ...routine })) };
    state.currentCourse = courseStateFor(state, date, state.records);
    return state;
  }

  function closeCourseDay(state, { complete = false, reflection, date = state.today.date } = {}) {
    const routines = (state.routinesByDate[date] ?? routinesForNewDay(state)).map((routine) => ({
      ...routine,
      done: routine.type === 'personal' ? routine.done : complete,
    }));
    const record = createRecordForDay({
      closedAt: `${date}T20:00:00.000Z`,
      date,
      day: state.currentCourse.day,
      level: state.currentCourse.level,
      reflection,
      routines,
      standard: state.today.standard,
      status: courseResultForRoutines(routines),
    });
    const records = mergeRecord(state.records, record);
    return {
      ...state,
      currentCourse: courseStateFor(state, date, records),
      today: {
        date,
        hasReflection: Boolean(reflection),
        isClosed: true,
        result: record.status,
        standard: state.today.standard,
        closedAt: record.closedAt,
      },
      records,
      routinesByDate: {
        ...state.routinesByDate,
        [date]: routines,
      },
    };
  }

  function completedRecordsFor(level, count, startedAt) {
    return Array.from({ length: count }, (_, index) => {
      const day = index + 1;
      const routines = courseRoutinesFor(level, day).map((routine) => ({ ...routine, done: true }));
      const date = dateForCourseDay(startedAt, day);
      return createRecordForDay({
        closedAt: `${date}T20:00:00.000Z`,
        date,
        day,
        level,
        routines,
        status: 'complete',
      });
    });
  }

  function endedCourseState(level, completedDays) {
    const state = stateFor('2026-07-30', '2026-07-01');
    state.currentCourse = {
      ...state.currentCourse,
      level,
      day: 30,
      currentStage: 4,
      progress: 100,
    };
    const dayThirtyRoutines = courseRoutinesFor(level, 30);
    const dayThirtyRecord = createRecordForDay({
      closedAt: '2026-07-30T20:00:00.000Z',
      date: '2026-07-30',
      day: 30,
      level,
      routines: dayThirtyRoutines,
      status: 'incomplete',
    });
    state.today = {
      date: '2026-07-30',
      hasReflection: false,
      isClosed: true,
      result: 'incomplete',
      closedAt: dayThirtyRecord.closedAt,
    };
    state.records = [dayThirtyRecord, ...completedRecordsFor(level, completedDays, '2026-07-01')];
    state.routinesByDate = { '2026-07-30': dayThirtyRoutines };
    return state;
  }

  const template = {
    id: 'personal-course',
    name: '독서 10분',
    done: false,
    type: 'personal',
    category: '집중',
    scope: 'course',
  };

  const routineCountsByStage = {
    BASIC: [3, 5, 6, 7],
    STANDARD: [4, 5, 7, 9],
    HARD: [3, 4, 6, 9],
  };
  for (const level of ['BASIC', 'STANDARD', 'HARD']) {
    assert.equal(dailyMottos[level].length, 30);
    assert.equal(typeof dailyMottoFor(level, 1), 'string');
    assert.equal(typeof dailyMottoFor(level, 30), 'string');
    assert.equal(courseStageForDay(level, 1).number, '01');
    assert.equal(courseStageForDay(level, 30).number, '04');
    [1, 8, 15, 22].forEach((day, index) => {
      assert.equal(courseRoutinesFor(level, day).length, routineCountsByStage[level][index]);
    });
  }
  assert.equal(dailyMottoFor('STANDARD', 30), '좋은 사람을 논하지 마라.\n이제 그런 사람이 되어라.');
  assert.equal(dailyMottoFor('HARD', 26), '자신을 돌아보아 옳다면\n천만 명이 막아서도\n나아가라.');
  assert.equal(programDayForCourse('BASIC', 1), 1);
  assert.equal(programDayForCourse('BASIC', 30), 30);
  assert.equal(programDayForCourse('STANDARD', 1), 31);
  assert.equal(programDayForCourse('HARD', 14), 74);
  assert.equal(programDayForCourse('HARD', 30), 90);
  assert.equal(programProgressForCourse('HARD', 14), 82);
  for (const level of ['BASIC', 'STANDARD', 'HARD']) {
    for (const motto of dailyMottos[level]) {
      assert.ok(motto.split('\n').length <= 3, `${level} motto exceeds three deliberate lines: ${motto}`);
    }
  }

  const thresholdCases = [
    ['BASIC', 14, 47, false],
    ['BASIC', 15, 50, true],
    ['STANDARD', 20, 67, false],
    ['STANDARD', 21, 70, true],
    ['HARD', 26, 87, false],
    ['HARD', 27, 90, true],
  ];
  for (const [level, completedDays, expectedRate, expectedPass] of thresholdCases) {
    const ended = endedCourseState(level, completedDays);
    assert.equal(courseCompletionRate(ended), expectedRate);
    assert.equal(hasPassedCurrentCourse(ended), expectedPass);
    assert.equal(canRestartCurrentCourse(ended), !expectedPass);
    assert.equal(canStartNextCourse(ended), expectedPass && level !== 'HARD');
  }

  const progressToReset = endedCourseState('BASIC', 15);
  progressToReset.settings = {
    ...progressToReset.settings,
    hapticsEnabled: false,
    language: 'de',
    notificationsEnabled: false,
  };
  const resetProgress = resetProgressPreservingSettings(progressToReset);
  assert.equal(resetProgress.hasOnboarded, true);
  assert.equal(resetProgress.currentCourse.level, 'BASIC');
  assert.equal(resetProgress.currentCourse.day, 1);
  assert.equal(resetProgress.records.length, 0);
  assert.deepEqual(resetProgress.settings, progressToReset.settings);

  const templated = stateFor('2026-07-01');
  templated.courseRoutineTemplates = [template];
  assert.equal(routinesForNewDay(templated).some((routine) => routine.id === template.id), true);
  templated.courseRoutineTemplates = [];
  assert.equal(routinesForNewDay(templated).some((routine) => routine.id === template.id), false);

  const preferredRoutines = stateFor('2026-07-01');
  const [waterRoutine, bedRoutine, pushupRoutine] = courseRoutinesFor('BASIC', 1);
  preferredRoutines.routinePreferencesByCourse.BASIC = {
    hiddenRoutineIds: [bedRoutine.id],
    order: [pushupRoutine.id, waterRoutine.id],
  };
  assert.deepEqual(
    routinesForNewDay(preferredRoutines).map((routine) => routine.id),
    [pushupRoutine.id, waterRoutine.id],
  );
  assert.deepEqual(
    applyRoutinePreferences(courseRoutinesFor('BASIC', 1), courseRoutinePreferencesFor(preferredRoutines))
      .map((routine) => routine.id),
    [pushupRoutine.id, waterRoutine.id],
  );

  const orderedRoutines = [
    { ...waterRoutine, id: 'a' },
    { ...bedRoutine, id: 'b' },
    { ...pushupRoutine, id: 'c' },
    { ...pushupRoutine, id: 'd' },
  ];
  const reorderedAfterRemoval = [orderedRoutines[3], orderedRoutines[0], orderedRoutines[2]];
  assert.deepEqual(
    restoreRoutineAtPosition({
      fallbackIndex: 1,
      nextRoutineId: 'c',
      previousRoutineId: 'a',
      routine: orderedRoutines[1],
      routines: reorderedAfterRemoval,
    }).map((routine) => routine.id),
    ['d', 'a', 'b', 'c'],
  );
  assert.deepEqual(
    restoreRoutineAtPosition({
      fallbackIndex: 1,
      routine: orderedRoutines[1],
      routines: [orderedRoutines[0], orderedRoutines[2]],
    }).map((routine) => routine.id),
    ['a', 'b', 'c'],
  );
  preferredRoutines.routinesByDate['2026-07-01'] = routinesForNewDay(preferredRoutines);
  const preferredSameDay = reconcileStateForDate(preferredRoutines, '2026-07-01');
  assert.deepEqual(
    preferredSameDay.routinesByDate['2026-07-01'].map((routine) => routine.id),
    [pushupRoutine.id, waterRoutine.id],
  );
  const preferredNextDay = reconcileStateForDate(preferredSameDay, '2026-07-02');
  assert.deepEqual(
    preferredNextDay.routinesByDate['2026-07-02'].map((routine) => routine.id),
    [pushupRoutine.id, waterRoutine.id],
  );

  const completeCourseWithOpenPersonalRoutine = [
    ...courseRoutinesFor('BASIC', 1).map((routine) => ({ ...routine, done: true })),
    { ...template, done: false },
  ];
  assert.equal(courseResultForRoutines(completeCourseWithOpenPersonalRoutine), 'complete');
  assert.equal(doneCount(completeCourseWithOpenPersonalRoutine), completeCourseWithOpenPersonalRoutine.length - 1);

  const legacy = stateFor('2026-07-01');
  legacy.routinesByDate['2026-07-01'].push(template);
  delete legacy.courseRoutineTemplates;
  const migrated = reconcileStateForDate(legacy, '2026-07-01');
  assert.equal(courseRoutineTemplatesFor(migrated).some((routine) => routine.id === template.id), true);

  const legacyRoutinePreferences = stateFor('2026-07-01');
  delete legacyRoutinePreferences.routinePreferencesByCourse;
  const migratedRoutinePreferences = reconcileStateForDate(legacyRoutinePreferences, '2026-07-01');
  assert.deepEqual(migratedRoutinePreferences.routinePreferencesByCourse, {
    BASIC: { hiddenRoutineIds: [], order: [] },
    STANDARD: { hiddenRoutineIds: [], order: [] },
    HARD: { hiddenRoutineIds: [], order: [] },
  });

  const rollover = stateFor('2026-07-01');
  rollover.courseRoutineTemplates = [template];
  rollover.today.standard = '시작한 일은 오늘 끝낸다.';
  const advanced = reconcileStateForDate(rollover, '2026-07-03');
  assert.deepEqual(advanced.records.map((record) => record.day).sort(), [1, 2]);
  assert.equal(advanced.today.date, '2026-07-03');
  assert.equal(advanced.currentCourse.day, 3);
  assert.equal(advanced.routinesByDate['2026-07-03'].some((routine) => routine.id === template.id), true);
  assert.equal(advanced.records.find((record) => record.day === 1).standard, '시작한 일은 오늘 끝낸다.');
  assert.equal(advanced.today.standard, '');

  const stageBoundary = stateFor('2026-07-07', '2026-07-01');
  stageBoundary.currentCourse = courseStateFor(stageBoundary, '2026-07-07', stageBoundary.records);
  const stageTwo = reconcileStateForDate(stageBoundary, '2026-07-08');
  assert.equal(stageTwo.currentCourse.day, 8);
  assert.deepEqual(
    stageTwo.routinesByDate['2026-07-08'].map((routine) => routine.id),
    courseRoutinesFor('BASIC', 8).map((routine) => routine.id),
  );

  const originalTimezone = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  assert.equal(elapsedCourseDayForDate('2026-03-08', '2026-03-09'), 2);
  process.env.TZ = originalTimezone;

  const clockRollback = stateFor('2026-07-10', '2026-07-01');
  clockRollback.currentCourse = courseStateFor(clockRollback, '2026-07-10', clockRollback.records);
  const afterClockRollback = reconcileStateForDate(clockRollback, '2026-07-09');
  assert.equal(afterClockRollback.today.date, '2026-07-10');
  assert.equal(afterClockRollback.currentCourse.day, 10);

  // Persona 1: 매일 사용하는 사용자. 완료, 회고, 다음 날 초기화가 연결된다.
  let dailyUser = stateFor('2026-07-01');
  dailyUser = closeCourseDay(dailyUser, { complete: true, reflection: '첫날을 끝냈다.' });
  assert.equal(dailyUser.records[0].status, 'complete');
  assert.equal(dailyUser.records[0].reflection, '첫날을 끝냈다.');
  dailyUser = reconcileStateForDate(dailyUser, '2026-07-02');
  assert.equal(dailyUser.currentCourse.day, 2);
  assert.equal(dailyUser.today.isClosed, false);
  assert.equal(dailyUser.routinesByDate['2026-07-02'].every((routine) => !routine.done), true);
  assert.equal(streakCount(recordsForCourse(dailyUser.records, 'BASIC')), 1);

  // Persona 2: 개인 루틴 사용자. 과정용만 다음 날 유지되고 과정 판정에는 영향을 주지 않는다.
  const todayOnlyTemplate = { ...template, id: 'personal-today', scope: 'today' };
  let customRoutineUser = stateFor('2026-07-01');
  customRoutineUser.courseRoutineTemplates = [{ ...template }];
  customRoutineUser.routinesByDate['2026-07-01'].push({ ...template }, todayOnlyTemplate);
  customRoutineUser = closeCourseDay(customRoutineUser, { complete: true });
  assert.equal(customRoutineUser.records[0].status, 'complete');
  customRoutineUser = reconcileStateForDate(customRoutineUser, '2026-07-02');
  assert.equal(customRoutineUser.routinesByDate['2026-07-02'].some((routine) => routine.id === template.id), true);
  assert.equal(customRoutineUser.routinesByDate['2026-07-02'].some((routine) => routine.id === todayOnlyTemplate.id), false);

  // Persona 3: 며칠 앱을 열지 않은 사용자. 빠진 날과 단계 경계를 날짜별로 정확히 생성한다.
  let returningUser = stateFor('2026-07-06', '2026-07-01');
  returningUser.currentCourse = courseStateFor(returningUser, '2026-07-06', returningUser.records);
  returningUser = reconcileStateForDate(returningUser, '2026-07-09');
  assert.deepEqual(recordsForCourse(returningUser.records, 'BASIC').map((record) => record.day).sort((a, b) => a - b), [6, 7, 8]);
  assert.equal(returningUser.records.find((record) => record.day === 8).date, '2026-07-08');
  assert.equal(returningUser.routinesByDate['2026-07-08'].length, courseRoutinesFor('BASIC', 8).length);
  assert.equal(returningUser.currentCourse.day, 9);
  assert.equal(returningUser.routinesByDate['2026-07-09'].length, courseRoutinesFor('BASIC', 9).length);

  // Persona 4: Day 30까지 진행해 BASIC -> STANDARD -> HARD로 전환한다.
  let progressionUser = stateFor('2026-07-30', '2026-07-01');
  progressionUser.currentCourse = courseStateFor(progressionUser, '2026-07-30', progressionUser.records);
  progressionUser.records = completedRecordsFor('BASIC', 14, '2026-07-01');
  progressionUser.routinesByDate['2026-07-30'] = courseRoutinesFor('BASIC', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: true, reflection: 'BASIC 완료' });
  assert.equal(isCourseComplete(progressionUser), true);
  progressionUser = startNextCourse(progressionUser, '2026-07-30');
  assert.equal(progressionUser.currentCourse.level, 'STANDARD');
  assert.equal(progressionUser.currentCourse.day, 1);
  assert.equal(progressionUser.courseRoutineTemplates.length, 0);
  assert.equal(recordsForCourse(progressionUser.records, 'BASIC').length, 15);
  assert.deepEqual(
    progressionUser.routinesByDate['2026-07-30'].map((routine) => routine.id),
    courseRoutinesFor('STANDARD', 1).map((routine) => routine.id),
  );

  progressionUser.currentCourse = {
    ...progressionUser.currentCourse,
    day: 30,
    startedAt: '2026-07-30',
    currentStage: 4,
  };
  progressionUser.today = { date: '2026-08-28', isClosed: false, hasReflection: false, result: null };
  progressionUser.records = [
    ...progressionUser.records,
    ...completedRecordsFor('STANDARD', 20, '2026-07-30'),
  ];
  progressionUser.routinesByDate['2026-08-28'] = courseRoutinesFor('STANDARD', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: true, date: '2026-08-28' });
  assert.equal(isCourseComplete(progressionUser), true);
  progressionUser = startNextCourse(progressionUser, '2026-08-28');
  assert.equal(progressionUser.currentCourse.level, 'HARD');
  assert.equal(recordsForCourse(progressionUser.records, 'STANDARD').length, 21);
  assert.equal(recordsForCourse(progressionUser.records, 'BASIC').length, 15);

  // Persona 5: HARD 종료 사용자. 다음 과정이 없고 상태가 Day 30에 고정된다.
  progressionUser.currentCourse = {
    ...progressionUser.currentCourse,
    day: 30,
    startedAt: '2026-08-28',
    currentStage: 4,
  };
  progressionUser.today = { date: '2026-09-26', isClosed: false, hasReflection: false, result: null };
  progressionUser.records = [
    ...progressionUser.records,
    ...completedRecordsFor('HARD', 26, '2026-08-28'),
  ];
  progressionUser.routinesByDate['2026-09-26'] = courseRoutinesFor('HARD', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: true, date: '2026-09-26' });
  assert.equal(isCourseComplete(progressionUser), true);
  assert.equal(courseCompletionRate(progressionUser), 90);
  assert.equal(hasPassedCurrentCourse(progressionUser), true);
  assert.equal(nextCourseLevel('HARD'), null);
  assert.equal(canStartNextCourse(progressionUser), false);
  assert.equal(startNextCourse(progressionUser), progressionUser);
  const hardAfterDelay = reconcileStateForDate(progressionUser, '2026-10-03');
  assert.equal(hardAfterDelay.currentCourse.level, 'HARD');
  assert.equal(hardAfterDelay.currentCourse.day, 30);
  assert.equal(hardAfterDelay.records.length, progressionUser.records.length);

  const reflectionRecord = createRecordForDay({
    closedAt: '2026-07-01T12:00:00.000Z',
    date: '2026-07-01',
    day: 1,
    level: 'BASIC',
    reflection: '오늘도 이어갔다.',
    routines: basicRoutines.map((routine) => ({ ...routine, done: true })),
    standard: '  시작한 일은 끝낸다.  ',
    status: 'complete',
  });
  assert.equal(reflectionRecord.reflection, '오늘도 이어갔다.');
  assert.equal(reflectionRecord.standard, '시작한 일은 끝낸다.');
  assert.deepEqual(reflectionRecord.completedRoutineIds, basicRoutines.map((routine) => routine.id));
  const replacedRecord = { ...reflectionRecord, reflection: '회고 수정' };
  const singleRecord = mergeRecord([reflectionRecord], replacedRecord);
  assert.equal(singleRecord.length, 1);
  assert.equal(singleRecord[0].reflection, '회고 수정');
  assert.equal(streakCount(singleRecord), 1);
  assert.equal(progressForRecords(singleRecord), 3);

  const reopened = stateFor('2026-07-01');
  reopened.routinesByDate['2026-07-01'][0].done = true;
  const closedRecord = createRecordForDay({
    closedAt: '2026-07-01T12:00:00.000Z',
    date: '2026-07-01',
    day: 1,
    level: 'BASIC',
    routines: reopened.routinesByDate['2026-07-01'],
    standard: '한 번 정한 기준은 지킨다.',
    status: 'incomplete',
  });
  reopened.records = [closedRecord];
  reopened.today = {
    date: '2026-07-01',
    isClosed: true,
    hasReflection: false,
    result: 'incomplete',
    closedAt: closedRecord.closedAt,
  };
  reopened.currentCourse = courseStateFor(reopened, '2026-07-01', reopened.records);
  const editableAgain = reopenTodayForEditing(reopened);
  assert.equal(editableAgain.today.isClosed, false);
  assert.equal(editableAgain.today.result, null);
  assert.equal(editableAgain.today.closedAt, undefined);
  assert.equal(editableAgain.today.standard, '한 번 정한 기준은 지킨다.');
  assert.equal(editableAgain.records.some((record) => record.day === 1), false);
  assert.equal(editableAgain.routinesByDate['2026-07-01'][0].done, true);
  assert.equal(editableAgain.currentCourse.progress, 0);

  const completed = stateFor('2026-07-30', '2026-07-01');
  completed.currentCourse = courseStateFor(completed, '2026-07-30', completed.records);
  completed.records = [createRecordForDay({
    closedAt: '2026-07-30T12:00:00.000Z',
    date: '2026-07-30',
    day: 30,
    level: 'BASIC',
    routines: completed.routinesByDate['2026-07-30'],
    status: 'incomplete',
  })];
  assert.equal(isCourseComplete(completed), true);
  assert.equal(courseCompletionRate(completed), 0);
  assert.equal(hasPassedCurrentCourse(completed), false);
  assert.equal(canStartNextCourse(completed), false);
  assert.equal(canRestartCurrentCourse(completed), true);
  const afterCompletion = reconcileStateForDate(completed, '2026-08-01');
  assert.equal(afterCompletion.records.length, 1);
  assert.equal(afterCompletion.currentCourse.day, 30);

  const blockedStandardStart = startNextCourse(completed, '2026-07-30');
  assert.equal(blockedStandardStart, completed);
  const completedWithPreferences = {
    ...completed,
    routinePreferencesByCourse: {
      ...completed.routinePreferencesByCourse,
      BASIC: { hiddenRoutineIds: ['bed'], order: ['pushup', 'water'] },
    },
  };
  const basicRestart = restartCurrentCourse(completedWithPreferences, '2026-08-01');
  assert.equal(basicRestart.currentCourse.level, 'BASIC');
  assert.equal(basicRestart.currentCourse.day, 1);
  assert.equal(basicRestart.records.some((record) => record.course === 'BASIC'), false);
  assert.deepEqual(basicRestart.routinePreferencesByCourse.BASIC, { hiddenRoutineIds: [], order: [] });

  const passingBasicRecords = completedRecordsFor('BASIC', 15, '2026-07-01');
  const passingBasic = { ...completed, records: [completed.records[0], ...passingBasicRecords] };
  assert.equal(courseCompletionRate(passingBasic), 50);
  assert.equal(hasPassedCurrentCourse(passingBasic), true);
  assert.equal(canStartNextCourse(passingBasic), true);
  const passingBasicWithPreferences = {
    ...passingBasic,
    routinePreferencesByCourse: {
      ...passingBasic.routinePreferencesByCourse,
      STANDARD: { hiddenRoutineIds: ['standard-bed'], order: ['standard-water'] },
    },
  };
  const standardStart = startNextCourse(passingBasicWithPreferences, '2026-07-30');
  assert.equal(standardStart.currentCourse.level, 'STANDARD');
  assert.equal(standardStart.currentCourse.day, 1);
  assert.equal(standardStart.currentCourse.progress, 0);
  assert.equal(isCourseComplete(standardStart), false);
  assert.equal(recordsForCourse(standardStart.records, 'BASIC').length, 16);
  assert.equal(recordsForCourse(standardStart.records, 'STANDARD').length, 0);
  assert.deepEqual(standardStart.routinePreferencesByCourse.STANDARD, { hiddenRoutineIds: [], order: [] });
  assert.deepEqual(
    standardStart.routinesByDate['2026-07-30'].map((routine) => routine.id),
    courseRoutinesFor('STANDARD', 1).map((routine) => routine.id),
  );

  const legacyStandard = {
    ...standardStart,
    routinesByDate: {
      ...standardStart.routinesByDate,
      '2026-07-30': basicRoutines.map((routine) => ({ ...routine })),
    },
  };
  const migratedStandard = reconcileStateForDate(legacyStandard, '2026-07-30');
  assert.deepEqual(
    migratedStandard.routinesByDate['2026-07-30'].map((routine) => routine.id),
    courseRoutinesFor('STANDARD', 1).map((routine) => routine.id),
  );

  const standardDayOne = createRecordForDay({
    closedAt: '2026-07-30T20:00:00.000Z',
    date: '2026-07-30',
    day: 1,
    level: 'STANDARD',
    routines: standardStart.routinesByDate['2026-07-30'],
    status: 'complete',
  });
  const mixedRecords = mergeRecord(standardStart.records, standardDayOne);
  assert.equal(mixedRecords.length, 17);
  assert.equal(recordsForCourse(mixedRecords, 'STANDARD').length, 1);
  assert.equal(progressForRecords(mixedRecords, 'STANDARD'), 3);

  const standardCompletion = createRecordForDay({
    closedAt: '2026-08-28T20:00:00.000Z',
    date: '2026-08-28',
    day: 30,
    level: 'STANDARD',
    routines: courseRoutinesFor('STANDARD', 30),
    status: 'complete',
  });
  const standardCompleted = {
    ...standardStart,
    currentCourse: {
      ...standardStart.currentCourse,
      day: 30,
      startedAt: '2026-07-30',
    },
    today: {
      date: '2026-08-28',
      hasReflection: false,
      isClosed: true,
      result: 'complete',
    },
    records: [
      ...standardStart.records,
      ...completedRecordsFor('STANDARD', 20, '2026-07-30'),
      standardCompletion,
    ],
    routinesByDate: {
      ...standardStart.routinesByDate,
      '2026-08-28': courseRoutinesFor('STANDARD', 30),
    },
  };
  const hardStart = startNextCourse(standardCompleted, '2026-08-28');
  assert.equal(canStartNextCourse(standardCompleted), true);
  assert.equal(hardStart.currentCourse.level, 'HARD');
  assert.deepEqual(
    hardStart.routinesByDate['2026-08-28'].map((routine) => routine.id),
    courseRoutinesFor('HARD', 1).map((routine) => routine.id),
  );

  process.stdout.write('ALPHA core verification passed.\n');
} finally {
  rmSync(outputDirectory, { force: true, recursive: true });
}
