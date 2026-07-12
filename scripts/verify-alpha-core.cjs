const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const outputDirectory = mkdtempSync(join(tmpdir(), 'alpha-core-'));
const tsc = resolve('node_modules/.bin/tsc');

try {
  execFileSync(tsc, [
    '--module', 'commonjs',
    '--target', 'es2020',
    '--moduleResolution', 'node',
    '--skipLibCheck',
    '--outDir', outputDirectory,
    'src/types.ts',
    'src/data.ts',
    'src/domain/alpha.ts',
    'src/domain/stateLifecycle.ts',
  ], { stdio: 'inherit' });

  const { basicRoutines, courseRoutinesFor, courseStageForDay, createInitialState, dailyMottos, dailyMottoFor } = require(join(outputDirectory, 'data.js'));
  const { courseResultForRoutines, courseStateFor, createRecordForDay, elapsedCourseDayForDate, mergeRecord, progressForRecords, recordsForCourse, routinesForNewDay, streakCount } = require(join(outputDirectory, 'domain/alpha.js'));
  const { canStartNextCourse, courseRoutineTemplatesFor, isCourseComplete, nextCourseLevel, reconcileStateForDate, reopenTodayForEditing, startNextCourse } = require(join(outputDirectory, 'domain/stateLifecycle.js'));
  const appSource = readFileSync(resolve('App.tsx'), 'utf8');

  assert.equal(appSource.includes('>BASIC 과정</Text>'), false);
  assert.equal(appSource.includes('value="BASIC 30일"'), false);
  assert.equal(appSource.includes('basicRoutines'), false);
  assert.equal(appSource.includes('stageItems'), false);
  assert.equal(appSource.includes('<SectionTitle title="기본 루틴" />'), false);

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
        closedAt: record.closedAt,
      },
      records,
      routinesByDate: {
        ...state.routinesByDate,
        [date]: routines,
      },
    };
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
  assert.equal(dailyMottoFor('STANDARD', 30), '너는 버틴 게 아니라 더 높은 기준에 적응한 것이다.');

  const templated = stateFor('2026-07-01');
  templated.courseRoutineTemplates = [template];
  assert.equal(routinesForNewDay(templated).some((routine) => routine.id === template.id), true);
  templated.courseRoutineTemplates = [];
  assert.equal(routinesForNewDay(templated).some((routine) => routine.id === template.id), false);

  const completeCourseWithOpenPersonalRoutine = [
    ...courseRoutinesFor('BASIC', 1).map((routine) => ({ ...routine, done: true })),
    { ...template, done: false },
  ];
  assert.equal(courseResultForRoutines(completeCourseWithOpenPersonalRoutine), 'complete');

  const legacy = stateFor('2026-07-01');
  legacy.routinesByDate['2026-07-01'].push(template);
  delete legacy.courseRoutineTemplates;
  const migrated = reconcileStateForDate(legacy, '2026-07-01');
  assert.equal(courseRoutineTemplatesFor(migrated).some((routine) => routine.id === template.id), true);

  const rollover = stateFor('2026-07-01');
  rollover.courseRoutineTemplates = [template];
  const advanced = reconcileStateForDate(rollover, '2026-07-03');
  assert.deepEqual(advanced.records.map((record) => record.day).sort(), [1, 2]);
  assert.equal(advanced.today.date, '2026-07-03');
  assert.equal(advanced.currentCourse.day, 3);
  assert.equal(advanced.routinesByDate['2026-07-03'].some((routine) => routine.id === template.id), true);

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
  progressionUser.routinesByDate['2026-07-30'] = courseRoutinesFor('BASIC', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: true, reflection: 'BASIC 완료' });
  assert.equal(isCourseComplete(progressionUser), true);
  progressionUser = startNextCourse(progressionUser, '2026-07-30');
  assert.equal(progressionUser.currentCourse.level, 'STANDARD');
  assert.equal(progressionUser.currentCourse.day, 1);
  assert.equal(progressionUser.courseRoutineTemplates.length, 0);
  assert.equal(recordsForCourse(progressionUser.records, 'BASIC').length, 1);
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
  progressionUser.routinesByDate['2026-08-28'] = courseRoutinesFor('STANDARD', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: false, date: '2026-08-28' });
  assert.equal(isCourseComplete(progressionUser), true);
  progressionUser = startNextCourse(progressionUser, '2026-08-28');
  assert.equal(progressionUser.currentCourse.level, 'HARD');
  assert.equal(recordsForCourse(progressionUser.records, 'STANDARD').length, 1);
  assert.equal(recordsForCourse(progressionUser.records, 'BASIC').length, 1);

  // Persona 5: HARD 종료 사용자. 다음 과정이 없고 상태가 Day 30에 고정된다.
  progressionUser.currentCourse = {
    ...progressionUser.currentCourse,
    day: 30,
    startedAt: '2026-08-28',
    currentStage: 4,
  };
  progressionUser.today = { date: '2026-09-26', isClosed: false, hasReflection: false, result: null };
  progressionUser.routinesByDate['2026-09-26'] = courseRoutinesFor('HARD', 30);
  progressionUser = closeCourseDay(progressionUser, { complete: true, date: '2026-09-26' });
  assert.equal(isCourseComplete(progressionUser), true);
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
    status: 'complete',
  });
  assert.equal(reflectionRecord.reflection, '오늘도 이어갔다.');
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
  const afterCompletion = reconcileStateForDate(completed, '2026-08-01');
  assert.equal(afterCompletion.records.length, 1);
  assert.equal(afterCompletion.currentCourse.day, 30);

  const standardStart = startNextCourse(completed, '2026-07-30');
  assert.equal(canStartNextCourse(completed), true);
  assert.equal(standardStart.currentCourse.level, 'STANDARD');
  assert.equal(standardStart.currentCourse.day, 1);
  assert.equal(standardStart.currentCourse.progress, 0);
  assert.equal(isCourseComplete(standardStart), false);
  assert.equal(recordsForCourse(standardStart.records, 'BASIC').length, 1);
  assert.equal(recordsForCourse(standardStart.records, 'STANDARD').length, 0);
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
  assert.equal(mixedRecords.length, 2);
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
    records: mergeRecord(standardStart.records, standardCompletion),
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
