import { AppState, CourseLevel, Routine } from './types';

export const STORAGE_KEY = 'alpha:v19:prod-state';
export const STATE_SCHEMA_VERSION = 2;

export const categories = ['몸', '정신', '절제', '집중', '생활'] as const;
export const scopes = ['오늘만', '이번 과정 동안'] as const;

export const basicRoutines: Routine[] = [
  { id: 'water', name: '물 500ml', done: false, type: 'basic' },
  { id: 'bed', name: '침대 정리', done: false, type: 'basic' },
  { id: 'pushup', name: '푸쉬업 30개', done: false, type: 'basic' },
];

const standardBaseRoutines: Routine[] = [
  { id: 'standard-pushup', name: '푸쉬업 50개', done: false, type: 'basic' },
  { id: 'standard-squat', name: '스쿼트 50개', done: false, type: 'basic' },
  { id: 'standard-water', name: '물 1L', done: false, type: 'basic' },
  { id: 'standard-bed', name: '침대 정리', done: false, type: 'basic' },
];

const hardBaseRoutines: Routine[] = [
  { id: 'hard-training', name: '운동 60분', done: false, type: 'basic' },
  { id: 'hard-reading', name: '책 20페이지', done: false, type: 'basic' },
  { id: 'hard-water', name: '물 1.5L', done: false, type: 'basic' },
];

export type CourseStage = {
  number: string;
  title: string;
  period: string;
  quote: string;
  bullets: string[];
  addedRoutines: Routine[];
};

