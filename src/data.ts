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
    '일어나라.\n아무것도 하지 않으면\n아무 일도 일어나지 않는다.',
    '하기 싫어도 해라.\n감정은 사라지고\n결과는 남는다.',
    '생각은 집어치워라.\n몸부터 움직여라.',
    '오늘을 버린 자에게\n다른 내일은 오지 않는다.',
    '아침에 일어나기 싫다면 기억하라.\n너는 해야 할 일을 하기 위해\n태어났다.',
    '천 리를 가겠다는 말은 필요 없다.\n첫걸음을 내디뎌라.',
    '용감한 행동을 반복해야\n용감한 사람이 된다.',
    '미루는 동안에도\n삶은 흘러간다.',
    '자신의 주인은 자신이다.\n자신 말고 누가\n자신을 지키겠는가.',
    '행동보다 말이 앞서는 것을\n부끄러워하라.',
    '어제와 똑같이 살면서\n다른 미래를\n바라지 마라.',
    '사람은 잘못한 뒤에야 고치고\n막힌 뒤에야 다시 일어난다.',
    '빠른 말이 하루를 달려도\n느린 말은 열흘을 가면\n따라잡는다.',
    '세상의 큰일은\n언제나 작은 데서 시작된다.',
    '입을 닫고 나아가라.\n결과로 대답해라.',
    '좋은 사람이 무엇인지\n말하는 데 시간을 쓰지 마라.\n그런 사람이 되어라.',
    '군자는 원인을 자신에게서 찾고\n소인은 남에게서 찾는다.',
    '스스로를 일으키고\n스스로를 살펴라.',
    '삶이 짧은 것이 아니다.\n우리가 많은 시간을\n흘려보낼 뿐이다.',
    '네가 하는 행동은\n네가 하는 말보다\n훨씬 크게 들린다.',
    '쓰러져도 상관없다.\n기어서라도\n다시 나아가라.',
    '네게 달린 일에 힘을 써라.\n네 것이 아닌 걱정은\n내려놓아라.',
    '한 나라의 장수는 빼앗아도\n한 사람의 뜻은\n빼앗을 수 없다.',
    '거대한 바위는\n바람에 흔들리지 않는다.',
    '위대한 것은\n갑자기 생기지 않는다.',
    '오늘 견딘 고통이\n내일의 너를 만든다.',
    '삶은 근심과 시련 속에서 자라고\n안락함 속에서 무너진다.',
    '나를 무너뜨리지 못한 것은\n나를 더 강하게 만든다.',
    '자신을 이기는 것이\n모든 승리 가운데\n가장 위대한 승리다.',
    '끝까지 간 사람만이\n처음의 자신과\n작별할 수 있다.',
  ],
  STANDARD: [
    '천 리 길도\n발밑의 한 걸음에서 시작된다.',
    '행동할 권리는 네게 있다.\n결과에 마음을 빼앗기지 마라.',
    '길이 아무리 가까워도\n걷지 않으면 닿지 못한다.',
    '군자는 어려운 일을 먼저 하고\n얻는 것은 나중에 생각한다.',
    '남을 이기는 사람에게는 힘이 있다.\n자신을 이기는 사람은 강하다.',
    '새기다 멈추면 나무도 자르지 못한다.\n멈추지 않으면 쇠와 돌에도\n자국을 남긴다.',
    '불은 금을 시험하고\n시련은 강한 사람을 시험한다.',
    '스스로를 일으키고 절제하라.\n어떤 물결에도 무너지지 않을\n섬을 만들어라.',
    '한번 세운 원칙은\n법처럼 지켜라.',
    '용기는 두려움이 없는 상태가 아니다.\n옳은 일을 위해\n두려움을 견디는 것이다.',
    '견딜 수 있다면 견뎌라.\n불평은 네 짐을\n가볍게 만들지 못한다.',
    '군자는 어려움 속에서도 원칙을 지킨다.\n소인은 어려움 앞에서\n선을 넘는다.',
    '모든 행동을\n마지막 행동인 것처럼 행하라.',
    '시련은 정신을 단련한다.\n노동이 몸을 단련하는 것과 같다.',
    '뜻을 품은 사람은 굳세야 한다.\n짐은 무겁고\n길은 멀다.',
    '자신을 다스려라.\n뛰어난 기수가\n거친 말을 다루듯이.',
    '자신의 이성을 사용할\n용기를 가져라.',
    '시련은 사람을 만들지 않는다.\n그가 어떤 사람이었는지\n드러낼 뿐이다.',
    '자신의 생각을 믿어라.\n안에 있던 것은 결국\n밖으로 드러난다.',
    '끝을 처음처럼 조심하면\n실패할 일이 없다.',
    '부귀도 마음을 흐리지 못하고\n가난도 뜻을 바꾸지 못하며\n위세도 굽히지 못한다.',
    '남이 네 성품을 망치지 못했다면\n너는 아직\n패배하지 않았다.',
    '철학을 말로 설명하지 마라.\n살아서 보여라.',
    '말은 행동으로\n증명하라.',
    '성공과 실패에 흔들리지 마라.\n해야 할 행동에서\n물러나지 마라.',
    '이익 앞에서는 옳음을 생각하고\n위험 앞에서는\n목숨까지 내놓아라.',
    '자신은 자신의 주인이며\n자신은 자신의 피난처다.',
    '하루에도 몇 번씩\n자신을 넘어라.',
    '굳센 뜻이 없다면\n무거운 짐도 먼 길도\n감당할 수 없다.',
    '좋은 사람을 논하지 마라.\n이제 그런 사람이 되어라.',
  ],
  HARD: [
    '인간은 넘어야 할 존재다.\n너는 자신을 넘기 위해\n무엇을 했는가.',
    '스스로에게 명령하지 못하는 사람은\n결국 명령을 받게 된다.',
    '수많은 사람을 이기는 것보다\n자신을 이기는 것이\n더 큰 승리다.',
    '가장 무거운 짐을 원하라.\n강한 정신은 무거운 것을 통해\n자신의 힘을 증명한다.',
    '자신에게 진 것은\n모든 패배 중에서\n가장 치욕적인 패배다.',
    '큰일을 맡을 사람은 먼저\n마음이 괴롭고 몸이 고단한\n시간을 지나게 된다.',
    '삶은 시련 속에서 자라고\n안락함 속에서 무너진다.',
    '뜻을 세운 사람은\n목숨을 구하기 위해\n자신의 원칙을 버리지 않는다.',
    '삶도 소중하고 의로움도 소중하다.\n둘을 함께 지킬 수 없다면\n의로움을 지켜라.',
    '똑바로 서라.\n누군가 너를 세워주기를\n기다리지 마라.',
    '자신을 다스리지 못하는 사람은\n결코 자유롭지 않다.',
    '운명은 따르는 사람을 이끌고\n거부하는 사람을 끌고 간다.',
    '네가 누구인지 말하지 마라.\n네가 살아가는 방식으로\n보여라.',
    '고통을 바라보는 판단을 거두면\n고통이 휘두르던 힘도\n함께 사라진다.',
    '깨어 있는 삶은 죽지 않는다.\n무기력한 삶은 이미\n죽은 것과 같다.',
    '자신을 끌어올려라.\n자신을 스스로\n무너뜨리지 마라.',
    '피할 수 없는 것을\n견디는 데 그치지 마라.\n그것을 사랑하라.',
    '겁이 없는 척하는 사람은 물러난다.\n용기 있는 사람은 결정적인 순간에\n앞으로 나선다.',
    '이익을 보면 옳음을 생각하고\n위험 앞에서는\n책임을 피하지 마라.',
    '앞을 가로막던 것이\n오히려 길을 열고\n너를 전진시킨다.',
    '시련이 닥치면 기억하라.\n지금이 네가 어떤 사람인지\n보여줄 순간이다.',
    '진실을 말하라.\n목표를 정면으로 겨눠라.',
    '오늘 하는 모든 일을\n마지막 행동인 것처럼\n단단하게 끝내라.',
    '때로는 살아남는 것 자체가\n가장 치열한\n용기다.',
    '강한 정신은 편안함을 구하지 않는다.\n무겁고 어려운 것을 통해\n자신의 힘을 확인한다.',
    '자신을 돌아보아 옳다면\n천만 명이 막아서도\n나아가라.',
    '어진 사람은 근심하지 않고\n지혜로운 사람은 흔들리지 않으며\n용기 있는 사람은 두려워하지 않는다.',
    '올바름을 쌓아라.\n누구도 꺾지 못할 기운은\n그렇게 만들어진다.',
    '스스로에게 명령하라.\n그렇지 않으면 평생\n남의 명령을 받게 된다.',
    '인간의 위대함은 완성에 있지 않다.\n자신을 끝없이\n넘어서는 데 있다.',
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
