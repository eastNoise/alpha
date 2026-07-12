import type { AppLocale } from './index';
import type { CourseLevel, SupportedLanguage } from '../types';

export type LocalizedStage = {
  title: string;
  quote: string;
  bullets: string[];
};

type LocalizedContent = {
  ui: Record<string, string>;
  languages: Record<SupportedLanguage, string>;
  categories: Record<string, string>;
  scopes: Record<string, string>;
  routines: Record<string, string>;
  stages: Record<CourseLevel, LocalizedStage[]>;
};

type LocalizedOverrides = {
  ui?: Record<string, string>;
  languages?: Partial<Record<SupportedLanguage, string>>;
  categories?: Record<string, string>;
  scopes?: Record<string, string>;
  routines?: Record<string, string>;
  stages?: Record<CourseLevel, LocalizedStage[]>;
};

const ko: LocalizedContent = {
  ui: {
    back: '뒤로가기', settings: '설정', start: '시작하기', close: '닫기', cancel: '취소', save: '저장', add: '추가', reset: '초기화',
    today: '오늘', records: '기록', course: '과정', day: 'Day {day}', dayCourse: 'Day {day} · {level} 과정',
    notificationDenied: '알림 권한이 꺼져 있습니다.', notificationFailed: '알림 설정에 실패했습니다.', saveFailed: '상태 저장에 실패했습니다.',
    todayFire: '오늘의 불씨', todaySummary: '오늘 요약', todayRoutines: '오늘 루틴', completedCount: '{done} / {total} 완료',
    complete: '완료', incomplete: '미완성', inProgress: '진행 중', ended: '종료', streak: '연속', achievement: '달성률',
    addPersonalRoutine: '+ 개인 루틴 추가', writeReflection: '하루 회고 작성하기', closeComplete: '마감 완료', courseState: '{level} 과정 {state}',
    recordsSubtitle: '쌓인 기록이 너를 만든다', completionStreak: '연속 완료', days: '{count}일',
    course30Summary: '30일 과정 요약', courseSummaryCaption: '완료 {done}일 · 미완성 {missed}일', view30Records: '30일 기록 보기 ›',
    recentRecords: '최근 기록', recordCollectionLink: '기록 모음 ›', currentAndNext: '현재 과정과 다음 단계', currentProgress: '현재 진행률',
    currentStage: '현재 단계', stageStandards: '이번 단계 기준', courseStages: '과정 단계', nextCourse: '다음 과정',
    available: '시작 가능', locked: '잠김', startCourse: '{level} 과정 시작', finalCourse: '최종 과정 완료', retryNeeded: '재도전 필요', restartCourse: '{level} 과정 다시 시작',
    records30: '30일 기록', recordCollection: '기록 모음', recordsLeft: '남긴 기록 개수', countItems: '{count}개', recordsByDate: '날짜별 기록',
    notificationSettings: '알림 설정', hapticSettings: '탭 피드백 설정', vibration: '진동', dataReset: '데이터 초기화', appInfo: '앱 정보', language: '언어',
    personal: '개인', deleteRoutine: '{name} 삭제', noRecord: '기록 없음',
    resultCompleteTitle: '완료.', resultIncompleteTitle: '미완성.', resultCompleteCopy: '오늘은 도망치지 않았다.', resultIncompleteCopy: '남은 루틴은 기록에 남았다.',
    completedRoutines: '완료 루틴', incompleteRoutines: '미완성 루틴', completionStreakLabel: '연속 완료',
    reflection: '하루 회고', todayRecord: '오늘의 기록', personalRoutineAdd: '개인 루틴 추가', routineName: '루틴명', routinePlaceholder: '예) 턱걸이 10개',
    category: '카테고리', scope: '적용 범위', resetCopy: '현재 루틴 체크, 마감 기록, 회고, 과정 진행률을 처음 상태로 되돌립니다.',
    app: '앱', version: '버전', storage: '저장', storedOnDevice: '이 기기에 저장', course30Days: '{level} 30일',
    scheduled: '예정', noRecordYet: '아직 기록이 없습니다.', date: '날짜', status: '상태', stage: '단계', routineCompletion: '루틴 완료', routines: '루틴',
    finishCourseToast: '{level} 30일 과정을 완료했습니다.', editLockedToast: '마감 후에는 루틴을 수정할 수 없습니다.', alreadyClosedToast: '이미 마감 완료된 하루입니다.',
    closeUndoneToast: '마감을 취소했습니다.', enterReflectionToast: '회고를 입력해라.', reflectionSavedToast: '하루 회고가 저장되었습니다.',
    addLockedToast: '마감 후에는 루틴을 추가할 수 없습니다.', personalRoutine: '개인 루틴', personalAddedToast: '개인 루틴이 추가되었습니다.',
    deleteLockedToast: '마감 후에는 루틴을 삭제할 수 없습니다.', personalDeletedToast: '개인 루틴이 삭제되었습니다.', resetDoneToast: '기록이 초기화되었습니다.',
    nextCourseBlockedToast: '현재 과정을 완료한 뒤 다음 과정을 시작할 수 있습니다.', nextCourseStartedToast: '다음 과정을 시작합니다.',
    restartBlockedToast: '현재 과정이 끝난 뒤 재시작할 수 있습니다.', restartedToast: '{level} 과정을 다시 시작합니다.',
    reminderChannel: '하루 마감', reminderBody: '하루를 마감하고 오늘의 기록을 남겨라.', languageTitle: '앱 언어', systemLanguage: '시스템 설정',
  },
  languages: { system: '시스템 설정', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' },
  categories: { 몸: '몸', 정신: '정신', 절제: '절제', 집중: '집중', 생활: '생활' },
  scopes: { 오늘만: '오늘만', '이번 과정 동안': '이번 과정 동안' },
  routines: {
    water: '물 500ml', bed: '침대 정리', pushup: '푸쉬업 30개', 'basic-squat': '스쿼트 30개', 'basic-walk': '걷기 10분', 'basic-stretch': '스트레칭 10분', 'basic-reading': '책 5페이지',
    'standard-pushup': '푸쉬업 50개', 'standard-squat': '스쿼트 50개', 'standard-water': '물 1L', 'standard-bed': '침대 정리', 'standard-running': '러닝 또는 걷기 2km', 'standard-reading': '책 10페이지', 'standard-porn-free': '포르노 금지', 'standard-short-form-limit': '쇼츠/릴스 30분 이하', 'standard-tidy': '정리정돈 10분',
    'hard-training': '운동 60분', 'hard-reading': '책 20페이지', 'hard-water': '물 1.5L', 'hard-running': '러닝 3km', 'hard-deep-work': '딥워크 90분', 'hard-porn-free': '포르노 금지', 'hard-junk-food-free': '정크푸드 금지', 'hard-short-form-free': '쇼츠/릴스 금지', 'hard-meditation': '명상 10분',
  },
  stages: {
    BASIC: [
      { title: '기초 통제', quote: '“너 자신을 깨워라.”', bullets: ['물 500ml', '침대 정리', '푸쉬업 30개'] },
      { title: '몸 깨우기', quote: '“몸을 먼저 움직여라.”', bullets: ['스쿼트 30개 추가', '걷기 10분 추가', '기초 3개 유지'] },
      { title: '생활 리듬', quote: '“반복은 하루의 리듬을 바꾼다.”', bullets: ['스트레칭 10분 추가', '앞선 5개 유지', '흔들린 날도 마감'] },
      { title: '기준 적응', quote: '“흔들려도 기준으로 돌아와라.”', bullets: ['책 5페이지 추가', '누적 7개 루틴', 'BASIC 30일 완성'] },
    ],
    STANDARD: [
      { title: '몸 단련', quote: '“대충 한 반복은 몸에 남지 않는다.”', bullets: ['푸쉬업 50개', '스쿼트 50개', '물 1L · 침대 정리'] },
      { title: '유산소 추가', quote: '“심장이 버티는 만큼 기준도 넓어진다.”', bullets: ['러닝 또는 걷기 2km 추가', '앞선 4개 유지', '누적 5개 루틴'] },
      { title: '절제 시작', quote: '“욕망을 다루는 순간 기준이 선다.”', bullets: ['책 10페이지 추가', '포르노 금지 추가', '누적 7개 루틴'] },
      { title: '기준 고정', quote: '“피곤한 날에도 같은 기준으로 움직여라.”', bullets: ['쇼츠/릴스 30분 이하', '정리정돈 10분', '누적 9개 루틴'] },
    ],
    HARD: [
      { title: '강도 상승', quote: '“피하고 싶은 지점부터 통과해라.”', bullets: ['운동 60분', '책 20페이지', '물 1.5L'] },
      { title: '체력 강화', quote: '“압박 속에서도 순서를 지켜라.”', bullets: ['러닝 3km 추가', '앞선 3개 유지', '누적 4개 루틴'] },
      { title: '딥워크 강화', quote: '“기준은 편한 날이 아니라 어려운 날에 드러난다.”', bullets: ['딥워크 90분 추가', '포르노 금지 추가', '누적 6개 루틴'] },
      { title: '욕망 통제', quote: '“마지막까지 같은 무게로 버텨라.”', bullets: ['정크푸드 금지', '쇼츠/릴스 금지', '명상 10분'] },
    ],
  },
};

const en: LocalizedContent = {
  ui: {
    back: 'Back', settings: 'Settings', start: 'Begin', close: 'Close', cancel: 'Cancel', save: 'Save', add: 'Add', reset: 'Reset',
    today: 'Today', records: 'Records', course: 'Course', day: 'Day {day}', dayCourse: 'Day {day} · {level}',
    notificationDenied: 'Notification permission is off.', notificationFailed: 'Could not configure notifications.', saveFailed: 'Could not save your progress.',
    todayFire: "Today's spark", todaySummary: "Today's summary", todayRoutines: "Today's routines", completedCount: '{done} / {total} done',
    complete: 'Complete', incomplete: 'Incomplete', inProgress: 'In progress', ended: 'Ended', streak: 'Streak', achievement: 'Completion',
    addPersonalRoutine: '+ Add personal routine', writeReflection: 'Write daily reflection', closeComplete: 'Day closed', courseState: '{level} {state}',
    recordsSubtitle: 'Your records shape you', completionStreak: 'Completion streak', days: '{count} days',
    course30Summary: '30-day course summary', courseSummaryCaption: '{done} complete · {missed} incomplete', view30Records: 'View 30-day record ›',
    recentRecords: 'Recent records', recordCollectionLink: 'All records ›', currentAndNext: 'Current course and what follows', currentProgress: 'Current progress',
    currentStage: 'Current stage', stageStandards: 'Standards for this stage', courseStages: 'Course stages', nextCourse: 'Next course',
    available: 'Ready', locked: 'Locked', startCourse: 'Start {level}', finalCourse: 'Final course', retryNeeded: 'Retry required', restartCourse: 'Restart {level}',
    records30: '30-day record', recordCollection: 'All records', recordsLeft: 'Records written', countItems: '{count}', recordsByDate: 'Records by date',
    notificationSettings: 'Notifications', hapticSettings: 'Tap feedback', vibration: 'Vibration', dataReset: 'Reset data', appInfo: 'App information', language: 'Language',
    personal: 'Personal', deleteRoutine: 'Delete {name}', noRecord: 'No record',
    resultCompleteTitle: 'Complete.', resultIncompleteTitle: 'Incomplete.', resultCompleteCopy: 'You did not run today.', resultIncompleteCopy: 'What remains has been recorded.',
    completedRoutines: 'Completed routines', incompleteRoutines: 'Incomplete routines', completionStreakLabel: 'Completion streak',
    reflection: 'Daily reflection', todayRecord: "Today's record", personalRoutineAdd: 'Add personal routine', routineName: 'Routine name', routinePlaceholder: 'e.g. 10 pull-ups',
    category: 'Category', scope: 'Duration', resetCopy: 'This resets routine checks, closed days, reflections, and course progress.',
    app: 'App', version: 'Version', storage: 'Storage', storedOnDevice: 'Stored on this device', course30Days: '{level} · 30 days',
    scheduled: 'Upcoming', noRecordYet: 'No record yet.', date: 'Date', status: 'Status', stage: 'Stage', routineCompletion: 'Routines completed', routines: 'Routines',
    finishCourseToast: 'You completed the 30-day {level} course.', editLockedToast: 'Routines cannot be changed after closing the day.', alreadyClosedToast: 'This day is already closed.',
    closeUndoneToast: 'Day close canceled.', enterReflectionToast: 'Write your reflection.', reflectionSavedToast: 'Daily reflection saved.',
    addLockedToast: 'Routines cannot be added after closing the day.', personalRoutine: 'Personal routine', personalAddedToast: 'Personal routine added.',
    deleteLockedToast: 'Routines cannot be deleted after closing the day.', personalDeletedToast: 'Personal routine deleted.', resetDoneToast: 'Your records have been reset.',
    nextCourseBlockedToast: 'Complete this course before starting the next.', nextCourseStartedToast: 'The next course begins now.',
    restartBlockedToast: 'You can restart after this course ends.', restartedToast: '{level} starts again now.',
    reminderChannel: 'Close the day', reminderBody: 'Close the day and leave an honest record.', languageTitle: 'App language', systemLanguage: 'System default',
  },
  languages: { system: 'System default', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' },
  categories: { 몸: 'Body', 정신: 'Mind', 절제: 'Discipline', 집중: 'Focus', 생활: 'Life' },
  scopes: { 오늘만: 'Today only', '이번 과정 동안': 'For this course' },
  routines: {
    water: 'Drink 500 ml of water', bed: 'Make the bed', pushup: '30 push-ups', 'basic-squat': '30 squats', 'basic-walk': 'Walk for 10 minutes', 'basic-stretch': 'Stretch for 10 minutes', 'basic-reading': 'Read 5 pages',
    'standard-pushup': '50 push-ups', 'standard-squat': '50 squats', 'standard-water': 'Drink 1 L of water', 'standard-bed': 'Make the bed', 'standard-running': 'Run or walk 2 km', 'standard-reading': 'Read 10 pages', 'standard-porn-free': 'No pornography', 'standard-short-form-limit': 'Short videos: 30 min max', 'standard-tidy': 'Tidy for 10 minutes',
    'hard-training': 'Train for 60 minutes', 'hard-reading': 'Read 20 pages', 'hard-water': 'Drink 1.5 L of water', 'hard-running': 'Run 3 km', 'hard-deep-work': '90 minutes of deep work', 'hard-porn-free': 'No pornography', 'hard-junk-food-free': 'No junk food', 'hard-short-form-free': 'No short-form videos', 'hard-meditation': 'Meditate for 10 minutes',
  },
  stages: {
    BASIC: [
      { title: 'Basic Control', quote: '“Wake yourself up.”', bullets: ['Drink 500 ml of water', 'Make the bed', '30 push-ups'] },
      { title: 'Wake the Body', quote: '“Move the body first.”', bullets: ['Add 30 squats', 'Add a 10-minute walk', 'Keep the first 3'] },
      { title: 'Build the Rhythm', quote: '“Repetition changes the rhythm of a day.”', bullets: ['Add 10 minutes of stretching', 'Keep the first 5', 'Close even the hard days'] },
      { title: 'Adapt to the Standard', quote: '“Waver, then return to the standard.”', bullets: ['Add 5 pages of reading', '7 routines in total', 'Finish 30 days of BASIC'] },
    ],
    STANDARD: [
      { title: 'Condition the Body', quote: '“A careless rep leaves nothing behind.”', bullets: ['50 push-ups', '50 squats', '1 L of water · Make the bed'] },
      { title: 'Add Endurance', quote: '“As your heart endures, your standard expands.”', bullets: ['Add a 2 km run or walk', 'Keep the first 4', '5 routines in total'] },
      { title: 'Begin Restraint', quote: '“A standard rises when desire is controlled.”', bullets: ['Add 10 pages of reading', 'Add no pornography', '7 routines in total'] },
      { title: 'Lock the Standard', quote: '“Hold the same standard when tired.”', bullets: ['Short videos: 30 min max', 'Tidy for 10 minutes', '9 routines in total'] },
    ],
    HARD: [
      { title: 'Raise the Intensity', quote: '“Pass through what you want to avoid.”', bullets: ['Train for 60 minutes', 'Read 20 pages', 'Drink 1.5 L of water'] },
      { title: 'Build Endurance', quote: '“Keep the order under pressure.”', bullets: ['Add a 3 km run', 'Keep the first 3', '4 routines in total'] },
      { title: 'Deepen the Work', quote: '“Standards show on hard days, not easy ones.”', bullets: ['Add 90 minutes of deep work', 'Add no pornography', '6 routines in total'] },
      { title: 'Command Desire', quote: '“Carry the same weight to the end.”', bullets: ['No junk food', 'No short-form videos', 'Meditate for 10 minutes'] },
    ],
  },
};

function clone(base: LocalizedContent, overrides: LocalizedOverrides): LocalizedContent {
  return {
    ...base,
    ...overrides,
    ui: { ...base.ui, ...overrides.ui },
    languages: { ...base.languages, ...(overrides.languages ?? {}) },
    categories: { ...base.categories, ...overrides.categories },
    scopes: { ...base.scopes, ...overrides.scopes },
    routines: { ...base.routines, ...overrides.routines },
    stages: overrides.stages ?? base.stages,
  };
}

const ja = clone(en, {
  ui: {
    back: '戻る', settings: '設定', start: '始める', close: '閉じる', cancel: '取り消す', save: '保存', add: '追加', reset: 'リセット', today: '今日', records: '記録', course: 'コース', dayCourse: 'Day {day} · {level} コース',
    notificationDenied: '通知が許可されていません。', notificationFailed: '通知を設定できませんでした。', saveFailed: '進捗を保存できませんでした。', todayFire: '今日の火種', todaySummary: '今日のまとめ', todayRoutines: '今日のルーティン', completedCount: '{done} / {total} 完了',
    complete: '完了', incomplete: '未完了', inProgress: '進行中', ended: '終了', streak: '連続', achievement: '達成率', addPersonalRoutine: '+ 個人ルーティンを追加', writeReflection: '一日の振り返りを書く', closeComplete: '締め完了', courseState: '{level} コース {state}',
    recordsSubtitle: '積み重ねた記録が自分をつくる', completionStreak: '連続完了', days: '{count}日', course30Summary: '30日コースまとめ', courseSummaryCaption: '完了 {done}日 · 未完了 {missed}日', view30Records: '30日の記録を見る ›', recentRecords: '最近の記録', recordCollectionLink: '記録一覧 ›',
    currentAndNext: '現在のコースと次の段階', currentProgress: '現在の進捗', currentStage: '現在の段階', stageStandards: 'この段階の基準', courseStages: 'コース段階', nextCourse: '次のコース', available: '開始可能', locked: 'ロック', startCourse: '{level} を始める', finalCourse: '最終コース', retryNeeded: '再挑戦が必要', restartCourse: '{level} をやり直す',
    records30: '30日の記録', recordCollection: '記録一覧', recordsLeft: '残した記録', countItems: '{count}件', recordsByDate: '日付別の記録', notificationSettings: '通知設定', hapticSettings: 'タップ反応', vibration: '振動', dataReset: 'データをリセット', appInfo: 'アプリ情報', language: '言語', personal: '個人', deleteRoutine: '{name}を削除', noRecord: '記録なし',
    resultCompleteTitle: '完了。', resultIncompleteTitle: '未完了。', resultCompleteCopy: '今日は逃げなかった。', resultIncompleteCopy: '残ったルーティンも記録された。', completedRoutines: '完了ルーティン', incompleteRoutines: '未完了ルーティン', completionStreakLabel: '連続完了', reflection: '一日の振り返り', todayRecord: '今日の記録', personalRoutineAdd: '個人ルーティンを追加', routineName: 'ルーティン名', routinePlaceholder: '例：懸垂10回', category: 'カテゴリー', scope: '適用期間',
    resetCopy: 'ルーティン、締めた日、振り返り、コース進捗を初期状態に戻します。', app: 'アプリ', version: 'バージョン', storage: '保存先', storedOnDevice: 'この端末に保存', course30Days: '{level} · 30日', scheduled: '予定', noRecordYet: 'まだ記録がありません。', date: '日付', status: '状態', stage: '段階', routineCompletion: 'ルーティン完了', routines: 'ルーティン',
    finishCourseToast: '{level}の30日コースを完了しました。', editLockedToast: '締めた後はルーティンを変更できません。', alreadyClosedToast: 'この日はすでに締めています。', closeUndoneToast: '締めを取り消しました。', enterReflectionToast: '振り返りを入力してください。', reflectionSavedToast: '振り返りを保存しました。', addLockedToast: '締めた後はルーティンを追加できません。', personalRoutine: '個人ルーティン', personalAddedToast: '個人ルーティンを追加しました。', deleteLockedToast: '締めた後はルーティンを削除できません。', personalDeletedToast: '個人ルーティンを削除しました。', resetDoneToast: '記録をリセットしました。', nextCourseBlockedToast: '現在のコースを完了してから次へ進んでください。', nextCourseStartedToast: '次のコースを始めます。', restartBlockedToast: 'コース終了後に再挑戦できます。', restartedToast: '{level}をもう一度始めます。', reminderChannel: '一日の締め', reminderBody: '一日を締め、今日の記録を残せ。', languageTitle: 'アプリの言語', systemLanguage: 'システム設定',
  },
  languages: { system: 'システム設定', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' },
  categories: { 몸: '身体', 정신: '精神', 절제: '自制', 집중: '集中', 생활: '生活' },
  scopes: { 오늘만: '今日だけ', '이번 과정 동안': 'このコース中' },
  routines: {
    water: '水を500ml飲む', bed: 'ベッドを整える', pushup: '腕立て伏せ30回', 'basic-squat': 'スクワット30回', 'basic-walk': '10分歩く', 'basic-stretch': '10分ストレッチ', 'basic-reading': '本を5ページ読む', 'standard-pushup': '腕立て伏せ50回', 'standard-squat': 'スクワット50回', 'standard-water': '水を1L飲む', 'standard-bed': 'ベッドを整える', 'standard-running': '2km走るか歩く', 'standard-reading': '本を10ページ読む', 'standard-porn-free': 'ポルノ禁止', 'standard-short-form-limit': 'ショート動画は30分以内', 'standard-tidy': '10分片づける', 'hard-training': '60分トレーニング', 'hard-reading': '本を20ページ読む', 'hard-water': '水を1.5L飲む', 'hard-running': '3km走る', 'hard-deep-work': '90分ディープワーク', 'hard-porn-free': 'ポルノ禁止', 'hard-junk-food-free': 'ジャンクフード禁止', 'hard-short-form-free': 'ショート動画禁止', 'hard-meditation': '10分瞑想',
  },
  stages: {
    BASIC: [
      { title: '基礎統制', quote: '「自分を目覚めさせろ。」', bullets: ['水を500ml飲む', 'ベッドを整える', '腕立て伏せ30回'] },
      { title: '身体を起こす', quote: '「まず身体を動かせ。」', bullets: ['スクワット30回を追加', '10分の散歩を追加', '最初の3つを維持'] },
      { title: '生活のリズム', quote: '「反復が一日のリズムを変える。」', bullets: ['10分ストレッチを追加', '最初の5つを維持', '揺れた日も締める'] },
      { title: '基準への適応', quote: '「揺れても基準へ戻れ。」', bullets: ['読書5ページを追加', '合計7ルーティン', 'BASICを30日完遂'] },
    ],
    STANDARD: [
      { title: '身体を鍛える', quote: '「雑な一回は身体に残らない。」', bullets: ['腕立て伏せ50回', 'スクワット50回', '水1L · ベッドを整える'] },
      { title: '持久力を加える', quote: '「心臓が耐えた分だけ基準は広がる。」', bullets: ['2kmのランか歩行を追加', '最初の4つを維持', '合計5ルーティン'] },
      { title: '自制を始める', quote: '「欲望を扱う瞬間、基準が立つ。」', bullets: ['読書10ページを追加', 'ポルノ禁止を追加', '合計7ルーティン'] },
      { title: '基準を固定する', quote: '「疲れた日も同じ基準で動け。」', bullets: ['ショート動画30分以内', '10分片づけ', '合計9ルーティン'] },
    ],
    HARD: [
      { title: '強度を上げる', quote: '「避けたい地点から通過しろ。」', bullets: ['60分トレーニング', '読書20ページ', '水1.5L'] },
      { title: '持久力を鍛える', quote: '「圧力の中でも順序を守れ。」', bullets: ['3kmランを追加', '最初の3つを維持', '合計4ルーティン'] },
      { title: '深い集中', quote: '「基準は困難な日に現れる。」', bullets: ['90分ディープワークを追加', 'ポルノ禁止を追加', '合計6ルーティン'] },
      { title: '欲望を統制する', quote: '「最後まで同じ重さで耐えろ。」', bullets: ['ジャンクフード禁止', 'ショート動画禁止', '10分瞑想'] },
    ],
  },
});

const es = clone(en, {
  ui: {
    back: 'Volver', settings: 'Ajustes', start: 'Empezar', close: 'Cerrar', cancel: 'Cancelar', save: 'Guardar', add: 'Añadir', reset: 'Restablecer', today: 'Hoy', records: 'Registros', course: 'Curso', dayCourse: 'Día {day} · {level}', notificationDenied: 'Los avisos están desactivados.', notificationFailed: 'No se pudieron configurar los avisos.', saveFailed: 'No se pudo guardar el progreso.', todayFire: 'La chispa de hoy', todaySummary: 'Resumen de hoy', todayRoutines: 'Rutinas de hoy', completedCount: '{done} / {total} hechas', complete: 'Completo', incomplete: 'Incompleto', inProgress: 'En curso', ended: 'Finalizado', streak: 'Racha', achievement: 'Cumplimiento', addPersonalRoutine: '+ Añadir rutina personal', writeReflection: 'Escribir reflexión diaria', closeComplete: 'Día cerrado', courseState: '{level} {state}', recordsSubtitle: 'Tus registros te construyen', completionStreak: 'Racha completa', days: '{count} días', course30Summary: 'Resumen de 30 días', courseSummaryCaption: '{done} completos · {missed} incompletos', view30Records: 'Ver registro de 30 días ›', recentRecords: 'Registros recientes', recordCollectionLink: 'Todos los registros ›', currentAndNext: 'Curso actual y siguiente', currentProgress: 'Progreso actual', currentStage: 'Etapa actual', stageStandards: 'Reglas de esta etapa', courseStages: 'Etapas del curso', nextCourse: 'Siguiente curso', available: 'Disponible', locked: 'Bloqueado', startCourse: 'Empezar {level}', finalCourse: 'Curso final', retryNeeded: 'Hay que repetir', restartCourse: 'Reiniciar {level}', records30: 'Registro de 30 días', recordCollection: 'Todos los registros', recordsLeft: 'Registros escritos', countItems: '{count}', recordsByDate: 'Registros por fecha', notificationSettings: 'Notificaciones', hapticSettings: 'Respuesta táctil', vibration: 'Vibración', dataReset: 'Restablecer datos', appInfo: 'Información de la app', language: 'Idioma', personal: 'Personal', deleteRoutine: 'Eliminar {name}', noRecord: 'Sin registro', resultCompleteTitle: 'Completo.', resultIncompleteTitle: 'Incompleto.', resultCompleteCopy: 'Hoy no huiste.', resultIncompleteCopy: 'Lo pendiente quedó registrado.', completedRoutines: 'Rutinas completas', incompleteRoutines: 'Rutinas incompletas', completionStreakLabel: 'Racha completa', reflection: 'Reflexión diaria', todayRecord: 'Registro de hoy', personalRoutineAdd: 'Añadir rutina personal', routineName: 'Nombre de la rutina', routinePlaceholder: 'Ej.: 10 dominadas', category: 'Categoría', scope: 'Duración', resetCopy: 'Restablece rutinas, cierres, reflexiones y progreso del curso.', app: 'App', version: 'Versión', storage: 'Almacenamiento', storedOnDevice: 'Guardado en este dispositivo', course30Days: '{level} · 30 días', scheduled: 'Próximo', noRecordYet: 'Aún no hay registro.', date: 'Fecha', status: 'Estado', stage: 'Etapa', routineCompletion: 'Rutinas completadas', routines: 'Rutinas', finishCourseToast: 'Completaste los 30 días de {level}.', editLockedToast: 'No puedes cambiar rutinas tras cerrar el día.', alreadyClosedToast: 'Este día ya está cerrado.', closeUndoneToast: 'Cierre cancelado.', enterReflectionToast: 'Escribe tu reflexión.', reflectionSavedToast: 'Reflexión guardada.', addLockedToast: 'No puedes añadir rutinas tras cerrar el día.', personalRoutine: 'Rutina personal', personalAddedToast: 'Rutina personal añadida.', deleteLockedToast: 'No puedes borrar rutinas tras cerrar el día.', personalDeletedToast: 'Rutina personal eliminada.', resetDoneToast: 'Registros restablecidos.', nextCourseBlockedToast: 'Completa este curso antes de empezar el siguiente.', nextCourseStartedToast: 'Empieza el siguiente curso.', restartBlockedToast: 'Podrás repetir cuando termine el curso.', restartedToast: '{level} empieza de nuevo.', reminderChannel: 'Cierra el día', reminderBody: 'Cierra el día y deja un registro honesto.', languageTitle: 'Idioma de la app', systemLanguage: 'Predeterminado del sistema',
  },
  languages: { system: 'Sistema', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' },
  categories: { 몸: 'Cuerpo', 정신: 'Mente', 절제: 'Disciplina', 집중: 'Enfoque', 생활: 'Vida' }, scopes: { 오늘만: 'Solo hoy', '이번 과정 동안': 'Durante este curso' },
  routines: { water: 'Beber 500 ml de agua', bed: 'Hacer la cama', pushup: '30 flexiones', 'basic-squat': '30 sentadillas', 'basic-walk': 'Caminar 10 minutos', 'basic-stretch': 'Estirar 10 minutos', 'basic-reading': 'Leer 5 páginas', 'standard-pushup': '50 flexiones', 'standard-squat': '50 sentadillas', 'standard-water': 'Beber 1 L de agua', 'standard-bed': 'Hacer la cama', 'standard-running': 'Correr o caminar 2 km', 'standard-reading': 'Leer 10 páginas', 'standard-porn-free': 'Sin pornografía', 'standard-short-form-limit': 'Vídeos cortos: máximo 30 min', 'standard-tidy': 'Ordenar 10 minutos', 'hard-training': 'Entrenar 60 minutos', 'hard-reading': 'Leer 20 páginas', 'hard-water': 'Beber 1,5 L de agua', 'hard-running': 'Correr 3 km', 'hard-deep-work': '90 minutos de trabajo profundo', 'hard-porn-free': 'Sin pornografía', 'hard-junk-food-free': 'Sin comida basura', 'hard-short-form-free': 'Sin vídeos cortos', 'hard-meditation': 'Meditar 10 minutos' },
  stages: {
    BASIC: [{ title: 'Control básico', quote: '«Despiértate.»', bullets: ['Beber 500 ml de agua', 'Hacer la cama', '30 flexiones'] }, { title: 'Despierta el cuerpo', quote: '«Mueve primero el cuerpo.»', bullets: ['Añade 30 sentadillas', 'Añade 10 minutos a pie', 'Mantén las primeras 3'] }, { title: 'Ritmo de vida', quote: '«La repetición cambia el ritmo del día.»', bullets: ['Añade 10 minutos de estiramientos', 'Mantén las primeras 5', 'Cierra incluso los días difíciles'] }, { title: 'Adapta el estándar', quote: '«Titubea, pero vuelve al estándar.»', bullets: ['Añade 5 páginas de lectura', '7 rutinas en total', 'Completa 30 días de BASIC'] }],
    STANDARD: [{ title: 'Forja el cuerpo', quote: '«Una repetición descuidada no deja huella.»', bullets: ['50 flexiones', '50 sentadillas', '1 L de agua · Hacer la cama'] }, { title: 'Añade resistencia', quote: '«Tu estándar crece con tu resistencia.»', bullets: ['Añade 2 km corriendo o andando', 'Mantén las primeras 4', '5 rutinas en total'] }, { title: 'Empieza el dominio', quote: '«El estándar nace al dominar el deseo.»', bullets: ['Añade 10 páginas de lectura', 'Añade sin pornografía', '7 rutinas en total'] }, { title: 'Fija el estándar', quote: '«Mantén el mismo estándar cuando estés cansado.»', bullets: ['Vídeos cortos: máx. 30 min', 'Ordena 10 minutos', '9 rutinas en total'] }],
    HARD: [{ title: 'Sube la intensidad', quote: '«Atraviesa lo que quieres evitar.»', bullets: ['Entrena 60 minutos', 'Lee 20 páginas', 'Bebe 1,5 L de agua'] }, { title: 'Construye resistencia', quote: '«Mantén el orden bajo presión.»', bullets: ['Añade una carrera de 3 km', 'Mantén las primeras 3', '4 rutinas en total'] }, { title: 'Profundiza el trabajo', quote: '«El estándar aparece en los días duros.»', bullets: ['Añade 90 minutos de trabajo profundo', 'Añade sin pornografía', '6 rutinas en total'] }, { title: 'Domina el deseo', quote: '«Carga el mismo peso hasta el final.»', bullets: ['Sin comida basura', 'Sin vídeos cortos', 'Medita 10 minutos'] }],
  },
});

const de = clone(en, {
  ui: {
    back: 'Zurück', settings: 'Einstellungen', start: 'Beginnen', close: 'Schließen', cancel: 'Abbrechen', save: 'Speichern', add: 'Hinzufügen', reset: 'Zurücksetzen', today: 'Heute', records: 'Aufzeichnungen', course: 'Kurs', dayCourse: 'Tag {day} · {level}', notificationDenied: 'Benachrichtigungen sind deaktiviert.', notificationFailed: 'Benachrichtigungen konnten nicht eingerichtet werden.', saveFailed: 'Fortschritt konnte nicht gespeichert werden.', todayFire: 'Der Funke von heute', todaySummary: 'Heutige Übersicht', todayRoutines: 'Heutige Routinen', completedCount: '{done} / {total} erledigt', complete: 'Erledigt', incomplete: 'Unvollständig', inProgress: 'In Arbeit', ended: 'Beendet', streak: 'Serie', achievement: 'Erfüllung', addPersonalRoutine: '+ Eigene Routine hinzufügen', writeReflection: 'Tagesreflexion schreiben', closeComplete: 'Tag abgeschlossen', courseState: '{level} {state}', recordsSubtitle: 'Deine Aufzeichnungen formen dich', completionStreak: 'Erfolgsserie', days: '{count} Tage', course30Summary: '30-Tage-Übersicht', courseSummaryCaption: '{done} erledigt · {missed} offen', view30Records: '30-Tage-Verlauf ansehen ›', recentRecords: 'Letzte Aufzeichnungen', recordCollectionLink: 'Alle Aufzeichnungen ›', currentAndNext: 'Aktueller und nächster Kurs', currentProgress: 'Aktueller Fortschritt', currentStage: 'Aktuelle Stufe', stageStandards: 'Maßstab dieser Stufe', courseStages: 'Kursstufen', nextCourse: 'Nächster Kurs', available: 'Bereit', locked: 'Gesperrt', startCourse: '{level} beginnen', finalCourse: 'Letzter Kurs', retryNeeded: 'Wiederholung nötig', restartCourse: '{level} neu starten', records30: '30-Tage-Verlauf', recordCollection: 'Alle Aufzeichnungen', recordsLeft: 'Einträge', countItems: '{count}', recordsByDate: 'Nach Datum', notificationSettings: 'Benachrichtigungen', hapticSettings: 'Taptisches Feedback', vibration: 'Vibration', dataReset: 'Daten zurücksetzen', appInfo: 'App-Informationen', language: 'Sprache', personal: 'Eigene', deleteRoutine: '{name} löschen', noRecord: 'Kein Eintrag', resultCompleteTitle: 'Erledigt.', resultIncompleteTitle: 'Unvollständig.', resultCompleteCopy: 'Heute bist du nicht ausgewichen.', resultIncompleteCopy: 'Was offen blieb, ist festgehalten.', completedRoutines: 'Erledigte Routinen', incompleteRoutines: 'Offene Routinen', completionStreakLabel: 'Erfolgsserie', reflection: 'Tagesreflexion', todayRecord: 'Heutiger Eintrag', personalRoutineAdd: 'Eigene Routine hinzufügen', routineName: 'Name der Routine', routinePlaceholder: 'z. B. 10 Klimmzüge', category: 'Kategorie', scope: 'Zeitraum', resetCopy: 'Setzt Routinen, Tagesabschlüsse, Reflexionen und Kursfortschritt zurück.', app: 'App', version: 'Version', storage: 'Speicher', storedOnDevice: 'Auf diesem Gerät gespeichert', course30Days: '{level} · 30 Tage', scheduled: 'Geplant', noRecordYet: 'Noch kein Eintrag.', date: 'Datum', status: 'Status', stage: 'Stufe', routineCompletion: 'Routinen erledigt', routines: 'Routinen', finishCourseToast: 'Du hast den 30-Tage-Kurs {level} abgeschlossen.', editLockedToast: 'Nach Tagesabschluss sind Änderungen gesperrt.', alreadyClosedToast: 'Dieser Tag ist bereits abgeschlossen.', closeUndoneToast: 'Tagesabschluss aufgehoben.', enterReflectionToast: 'Schreibe deine Reflexion.', reflectionSavedToast: 'Reflexion gespeichert.', addLockedToast: 'Nach Tagesabschluss können keine Routinen hinzugefügt werden.', personalRoutine: 'Eigene Routine', personalAddedToast: 'Routine hinzugefügt.', deleteLockedToast: 'Nach Tagesabschluss können keine Routinen gelöscht werden.', personalDeletedToast: 'Routine gelöscht.', resetDoneToast: 'Aufzeichnungen zurückgesetzt.', nextCourseBlockedToast: 'Schließe diesen Kurs ab, bevor du den nächsten beginnst.', nextCourseStartedToast: 'Der nächste Kurs beginnt.', restartBlockedToast: 'Nach Kursende kannst du neu beginnen.', restartedToast: '{level} beginnt von vorn.', reminderChannel: 'Tag abschließen', reminderBody: 'Schließe den Tag ab und hinterlasse einen ehrlichen Eintrag.', languageTitle: 'App-Sprache', systemLanguage: 'Systemstandard',
  },
  languages: { system: 'Systemstandard', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' }, categories: { 몸: 'Körper', 정신: 'Geist', 절제: 'Disziplin', 집중: 'Fokus', 생활: 'Leben' }, scopes: { 오늘만: 'Nur heute', '이번 과정 동안': 'Für diesen Kurs' },
  routines: { water: '500 ml Wasser trinken', bed: 'Bett machen', pushup: '30 Liegestütze', 'basic-squat': '30 Kniebeugen', 'basic-walk': '10 Minuten gehen', 'basic-stretch': '10 Minuten dehnen', 'basic-reading': '5 Seiten lesen', 'standard-pushup': '50 Liegestütze', 'standard-squat': '50 Kniebeugen', 'standard-water': '1 L Wasser trinken', 'standard-bed': 'Bett machen', 'standard-running': '2 km laufen oder gehen', 'standard-reading': '10 Seiten lesen', 'standard-porn-free': 'Keine Pornografie', 'standard-short-form-limit': 'Kurzvideos: max. 30 Min.', 'standard-tidy': '10 Minuten aufräumen', 'hard-training': '60 Minuten trainieren', 'hard-reading': '20 Seiten lesen', 'hard-water': '1,5 L Wasser trinken', 'hard-running': '3 km laufen', 'hard-deep-work': '90 Minuten Deep Work', 'hard-porn-free': 'Keine Pornografie', 'hard-junk-food-free': 'Kein Junkfood', 'hard-short-form-free': 'Keine Kurzvideos', 'hard-meditation': '10 Minuten meditieren' },
  stages: {
    BASIC: [{ title: 'Grundkontrolle', quote: '„Weck dich selbst auf.“', bullets: ['500 ml Wasser trinken', 'Bett machen', '30 Liegestütze'] }, { title: 'Körper wecken', quote: '„Bewege zuerst den Körper.“', bullets: ['30 Kniebeugen ergänzen', '10 Minuten Gehen ergänzen', 'Die ersten 3 halten'] }, { title: 'Lebensrhythmus', quote: '„Wiederholung verändert den Rhythmus des Tages.“', bullets: ['10 Minuten Dehnen ergänzen', 'Die ersten 5 halten', 'Auch schwere Tage abschließen'] }, { title: 'An den Maßstab anpassen', quote: '„Wanke, aber kehre zum Maßstab zurück.“', bullets: ['5 Seiten Lesen ergänzen', 'Insgesamt 7 Routinen', '30 Tage BASIC abschließen'] }],
    STANDARD: [{ title: 'Körper formen', quote: '„Eine schlampige Wiederholung hinterlässt nichts.“', bullets: ['50 Liegestütze', '50 Kniebeugen', '1 L Wasser · Bett machen'] }, { title: 'Ausdauer ergänzen', quote: '„Mit der Ausdauer wächst dein Maßstab.“', bullets: ['2 km Laufen oder Gehen ergänzen', 'Die ersten 4 halten', 'Insgesamt 5 Routinen'] }, { title: 'Selbstkontrolle beginnen', quote: '„Ein Maßstab entsteht, wenn du Verlangen beherrschst.“', bullets: ['10 Seiten Lesen ergänzen', 'Keine Pornografie ergänzen', 'Insgesamt 7 Routinen'] }, { title: 'Maßstab festigen', quote: '„Halte denselben Maßstab, wenn du müde bist.“', bullets: ['Kurzvideos: max. 30 Min.', '10 Minuten aufräumen', 'Insgesamt 9 Routinen'] }],
    HARD: [{ title: 'Intensität erhöhen', quote: '„Geh durch das, was du meiden willst.“', bullets: ['60 Minuten trainieren', '20 Seiten lesen', '1,5 L Wasser trinken'] }, { title: 'Ausdauer aufbauen', quote: '„Halte unter Druck die Reihenfolge.“', bullets: ['3-km-Lauf ergänzen', 'Die ersten 3 halten', 'Insgesamt 4 Routinen'] }, { title: 'Arbeit vertiefen', quote: '„Maßstäbe zeigen sich an schweren Tagen.“', bullets: ['90 Minuten Deep Work ergänzen', 'Keine Pornografie ergänzen', 'Insgesamt 6 Routinen'] }, { title: 'Verlangen beherrschen', quote: '„Trage dasselbe Gewicht bis zum Ende.“', bullets: ['Kein Junkfood', 'Keine Kurzvideos', '10 Minuten meditieren'] }],
  },
});

const fr = clone(en, {
  ui: {
    back: 'Retour', settings: 'Réglages', start: 'Commencer', close: 'Fermer', cancel: 'Annuler', save: 'Enregistrer', add: 'Ajouter', reset: 'Réinitialiser', today: "Aujourd’hui", records: 'Journal', course: 'Parcours', dayCourse: 'Jour {day} · {level}', notificationDenied: 'Les notifications sont désactivées.', notificationFailed: 'Impossible de configurer les notifications.', saveFailed: 'Impossible d’enregistrer la progression.', todayFire: 'L’étincelle du jour', todaySummary: 'Bilan du jour', todayRoutines: 'Routines du jour', completedCount: '{done} / {total} faites', complete: 'Terminé', incomplete: 'Incomplet', inProgress: 'En cours', ended: 'Terminé', streak: 'Série', achievement: 'Réussite', addPersonalRoutine: '+ Ajouter une routine', writeReflection: 'Écrire la réflexion du jour', closeComplete: 'Journée close', courseState: '{level} {state}', recordsSubtitle: 'Tes traces te façonnent', completionStreak: 'Série complète', days: '{count} jours', course30Summary: 'Bilan des 30 jours', courseSummaryCaption: '{done} réussis · {missed} incomplets', view30Records: 'Voir les 30 jours ›', recentRecords: 'Entrées récentes', recordCollectionLink: 'Tout le journal ›', currentAndNext: 'Parcours actuel et suivant', currentProgress: 'Progression actuelle', currentStage: 'Étape actuelle', stageStandards: 'Exigences de cette étape', courseStages: 'Étapes du parcours', nextCourse: 'Parcours suivant', available: 'Disponible', locked: 'Verrouillé', startCourse: 'Commencer {level}', finalCourse: 'Parcours final', retryNeeded: 'Nouvel essai requis', restartCourse: 'Recommencer {level}', records30: 'Journal des 30 jours', recordCollection: 'Tout le journal', recordsLeft: 'Entrées écrites', countItems: '{count}', recordsByDate: 'Journal par date', notificationSettings: 'Notifications', hapticSettings: 'Retour tactile', vibration: 'Vibration', dataReset: 'Réinitialiser les données', appInfo: 'Informations', language: 'Langue', personal: 'Perso', deleteRoutine: 'Supprimer {name}', noRecord: 'Aucune entrée', resultCompleteTitle: 'Terminé.', resultIncompleteTitle: 'Incomplet.', resultCompleteCopy: 'Aujourd’hui, tu n’as pas fui.', resultIncompleteCopy: 'Ce qui reste est consigné.', completedRoutines: 'Routines terminées', incompleteRoutines: 'Routines incomplètes', completionStreakLabel: 'Série complète', reflection: 'Réflexion du jour', todayRecord: 'Trace du jour', personalRoutineAdd: 'Ajouter une routine', routineName: 'Nom de la routine', routinePlaceholder: 'Ex. : 10 tractions', category: 'Catégorie', scope: 'Durée', resetCopy: 'Réinitialise les routines, clôtures, réflexions et la progression.', app: 'App', version: 'Version', storage: 'Stockage', storedOnDevice: 'Stocké sur cet appareil', course30Days: '{level} · 30 jours', scheduled: 'À venir', noRecordYet: 'Aucune entrée pour le moment.', date: 'Date', status: 'Statut', stage: 'Étape', routineCompletion: 'Routines terminées', routines: 'Routines', finishCourseToast: 'Tu as terminé les 30 jours de {level}.', editLockedToast: 'Impossible de modifier les routines après la clôture.', alreadyClosedToast: 'Cette journée est déjà close.', closeUndoneToast: 'Clôture annulée.', enterReflectionToast: 'Écris ta réflexion.', reflectionSavedToast: 'Réflexion enregistrée.', addLockedToast: 'Impossible d’ajouter une routine après la clôture.', personalRoutine: 'Routine personnelle', personalAddedToast: 'Routine ajoutée.', deleteLockedToast: 'Impossible de supprimer une routine après la clôture.', personalDeletedToast: 'Routine supprimée.', resetDoneToast: 'Journal réinitialisé.', nextCourseBlockedToast: 'Termine ce parcours avant de passer au suivant.', nextCourseStartedToast: 'Le parcours suivant commence.', restartBlockedToast: 'Tu pourras recommencer à la fin du parcours.', restartedToast: '{level} recommence maintenant.', reminderChannel: 'Clore la journée', reminderBody: 'Clôture la journée et laisse une trace honnête.', languageTitle: 'Langue de l’app', systemLanguage: 'Réglage du système',
  },
  languages: { system: 'Système', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' }, categories: { 몸: 'Corps', 정신: 'Esprit', 절제: 'Discipline', 집중: 'Concentration', 생활: 'Vie' }, scopes: { 오늘만: "Aujourd’hui seulement", '이번 과정 동안': 'Pendant ce parcours' },
  routines: { water: 'Boire 500 ml d’eau', bed: 'Faire le lit', pushup: '30 pompes', 'basic-squat': '30 squats', 'basic-walk': 'Marcher 10 minutes', 'basic-stretch': 'S’étirer 10 minutes', 'basic-reading': 'Lire 5 pages', 'standard-pushup': '50 pompes', 'standard-squat': '50 squats', 'standard-water': 'Boire 1 L d’eau', 'standard-bed': 'Faire le lit', 'standard-running': 'Courir ou marcher 2 km', 'standard-reading': 'Lire 10 pages', 'standard-porn-free': 'Aucune pornographie', 'standard-short-form-limit': 'Vidéos courtes : 30 min max', 'standard-tidy': 'Ranger 10 minutes', 'hard-training': 'S’entraîner 60 minutes', 'hard-reading': 'Lire 20 pages', 'hard-water': 'Boire 1,5 L d’eau', 'hard-running': 'Courir 3 km', 'hard-deep-work': '90 minutes de travail profond', 'hard-porn-free': 'Aucune pornographie', 'hard-junk-food-free': 'Aucune malbouffe', 'hard-short-form-free': 'Aucune vidéo courte', 'hard-meditation': 'Méditer 10 minutes' },
  stages: {
    BASIC: [{ title: 'Contrôle fondamental', quote: '« Réveille-toi. »', bullets: ['Boire 500 ml d’eau', 'Faire le lit', '30 pompes'] }, { title: 'Réveiller le corps', quote: '« Fais d’abord bouger le corps. »', bullets: ['Ajouter 30 squats', 'Ajouter 10 minutes de marche', 'Garder les 3 premières'] }, { title: 'Rythme de vie', quote: '« La répétition change le rythme d’une journée. »', bullets: ['Ajouter 10 minutes d’étirements', 'Garder les 5 premières', 'Clore même les jours difficiles'] }, { title: 'S’adapter au standard', quote: '« Vacille, puis reviens au standard. »', bullets: ['Ajouter 5 pages de lecture', '7 routines au total', 'Finir les 30 jours BASIC'] }],
    STANDARD: [{ title: 'Forger le corps', quote: '« Une répétition négligée ne laisse rien. »', bullets: ['50 pompes', '50 squats', '1 L d’eau · Faire le lit'] }, { title: 'Ajouter l’endurance', quote: '« Ton standard grandit avec ton endurance. »', bullets: ['Ajouter 2 km de course ou marche', 'Garder les 4 premières', '5 routines au total'] }, { title: 'Commencer la maîtrise', quote: '« Le standard naît quand le désir est maîtrisé. »', bullets: ['Ajouter 10 pages de lecture', 'Ajouter aucune pornographie', '7 routines au total'] }, { title: 'Fixer le standard', quote: '« Garde le même standard dans la fatigue. »', bullets: ['Vidéos courtes : 30 min max', 'Ranger 10 minutes', '9 routines au total'] }],
    HARD: [{ title: 'Monter l’intensité', quote: '« Traverse ce que tu veux éviter. »', bullets: ['S’entraîner 60 minutes', 'Lire 20 pages', 'Boire 1,5 L d’eau'] }, { title: 'Bâtir l’endurance', quote: '« Garde l’ordre sous la pression. »', bullets: ['Ajouter une course de 3 km', 'Garder les 3 premières', '4 routines au total'] }, { title: 'Approfondir le travail', quote: '« Le standard se révèle les jours difficiles. »', bullets: ['Ajouter 90 minutes de travail profond', 'Ajouter aucune pornographie', '6 routines au total'] }, { title: 'Maîtriser le désir', quote: '« Porte le même poids jusqu’au bout. »', bullets: ['Aucune malbouffe', 'Aucune vidéo courte', 'Méditer 10 minutes'] }],
  },
});

const zh = clone(en, {
  ui: {
    back: '返回', settings: '设置', start: '开始', close: '关闭', cancel: '取消', save: '保存', add: '添加', reset: '重置', today: '今天', records: '记录', course: '课程', dayCourse: '第 {day} 天 · {level}', notificationDenied: '通知权限已关闭。', notificationFailed: '无法设置通知。', saveFailed: '无法保存进度。', todayFire: '今日火种', todaySummary: '今日概览', todayRoutines: '今日习惯', completedCount: '完成 {done} / {total}', complete: '完成', incomplete: '未完成', inProgress: '进行中', ended: '已结束', streak: '连续', achievement: '完成率', addPersonalRoutine: '+ 添加个人习惯', writeReflection: '写今日复盘', closeComplete: '今日已结束', courseState: '{level} {state}', recordsSubtitle: '累积的记录塑造你', completionStreak: '连续完成', days: '{count}天', course30Summary: '30天课程概览', courseSummaryCaption: '完成 {done}天 · 未完成 {missed}天', view30Records: '查看30天记录 ›', recentRecords: '最近记录', recordCollectionLink: '全部记录 ›', currentAndNext: '当前课程与下一阶段', currentProgress: '当前进度', currentStage: '当前阶段', stageStandards: '本阶段标准', courseStages: '课程阶段', nextCourse: '下一课程', available: '可以开始', locked: '已锁定', startCourse: '开始 {level}', finalCourse: '最终课程', retryNeeded: '需要重试', restartCourse: '重启 {level}', records30: '30天记录', recordCollection: '全部记录', recordsLeft: '已写记录', countItems: '{count}条', recordsByDate: '按日期查看', notificationSettings: '通知设置', hapticSettings: '触感反馈', vibration: '振动', dataReset: '重置数据', appInfo: '应用信息', language: '语言', personal: '个人', deleteRoutine: '删除{name}', noRecord: '暂无记录', resultCompleteTitle: '完成。', resultIncompleteTitle: '未完成。', resultCompleteCopy: '今天你没有逃避。', resultIncompleteCopy: '未完成的也已如实记录。', completedRoutines: '已完成习惯', incompleteRoutines: '未完成习惯', completionStreakLabel: '连续完成', reflection: '今日复盘', todayRecord: '今日记录', personalRoutineAdd: '添加个人习惯', routineName: '习惯名称', routinePlaceholder: '例如：10个引体向上', category: '类别', scope: '适用范围', resetCopy: '将习惯、每日结算、复盘和课程进度恢复到初始状态。', app: '应用', version: '版本', storage: '存储', storedOnDevice: '保存在此设备', course30Days: '{level} · 30天', scheduled: '待开始', noRecordYet: '还没有记录。', date: '日期', status: '状态', stage: '阶段', routineCompletion: '习惯完成', routines: '习惯', finishCourseToast: '你完成了 {level} 的30天课程。', editLockedToast: '结束今日后不能修改习惯。', alreadyClosedToast: '今天已经结束。', closeUndoneToast: '已取消今日结束。', enterReflectionToast: '写下你的复盘。', reflectionSavedToast: '复盘已保存。', addLockedToast: '结束今日后不能添加习惯。', personalRoutine: '个人习惯', personalAddedToast: '已添加个人习惯。', deleteLockedToast: '结束今日后不能删除习惯。', personalDeletedToast: '已删除个人习惯。', resetDoneToast: '记录已重置。', nextCourseBlockedToast: '完成当前课程后才能开始下一课程。', nextCourseStartedToast: '下一课程现在开始。', restartBlockedToast: '课程结束后可以重新开始。', restartedToast: '{level} 重新开始。', reminderChannel: '结束今日', reminderBody: '结束今天，留下诚实的记录。', languageTitle: '应用语言', systemLanguage: '跟随系统',
  },
  languages: { system: '跟随系统', ko: '한국어', en: 'English', ja: '日本語', es: 'Español', de: 'Deutsch', fr: 'Français', zh: '简体中文' }, categories: { 몸: '身体', 정신: '精神', 절제: '自律', 집중: '专注', 생활: '生活' }, scopes: { 오늘만: '仅今天', '이번 과정 동안': '本课程期间' },
  routines: { water: '喝500毫升水', bed: '整理床铺', pushup: '30个俯卧撑', 'basic-squat': '30个深蹲', 'basic-walk': '步行10分钟', 'basic-stretch': '拉伸10分钟', 'basic-reading': '阅读5页', 'standard-pushup': '50个俯卧撑', 'standard-squat': '50个深蹲', 'standard-water': '喝1升水', 'standard-bed': '整理床铺', 'standard-running': '跑步或步行2公里', 'standard-reading': '阅读10页', 'standard-porn-free': '禁止色情内容', 'standard-short-form-limit': '短视频不超过30分钟', 'standard-tidy': '整理10分钟', 'hard-training': '训练60分钟', 'hard-reading': '阅读20页', 'hard-water': '喝1.5升水', 'hard-running': '跑步3公里', 'hard-deep-work': '深度工作90分钟', 'hard-porn-free': '禁止色情内容', 'hard-junk-food-free': '禁止垃圾食品', 'hard-short-form-free': '禁止短视频', 'hard-meditation': '冥想10分钟' },
  stages: {
    BASIC: [{ title: '基础掌控', quote: '“唤醒自己。”', bullets: ['喝500毫升水', '整理床铺', '30个俯卧撑'] }, { title: '唤醒身体', quote: '“先让身体动起来。”', bullets: ['增加30个深蹲', '增加步行10分钟', '保持最初3项'] }, { title: '生活节奏', quote: '“重复会改变一天的节奏。”', bullets: ['增加拉伸10分钟', '保持最初5项', '动摇的日子也要结算'] }, { title: '适应标准', quote: '“可以动摇，但要回到标准。”', bullets: ['增加阅读5页', '共7项习惯', '完成BASIC 30天'] }],
    STANDARD: [{ title: '锻造身体', quote: '“敷衍的一次不会留下任何东西。”', bullets: ['50个俯卧撑', '50个深蹲', '1升水 · 整理床铺'] }, { title: '增加耐力', quote: '“心脏能承受多少，标准就能扩展多少。”', bullets: ['增加跑步或步行2公里', '保持最初4项', '共5项习惯'] }, { title: '开始克制', quote: '“掌控欲望时，标准才会站稳。”', bullets: ['增加阅读10页', '增加禁止色情内容', '共7项习惯'] }, { title: '固定标准', quote: '“疲惫时也按同一标准行动。”', bullets: ['短视频不超过30分钟', '整理10分钟', '共9项习惯'] }],
    HARD: [{ title: '提高强度', quote: '“从你最想避开的地方穿过去。”', bullets: ['训练60分钟', '阅读20页', '喝1.5升水'] }, { title: '强化耐力', quote: '“压力之下也要守住顺序。”', bullets: ['增加跑步3公里', '保持最初3项', '共4项习惯'] }, { title: '强化深度工作', quote: '“标准不是在轻松时，而是在困难时显现。”', bullets: ['增加深度工作90分钟', '增加禁止色情内容', '共6项习惯'] }, { title: '掌控欲望', quote: '“直到最后都扛住同样的重量。”', bullets: ['禁止垃圾食品', '禁止短视频', '冥想10分钟'] }],
  },
});

export const localizedContent: Record<AppLocale, LocalizedContent> = { ko, en, ja, es, de, fr, zh };