export const courseStages: Record<CourseLevel, CourseStage[]> = {
  BASIC: [
    { number: '01', title: '기초 통제', period: 'Day 1 - 7', quote: '“너 자신을 깨워라.”', bullets: ['물 500ml', '침대 정리', '푸쉬업 30개'], addedRoutines: basicRoutines },
    { number: '02', title: '몸 깨우기', period: 'Day 8 - 14', quote: '“몸을 먼저 움직여라.”', bullets: ['스쿼트 30개 추가', '걷기 10분 추가', '기초 3개 유지'], addedRoutines: [
      { id: 'basic-squat', name: '스쿼트 30개', done: false, type: 'basic' },
      { id: 'basic-walk', name: '걷기 10분', done: false, type: 'basic' },
    ] },
    { number: '03', title: '생활 리듬', period: 'Day 15 - 21', quote: '“반복은 하루의 리듬을 바꾼다.”', bullets: ['스트레칭 10분 추가', '앞선 5개 유지', '흔들린 날도 마감'], addedRoutines: [
      { id: 'basic-stretch', name: '스트레칭 10분', done: false, type: 'basic' },
    ] },
    { number: '04', title: '기준 적응', period: 'Day 22 - 30', quote: '“흔들려도 기준으로 돌아와라.”', bullets: ['책 5페이지 추가', '누적 7개 루틴', 'BASIC 30일 완성'], addedRoutines: [
      { id: 'basic-reading', name: '책 5페이지', done: false, type: 'basic' },
    ] },
  ],
  STANDARD: [
    { number: '01', title: '몸 단련', period: 'Day 1 - 7', quote: '“대충 한 반복은 몸에 남지 않는다.”', bullets: ['푸쉬업 50개', '스쿼트 50개', '물 1L · 침대 정리'], addedRoutines: standardBaseRoutines },
    { number: '02', title: '유산소 추가', period: 'Day 8 - 14', quote: '“심장이 버티는 만큼 기준도 넓어진다.”', bullets: ['러닝 또는 걷기 2km 추가', '앞선 4개 유지', '누적 5개 루틴'], addedRoutines: [
      { id: 'standard-running', name: '러닝 또는 걷기 2km', done: false, type: 'basic' },
    ] },
    { number: '03', title: '절제 시작', period: 'Day 15 - 21', quote: '“욕망을 다루는 순간 기준이 선다.”', bullets: ['책 10페이지 추가', '포르노 금지 추가', '누적 7개 루틴'], addedRoutines: [
      { id: 'standard-reading', name: '책 10페이지', done: false, type: 'basic' },
      { id: 'standard-porn-free', name: '포르노 금지', done: false, type: 'basic' },
    ] },
    { number: '04', title: '기준 고정', period: 'Day 22 - 30', quote: '“피곤한 날에도 같은 기준으로 움직여라.”', bullets: ['쇼츠/릴스 30분 이하', '정리정돈 10분', '누적 9개 루틴'], addedRoutines: [
      { id: 'standard-short-form-limit', name: '쇼츠/릴스 30분 이하', done: false, type: 'basic' },
      { id: 'standard-tidy', name: '정리정돈 10분', done: false, type: 'basic' },
    ] },
  ],
  HARD: [
    { number: '01', title: '강도 상승', period: 'Day 1 - 7', quote: '“피하고 싶은 지점부터 통과해라.”', bullets: ['운동 60분', '책 20페이지', '물 1.5L'], addedRoutines: hardBaseRoutines },
    { number: '02', title: '체력 강화', period: 'Day 8 - 14', quote: '“압박 속에서도 순서를 지켜라.”', bullets: ['러닝 3km 추가', '앞선 3개 유지', '누적 4개 루틴'], addedRoutines: [
      { id: 'hard-running', name: '러닝 3km', done: false, type: 'basic' },
    ] },
    { number: '03', title: '딥워크 강화', period: 'Day 15 - 21', quote: '“기준은 편한 날이 아니라 어려운 날에 드러난다.”', bullets: ['딥워크 90분 추가', '포르노 금지 추가', '누적 6개 루틴'], addedRoutines: [
      { id: 'hard-deep-work', name: '딥워크 90분', done: false, type: 'basic' },
      { id: 'hard-porn-free', name: '포르노 금지', done: false, type: 'basic' },
    ] },
    { number: '04', title: '욕망 통제', period: 'Day 22 - 30', quote: '“마지막까지 같은 무게로 버텨라.”', bullets: ['정크푸드 금지', '쇼츠/릴스 금지', '명상 10분'], addedRoutines: [
      { id: 'hard-junk-food-free', name: '정크푸드 금지', done: false, type: 'basic' },
      { id: 'hard-short-form-free', name: '쇼츠/릴스 금지', done: false, type: 'basic' },
      { id: 'hard-meditation', name: '명상 10분', done: false, type: 'basic' },
    ] },
  ],
};

export function courseRoutinesFor(level: CourseLevel, day: number) {
  return courseStages[level]
    .slice(0, stageForDay(day))
    .flatMap((stage) => stage.addedRoutines.map((routine) => ({ ...routine })));
}

export function courseStageForDay(level: CourseLevel, day: number) {
  return courseStages[level][stageForDay(day) - 1];
}

export const dailyMottos: Record<CourseLevel, string[]> = {
  BASIC: [
    '일어나라. 아무것도 하지 않으면 아무 일도 일어나지 않는다.',
    '하기 싫어도 일단 해라. 기분은 늦게 따라온다.',
    '작게라도 끝내라. 작은 완료도 너를 바꾼다.',
    '흔들려도 멈추지 마라. 멈추는 순간 더 어려워진다.',
    '오늘 할 일을 내일의 너에게 떠넘기지 마라.',
    '무너졌다면 다시 잡아라. 설명은 필요 없다.',
    '일주일을 버틴 사람은 이미 어제와 다르다.',
    '몸은 말보다 행동을 먼저 믿는다.',
    '아무도 보지 않아도 해라. 네 몸은 알고 있다.',
    '느려도 괜찮다. 멈추지만 마라.',
    '하기 싫은 날의 완료가 진짜 완료다.',
    '흔들려도 이어가라. 흔들림은 핑계가 아니다.',
    '몸은 변명을 기억하지 않는다. 반복만 기억한다.',
    '완벽하지 않아도 된다. 끊기지 않으면 된다.',
    '기록해라. 기록하지 않은 하루는 쉽게 사라진다.',
    '오늘은 지나간다. 하지만 적은 것은 남는다.',
    '쌓인 기록이 너를 만든다.',
    '기분을 믿지 말고 기록을 봐라.',
    '도망친 자리도 적어라. 그래야 다시 찾을 수 있다.',
    '기록은 위로하지 않는다. 대신 정확하게 만든다.',
    '남는 건 의지가 아니다. 네가 남긴 흔적이다.',
    '기준은 무너지지 않는 게 아니다. 무너져도 돌아오는 것이다.',
    '흔들림도 기록해라. 기록하면 다룰 수 있다.',
    '다시 잡는 순간, 오늘은 아직 끝난 게 아니다.',
    '끝이 가까울수록 작은 타협이 비싸진다.',
    '절제는 큰 결심보다 작은 반복을 믿는다.',
    '여기까지 온 건 우연이 아니다. 오늘도 해라.',
    '거의 왔다는 말은 아직 끝나지 않았다는 말이다.',
    '마지막 전날에도 오늘 할 일은 오늘 끝내야 한다.',
    '너는 말이 아니라 삼십 개의 날로 증명했다.',
  ],
  STANDARD: [
    '오늘부터는 대충 끝내는 것으로 만족하지 마라.',
    '같은 일을 해도 더 정확히 해라. 차이는 거기서 난다.',
    '몸이 버거워질 때 한 번 더 밀어라. 그 한 번이 남는다.',
    '편한 반복은 너를 바꾸지 못한다. 조금 더 불편하게 해라.',
    '땀이 나기 전에는 아직 시작도 아니다.',
    '숨이 차오를 때 자세를 무너뜨리지 마라.',
    '쉬운 완료에 익숙해지지 마라. 기준을 올려라.',
    '몸이 먼저 포기하려 할 때 정신으로 한 걸음 더 가라.',
    '아무도 안 볼 때 흐트러지지 마라. 거기서 수준이 갈린다.',
    '느려져도 자세를 잃지 마라. 무너진 자세는 오래 간다.',
    '고통이 오면 도망가지 말고 호흡을 고쳐 잡아라.',
    '반복이 지겨워질 때 더 집중해라. 그때 실력이 붙는다.',
    '네 몸은 편한 만큼만 남고, 버틴 만큼만 바뀐다.',
    '어제와 같은 강도로는 어제와 같은 사람으로 남는다.',
    '기록은 끝난 뒤에 쓰는 게 아니다. 다음 훈련을 위해 남기는 것이다.',
    '흐릿하게 하지 마라. 대충 한 반복은 몸에 대충 남는다.',
    '네가 자주 무너지는 지점을 찾아라. 거기가 훈련할 곳이다.',
    '숫자가 낮으면 더 정확히 해라. 양보다 먼저 자세를 잡아라.',
    '회피한 동작을 다시 해라. 피한 곳이 약한 곳이다.',
    '좋은 기록보다 정확한 기록을 남겨라. 그래야 다음이 바뀐다.',
    '같은 실패가 반복되면 실수가 아니라 훈련 부족이다.',
    '복귀했으면 이전보다 더 단단하게 잡아라.',
    '감정이 올라와도 루틴의 순서를 흐트러뜨리지 마라.',
    '다시 시작할 때 가장 먼저 자세부터 바로잡아라.',
    '끝이 보일수록 동작 하나를 더 정확히 해라.',
    '절제는 참는 것이 아니라 흐트러지지 않는 자세다.',
    '피곤할수록 기준을 낮추지 마라. 피곤할 때 남는 게 진짜다.',
    '마지막까지 같은 무게로 버텨라. 가벼워지는 순간 무너진다.',
    '마무리는 힘이 아니라 집중력으로 한다.',
    '너는 버틴 게 아니라 더 높은 기준에 적응한 것이다.',
  ],
  HARD: [
    '네가 가장 피하고 싶은 일부터 해라. 거기가 시작점이다.',
    '감정에 허락받지 마라. 명령은 네가 내리는 것이다.',
    '하기 싫다는 말이 나오면, 해야 할 이유는 충분하다.',
    '약한 선택은 조용히 들어와 네 하루를 망친다.',
    '미루는 순간, 너는 네 기준을 직접 낮춘 것이다.',
    '넘어졌으면 바로 일어나라. 바닥과 협상하지 마라.',
    '첫 벽에서 타협하면 다음 벽은 더 높아진다.',
    '몸이 싫어하는 일을 끝낼 때 정신이 조용해진다.',
    '관객이 없는 곳에서 무너지면, 무대에서도 버티지 못한다.',
    '멈출 이유를 찾는 순간 이미 뒤로 밀리고 있다.',
    '고통에 집중하지 마라. 뛰고 있는 네 심장에 집중해라.',
    '마음이 시끄러운 날일수록 행동은 단순해야 한다.',
    '몸은 약속을 믿지 않는다. 네가 반복한 것만 믿는다.',
    '두 번째 벽은 더 큰 게 아니다. 네 핑계가 더 익숙해졌을 뿐이다.',
    '기록 앞에서 변명은 오래 버티지 못한다.',
    '쓰지 않은 실패는 다시 반복될 준비를 끝낸 실패다.',
    '기록은 네 약점을 숨겨주지 않는다. 드러내서 고치게 한다.',
    '보기 싫은 숫자가 바로 네가 고쳐야 할 곳이다.',
    '도망친 기록을 보는 사람은 같은 곳에서 두 번 속지 않는다.',
    '기록은 네 편이 아니다. 네가 한 만큼만 보여준다.',
    '네 약점을 모르면 너 자신과 싸울 수 없다.',
    '즉시 돌아오는 사람에게 실패는 오래 머물지 못한다.',
    '흔들린 것보다 늦게 돌아온 것이 더 위험하다.',
    '복귀를 미루는 건 실패와 협상하는 것이다.',
    '방심은 마지막 구간에서 가장 그럴듯한 얼굴로 온다.',
    '절제는 느낌이 아니다. 네가 세운 명령 체계다.',
    '끝까지 가는 사람은 마지막 핑계까지 태운다.',
    '완성 직전의 느슨함은 처음의 실패보다 더 비싸다.',
    '마지막 문 앞에서 쉬는 사람은 문을 넘지 못한다.',
    '너는 살아남은 게 아니다. 너 자신을 통과한 것이다.',
  ],
};

export function dailyMottoFor(level: CourseLevel, day: number) {
  return dailyMottos[level][Math.min(30, Math.max(1, day)) - 1];
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function displayDate(dateKey: string) {
  return dateKey.replace(/-/g, '.');
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dateKeyToDayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

export function dateForCourseDay(startedAt: string, day: number) {
  const date = new Date((dateKeyToDayNumber(startedAt) + day - 1) * 86400000);
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-');
}

export function stageForDay(day: number) {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export function createInitialState(): AppState {
  const today = new Date();
  const startedAt = toDateKey(today);
  const todayKey = getTodayKey();

  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    hasOnboarded: false,
    currentCourse: {
      level: 'BASIC',
      day: 1,
      startedAt,
      currentStage: 1,
      progress: 0,
      next: {
        standardLocked: true,
        hardLocked: true,
      },
    },
    today: {
      date: todayKey,
      isClosed: false,
      hasReflection: false,
      result: null,
    },
    courseRoutineTemplates: [],
    routinesByDate: {
      [todayKey]: courseRoutinesFor('BASIC', 1),
    },
    records: [],
    settings: {
      phraseTone: 'basic',
      notificationsEnabled: true,
      hapticsEnabled: true,
      language: 'system',
    },
  };
}
