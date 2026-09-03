# ALPHA v19 앱 구현 인계서 — 현재 프로토콜 기준

기준 프로토콜: `alpha_v19_protocol_v8_finish_compact.html`  
목표: 현재 HTML 프로토콜의 디자인/네비게이션/기능 흐름을 유지한 실제 앱 구현

---

## 0. Codex 작업 지시 요약

Codex에게는 아래처럼 지시하면 된다.

```text
ALPHA v19 모바일 앱을 Expo React Native로 구현해줘.
첨부한 alpha_v19_protocol_v8_finish_compact.html을 디자인 기준으로 삼고, 화면 구조/색상/여백/버튼/카드/하단 네비게이션/모달 UX가 최대한 동일하게 나오도록 구현해.

중요:
1. HTML 프로토콜을 단순 웹뷰로 감싸지 말고, React Native 컴포넌트로 재구현해.
2. 색상, 카드 radius, 여백, 버튼 스타일, 하단 탭, 마감 모달은 프로토콜과 동일하게 맞춰.
3. 이미지 자산은 /assets/visuals 에 분리해서 관리하고, 화면별로 교체 가능하게 만들어.
4. 하단 탭은 오늘 / 기록 / 과정 3개만 둬.
5. 설정은 하단 탭이 아니라 각 메인 화면 우측 상단 톱니바퀴에서 진입해.
6. 하루 마감 후에는 그날의 마감 상태가 잠기게 만들어. 하루 마감 버튼이 계속 눌리면 안 돼.
7. 하루 마감 후에는 하루 회고 작성으로 이어지고, 회고 저장 후 기록 화면에 반영되게 해.
8. MVP 기준으로 로컬 상태 저장은 AsyncStorage로 처리해.
```

---

## 1. 앱 한 줄 정의

ALPHA는 사용자가 매일 루틴을 수행하고, 하루를 마감하고, 짧은 회고를 남기며 30일 과정 안에서 자기통제와 루틴을 쌓는 앱이다.

일반 Todo 앱이 아니라 **30일 과정형 루틴 앱**이다.

---

## 2. 현재 프로토콜 버전 상태

현재 기준 버전은 다음 흐름을 포함한다.

- 온보딩
- 오늘 화면
- 기록 화면
- 과정 화면
- 30일 기록 상세
- 기록 모음
- 설정 화면
- 하루 마감 결과 모달
- 하루 회고 작성 모달
- 개인 루틴 추가 모달
- 날짜 상세 바텀시트

현재 프로토콜에서 최종 반영된 주요 결정:

- 하단 탭은 **오늘 / 기록 / 과정** 3개
- 설정은 하단 탭에 넣지 않음
- 하루 회고는 담백하게 입력창 하나만 사용
- 회고 화면에서 설명문/예시/선택지 제거
- 하루 마감 모달에서 캐릭터 제거
- 하루 마감 모달은 컴팩트 텍스트 중심 레이아웃
- 버튼 스타일은 v8 기준으로 유지
- 카드별 캐릭터/비주얼은 교체 가능한 구조로 가야 함

---

## 3. 정보 구조

```text
App
├─ Onboarding
├─ MainTabs
│  ├─ Today
│  ├─ Records
│  └─ Course
├─ Settings
├─ 30DayDetail
├─ RecordCollection
└─ Modals / Sheets
   ├─ FinishDayModal
   ├─ ReflectionModal
   ├─ AddRoutineModal
   └─ DayDetailSheet
```

---

## 4. 하단 네비게이션

하단 탭은 3개만 둔다.

```text
오늘 | 기록 | 과정
```

### 규칙

- 온보딩에서는 하단 탭 숨김
- 설정 화면에서는 하단 탭 숨김
- 30일 기록 상세에서는 하단 탭 숨김
- 기록 모음에서는 하단 탭 숨김
- 메인 3개 화면에서만 하단 탭 표시
- 설정은 각 메인 화면 우측 상단 톱니바퀴로 진입

---

## 5. 디자인 시스템

### 5.1 색상

```ts
const colors = {
  bg: '#030303',
  panel: '#0b0b0c',
  panel2: '#111113',
  line: 'rgba(255,255,255,0.14)',
  muted: '#8c8c90',
  soft: '#cfcfd3',
  white: '#f6f6f7',
  red: '#f11919',
  red2: '#9b0808',
  red3: '#4b0505',
};
```

### 5.2 전체 무드

- 블랙 베이스
- 강한 레드 포인트
- 과도한 3D 느낌은 피함
- 너무 게임 UI처럼 보이지 않게 함
- 카드와 모달은 둥글지만 가볍지 않게
- 텍스트는 짧고 단단하게

### 5.3 폰트 스타일

React Native에서는 우선 시스템 폰트로 구현한다.

```ts
fontFamily: Platform.select({
  ios: 'System',
  android: 'sans-serif',
})
```

한국어 기준으로는 Pretendard/Noto Sans KR를 붙이면 더 안정적이다. 앱 빌드 단계에서 폰트 파일을 추가할 수 있으면 Pretendard를 사용한다.

### 5.4 공통 사이즈

```ts
const radius = {
  card: 22,
  modal: 28,
  button: 16,
  tab: 23,
};

const spacing = {
  screenX: 16,
  sectionTop: 18,
  cardPadding: 16,
};
```

### 5.5 주요 컴포넌트 스타일

#### 화면 기본

- 배경: 거의 검정
- 상단 padding: SafeArea 포함
- 하단 탭 영역 때문에 메인 스크롤 paddingBottom 크게 확보

#### 카드

```ts
card: {
  backgroundColor: 'rgba(255,255,255,0.035)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 22,
  overflow: 'hidden',
}
```

#### Primary Button

v8 기준으로 유지한다.

- 붉은 그라데이션
- 너무 평면화하지 않음
- 너무 밝게 변경하지 않음

```ts
primaryButton: {
  height: 52,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#d31313',
}
```

React Native에서는 `expo-linear-gradient`를 사용해 아래처럼 구현한다.

```tsx
<LinearGradient
  colors={['#f51c1c', '#a70707']}
  style={styles.primaryButton}
>
  <Text style={styles.primaryButtonText}>하루 마감 ›</Text>
</LinearGradient>
```

---

## 6. 화면별 기획 및 구현 명세

## 6.1 온보딩 화면

### 목적

앱 첫 진입 화면. 사용자는 난이도를 고르지 않고 BASIC 과정이 자동 시작된다.

### 구성

```text
ALPHA
흔들려도,
이어가라.

설명 문장
메인 비주얼 카드
[시작하기]
처음 실행 시 BASIC 과정 Day 1/30이 자동 시작됩니다.
```

### 동작

- `시작하기` 누르면 Today 화면으로 이동
- 실제 앱에서는 첫 실행 여부를 AsyncStorage에 저장

```ts
hasOnboarded: boolean
```

---

## 6.2 오늘 화면

### 목적

사용자가 오늘 해야 할 루틴을 확인하고 체크한 뒤 하루를 마감하는 핵심 화면.

### 구성

```text
상단: 오늘 / Day 12 · BASIC 과정 / 설정 아이콘
오늘의 불씨 카드
오늘 요약
- 완료
- 연속
- 과정 달성률
오늘 루틴 리스트
개인 루틴 추가
하루 마감 버튼
```

### 오늘의 불씨 카드

- 상단 라벨: 오늘의 불씨
- 메인 문구:

```text
흔들려도
이어가라.
```

- 배경 비주얼은 `todayFire` 자산 사용
- 텍스트가 묻히지 않게 왼쪽에 어두운 오버레이 적용

### 루틴 리스트

기본 BASIC Day 12 예시:

```ts
routines: [
  { id: 'water', name: '물 500ml', done: true, type: 'basic' },
  { id: 'bed', name: '침대 정리', done: true, type: 'basic' },
  { id: 'pushup', name: '푸쉬업 30개', done: true, type: 'basic' },
  { id: 'squat', name: '스쿼트 30개', done: true, type: 'basic' },
  { id: 'walk', name: '걷기 10분', done: true, type: 'basic' },
  { id: 'record3', name: '오늘 한 일 3개 기록', done: false, type: 'basic' },
  { id: 'book', name: '책 5페이지', done: false, type: 'basic' },
]
```

### 루틴 체크 동작

- 마감 전: 체크/해제 가능
- 마감 후: 체크/해제 불가

```ts
if (today.isClosed) return;
```

### 하루 마감 버튼 상태

실제 앱에서는 반복 클릭되면 안 된다.

```text
마감 전:
[하루 마감 ›]

마감 후 / 회고 전:
[하루 회고 작성하기]

마감 후 / 회고 완료:
[마감 완료]
```

### 상태 모델

```ts
interface TodayState {
  date: string;
  isClosed: boolean;
  hasReflection: boolean;
  result: 'complete' | 'incomplete' | null;
  closedAt?: string;
}
```

---

## 6.3 하루 마감 모달

### 목적

오늘 수행 결과를 확인시키고, 회고 작성으로 연결한다.

### 현재 v8 디자인 방향

- 캐릭터 없음
- 큰 이미지 영역 없음
- 컴팩트한 텍스트 중심 모달
- 완료 상태에는 짧은 보상 문구를, 미완성 상태에는 결과만 표시

### 완료 상태

```text
완료.
오늘의 기준을 지켰다.

완료 루틴      7개
미완성 루틴    0개
연속 완료      12일

[하루 회고 작성하기]
[닫기]
```

### 미완성 상태

마감 전에 먼저 확인한다.

```text
아직 2개 남았다.
이대로 마감하면 오늘은 미완성으로 기록된다.

[돌아가기]
[미완성으로 마감]
```

사용자가 `미완성으로 마감`을 선택한 뒤에만 기록을 생성하고 결과를 표시한다.

```text
미완성.

완료 루틴      5개
미완성 루틴    2개
연속 완료      12일

[하루 회고 작성하기]
[닫기]
```

### 동작

`하루 마감` 클릭 시:

```ts
const result = allRoutinesDone ? 'complete' : 'incomplete';
if (result === 'incomplete') {
  openIncompleteConfirmation();
  return;
}

commitDayClose(result);
```

`미완성으로 마감` 클릭 시:

```ts
commitDayClose('incomplete');
```

중요: 모달을 닫아도 `isClosed`는 유지되어야 한다.

---

## 6.4 하루 회고 작성 모달

### 목적

마감 후 사용자가 직접 오늘 기록을 남긴다.

### 최종 결정

회고 화면은 담백하게 간다.

삭제한 것:

- `나는 오늘 어제보다 뜨거웠나?`
- `식었다 / 버텼다 / 뜨거웠다`
- `오늘 나를 흔든 것`
- `내일 하나만 더 뜨겁게 할 것`
- 설명문
- 예시 문구
- placeholder 예시

### 구성

```text
하루 회고
오늘의 기록
[입력창]
0 / 160
[취소] [저장]
```

### 입력 규칙

- 빈 값 저장 불가
- 최대 160자
- 저장 후 기록 화면에 반영
- 저장 후 `hasReflection = true`

```ts
interface Reflection {
  id: string;
  date: string;
  day: number;
  course: 'BASIC' | 'STANDARD' | 'HARD';
  status: 'complete' | 'incomplete';
  text: string;
  createdAt: string;
}
```

---

## 6.5 개인 루틴 추가 모달

### 구성

```text
개인 루틴 추가
루틴명
카테고리
- 몸
- 정신
- 절제
- 집중
- 생활
적용 범위
- 오늘만
- 이번 과정 동안
[취소] [추가]
```

### 동작

- 추가 시 오늘 루틴 리스트에 반영
- 개인 루틴은 BASIC/STANDARD/HARD 승급 판단에는 포함하지 않음
- MVP에서는 로컬 저장

```ts
interface Routine {
  id: string;
  name: string;
  done: boolean;
  category?: '몸' | '정신' | '절제' | '집중' | '생활';
  type: 'basic' | 'personal';
  scope?: 'today' | 'course';
}
```

---

## 6.6 기록 화면

### 목적

오늘의 루틴 흐름과 기록을 확인하는 화면.

### 구성

```text
상단: 기록 / 쌓인 기록이 너를 본다 / 설정 아이콘
연속 완료 카드
오늘 요약
30일 과정 요약 카드
30일 기록 보기 버튼
최근 기록
기록 모음 버튼
```

### 최근 기록 카드

```text
Day 12 · 완료
사용자가 작성한 회고 내용
```

### 기록 없음 처리

회고가 없으면:

```text
기록을 남기지 않았다.
```

---

## 6.7 30일 기록 상세

### 목적

현재 과정 30일 흐름을 시각적으로 확인.

### 구성

```text
30일 기록
BASIC 과정 / Day 12 / 30
진행률 링
30일 그리드
과정 단계 리스트
```

### 30일 그리드 상태

```ts
type DayStatus = 'done' | 'fail' | 'today' | 'future';
```

표현:

- 완료: 붉은 계열 채움
- 미완성: 어두운 원 + 붉은 테두리
- 오늘: 붉은 glow
- 예정: 회색/낮은 opacity

### 날짜 클릭

날짜 클릭 시 DayDetailSheet 표시.

---

## 6.8 날짜 상세 바텀시트

### 구성

```text
Day 12
날짜
상태
단계
루틴 완료
기본 루틴 리스트
하루 회고
```

### 하루 회고 표시

- 사용자가 작성한 회고가 있으면 표시
- 없으면 `기록을 남기지 않았다.`
- 미래 날짜면 `아직 기록이 없습니다.`

---

## 6.9 과정 화면

### 목적

현재 사용자가 어떤 30일 과정 안에 있는지 보여준다.

### 구성

```text
상단: 과정 / 현재 과정과 다음 단계 / 설정 아이콘
현재 과정 카드
30일 기록 보기 버튼
현재 단계 카드
과정 단계 리스트
다음 과정 상태
```

### 현재 단계 예시

```text
02 몸 깨우기
Day 8 - 14
“너 자신을 깨워라.”

이번 단계 신규 루틴
- 스쿼트 30개
- 걷기 10분
```

### 다음 과정 표시

```text
STANDARD 과정   잠김
HARD 과정       잠김
```

통과 조건 숫자는 UI에 노출하지 않는다.

---

## 6.10 설정 화면

### 구성

```text
설정
프로필 카드
문구 톤 설정
알림 설정
탭 피드백 설정
데이터 관리
앱 정보
로그아웃
```

### MVP 처리

- 설정 항목은 우선 Toast 또는 더미 화면으로 처리 가능
- 실제 앱에서는 설정 값을 AsyncStorage에 저장

---

## 7. 30일 과정 시스템

## 7.1 과정 흐름

```text
BASIC 30일
→ STANDARD 30일
→ HARD 30일
```

사용자가 직접 난이도를 고르지 않는다.

## 7.2 BASIC 단계

```text
01 기초 통제 — Day 1–7
- 물 500ml
- 침대 정리
- 푸쉬업 30개

02 몸 깨우기 — Day 8–14
추가:
- 스쿼트 30개
- 걷기 10분

03 기록 만들기 — Day 15–21
추가:
- 오늘 한 일 3개 기록

04 기준 적응 — Day 22–30
추가:
- 책 5페이지
```

## 7.3 STANDARD 단계

```text
01 몸 단련 — Day 1–7
- 푸쉬업 50개
- 스쿼트 50개
- 물 1L
- 침대 정리

02 유산소 추가 — Day 8–14
추가:
- 러닝 또는 걷기 2km

03 절제 시작 — Day 15–21
추가:
- 책 10페이지
- 포르노 금지

04 기준 고정 — Day 22–30
추가:
- 쇼츠/릴스 30분 이하
- 회고 3줄
```

## 7.4 HARD 단계

```text
01 강도 상승 — Day 1–7
- 운동 60분
- 책 20페이지
- 물 1.5L

02 체력 강화 — Day 8–14
추가:
- 러닝 3km

03 딥워크 강화 — Day 15–21
추가:
- 딥워크 90분
- 포르노 금지

04 욕망 통제 — Day 22–30
추가:
- 정크푸드 금지
- 쇼츠/릴스 금지
- 회고 5줄
```

---

## 8. 데이터 모델

## 8.1 AppState

```ts
interface AppState {
  hasOnboarded: boolean;
  currentCourse: CourseState;
  today: TodayState;
  routinesByDate: Record<string, Routine[]>;
  records: DayRecord[];
  personalRoutines: PersonalRoutine[];
  settings: SettingsState;
}
```

## 8.2 CourseState

```ts
type CourseLevel = 'BASIC' | 'STANDARD' | 'HARD';

interface CourseState {
  level: CourseLevel;
  day: number;
  startedAt: string;
  currentStage: number;
  progress: number;
  next: {
    standardLocked: boolean;
    hardLocked: boolean;
  };
}
```

## 8.3 DayRecord

```ts
interface DayRecord {
  id: string;
  date: string;
  course: CourseLevel;
  day: number;
  stage: number;
  status: 'complete' | 'incomplete';
  completedRoutineIds: string[];
  missedRoutineIds: string[];
  reflection?: string;
  closedAt: string;
}
```

## 8.4 SettingsState

```ts
interface SettingsState {
  phraseTone: 'basic' | 'hard' | 'cold';
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
}
```

---

## 9. 상태 흐름

## 9.1 하루 마감 전

```text
isClosed = false
hasReflection = false
result = null
```

가능한 행동:

- 루틴 체크/해제
- 개인 루틴 추가
- 하루 마감

## 9.2 하루 마감 직후

```text
isClosed = true
hasReflection = false
result = complete | incomplete
```

가능한 행동:

- 하루 회고 작성
- 기록 화면 이동

불가능한 행동:

- 루틴 체크/해제
- 하루 마감 재실행

## 9.3 하루 회고 저장 후

```text
isClosed = true
hasReflection = true
```

오늘 화면 버튼:

```text
마감 완료
```

버튼은 disabled.

---

## 10. Codex 구현 구조 추천

Expo React Native 기준.

```text
alpha-app/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ onboarding.tsx
│  ├─ tabs/
│  │  ├─ _layout.tsx
│  │  ├─ today.tsx
│  │  ├─ records.tsx
│  │  └─ course.tsx
│  ├─ settings.tsx
│  ├─ detail30.tsx
│  └─ record-collection.tsx
├─ src/
│  ├─ components/
│  │  ├─ AppShell.tsx
│  │  ├─ TopBar.tsx
│  │  ├─ BottomTabs.tsx
│  │  ├─ FireCard.tsx
│  │  ├─ SummaryGrid.tsx
│  │  ├─ RoutineRow.tsx
│  │  ├─ ProcessCard.tsx
│  │  ├─ StageCard.tsx
│  │  ├─ FinishDayModal.tsx
│  │  ├─ ReflectionModal.tsx
│  │  ├─ AddRoutineModal.tsx
│  │  └─ DayDetailSheet.tsx
│  ├─ constants/
│  │  ├─ colors.ts
│  │  ├─ typography.ts
│  │  ├─ spacing.ts
│  │  └─ routines.ts
│  ├─ store/
│  │  ├─ useAlphaStore.ts
│  │  └─ persistence.ts
│  ├─ types/
│  │  └─ alpha.ts
│  └─ assets/
│     └─ visuals.ts
├─ assets/
│  └─ visuals/
│     ├─ onboarding_hero.png
│     ├─ today_fire.png
│     ├─ records_header.png
│     ├─ course_stage.png
│     ├─ avatar_alpha.png
│     └─ ...
└─ package.json
```

---

## 11. 디자인을 똑같이 나오게 하는 방법

## 11.1 HTML을 디자인 기준으로 둔다

현재 HTML은 단순 설명서가 아니라 **시각 기준 파일**이다.

Codex에게 다음을 강하게 지시한다.

```text
alpha_v19_protocol_v8_finish_compact.html을 source of truth로 삼아라.
React Native 구현 결과는 이 HTML의 모바일 화면과 최대한 동일해야 한다.
컴포넌트 구조는 달라도 시각 결과는 유지해야 한다.
```

## 11.2 CSS 토큰을 그대로 옮긴다

HTML의 CSS에서 다음 값을 추출해서 React Native constants로 고정한다.

- colors
- radius
- card padding
- button height
- tab height
- section spacing
- font sizes
- border colors
- opacity

## 11.3 이미지 자산은 반드시 분리한다

HTML처럼 base64로 박지 않는다.

실제 앱에서는:

```ts
const visuals = {
  onboarding: require('../../assets/visuals/onboarding_hero.png'),
  todayFire: require('../../assets/visuals/today_fire.png'),
  recordsHeader: require('../../assets/visuals/records_header.png'),
  courseStage: require('../../assets/visuals/course_stage.png'),
  avatar: require('../../assets/visuals/avatar_alpha.png'),
};
```

이렇게 분리한다.

장점:

- 캐릭터 교체 쉬움
- 카드별 이미지 교체 가능
- 시즌 테마 가능
- HTML이 무거워지는 문제 없음

## 11.4 390 x 844 기준으로 먼저 맞춘다

현재 프로토콜은 iPhone 비율에 가깝다.

구현 시 우선 기준 화면을 다음으로 잡는다.

```text
width: 390
height: 844
```

그 다음 작은/큰 기기에 대응한다.

## 11.5 Safe Area 필수

실제 앱에서는 다음을 사용한다.

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

상단 노치/하단 홈바 때문에 프로토콜과 실제 기기에서 위치가 달라질 수 있다.
SafeArea를 적용한 뒤 프로토콜과 여백을 맞춘다.

## 11.6 하단 탭은 직접 구현 추천

React Navigation 기본 탭을 쓰면 프로토콜과 똑같이 맞추기 어렵다.

추천:

- Expo Router로 화면 이동
- 하단 탭 UI는 커스텀 컴포넌트로 직접 구현

```tsx
<BottomTabs active="today" onPress={...} />
```

## 11.7 모달은 기본 Alert 쓰지 말 것

기본 Alert/ActionSheet는 디자인이 달라진다.

직접 구현:

- `Modal`
- 반투명 overlay
- blur 또는 어두운 배경
- rounded modal card
- 직접 만든 버튼

## 11.8 스크린샷 비교로 검수한다

Codex 작업 후 다음 순서로 검수한다.

1. HTML 프로토콜 화면 캡처
2. Expo 앱 화면 캡처
3. 나란히 비교
4. 차이 체크

체크 항목:

- 카드 radius
- 버튼 색상
- 여백
- 하단 탭 위치
- 텍스트 크기
- 오늘의 불씨 카드 높이
- 루틴 row 높이
- 모달 크기

---

## 12. 구현 우선순위

## 1차 MVP

- 온보딩
- 오늘 화면
- 루틴 체크
- 하루 마감
- 하루 회고
- 기록 화면
- AsyncStorage 저장

## 2차

- 30일 기록 상세
- 날짜 상세 바텀시트
- 기록 모음
- 과정 화면

## 3차

- 개인 루틴 추가
- 설정
- 알림
- 문구 톤

---

## 13. 개발 시 주의사항

### 13.1 하루 마감 버튼

실제 앱에서는 반드시 상태가 잠겨야 한다.

```text
마감 전: 하루 마감
마감 후 / 회고 전: 하루 회고 작성하기
마감 후 / 회고 완료: 마감 완료
```

마감 완료 상태에서는 버튼 disabled.

단, 30일차 마감과 회고가 끝난 뒤 통과한 과정에서는 같은 위치의 버튼을 다음 행동 CTA로 전환한다.

```text
BASIC 통과: STANDARD 과정 시작
STANDARD 통과: HARD 과정 시작
HARD 통과: 친구에게 앱 공유하기
```

다음 과정은 사용자가 CTA를 눌렀을 때만 시작한다. HARD 완료 후 공유는 네이티브 공유창을 사용하되 선택 사항이며, 공유 성공을 과정 완료로 간주하지 않는다. Google Play 개발자 계정 이전은 완료됐지만 공개 상세 페이지가 아직 확인되지 않았으므로, 실제 다운로드 URL이 확정될 때까지 설정값을 비워둔다.

### 13.2 회고는 앱이 자동으로 쓰면 안 됨

사용자가 직접 작성해야 한다.

금지:

- 기본 회고 문장 미리 입력
- 랜덤 회고 자동 저장
- 예시 문구를 placeholder에 넣기

허용:

- 빈 placeholder
- 0/160 카운터
- 저장 시 기록 반영

### 13.3 실패를 모욕하지 말 것

미완성 확인 문구는 결과와 선택지를 정확히 알리는 톤만 유지한다.

좋은 예:

```text
아직 2개 남았다.
이대로 마감하면 오늘은 미완성으로 기록된다.
```

피할 것:

```text
넌 실패했다.
한심하다.
```

### 13.4 너무 게임처럼 만들지 말 것

금지:

- XP
- 레벨업 과다 연출
- 랭킹
- 보상 상자
- 과한 뱃지

현재 프로필에 `LEVEL 1`이 있긴 하지만, 실제 앱에서는 제거하거나 매우 약하게 다루는 것이 낫다.

---

## 14. Codex용 구체 작업 프롬프트

아래 프롬프트를 그대로 넣으면 된다.

```text
첨부된 alpha_v19_protocol_v8_finish_compact.html과 alpha_v19_codex_handoff.md를 기준으로 Expo React Native 앱을 구현해줘.

요구사항:
1. HTML을 웹뷰로 감싸지 말고 React Native 컴포넌트로 재구현.
2. 디자인은 HTML 프로토콜과 최대한 동일하게.
3. 화면은 온보딩, 오늘, 기록, 과정, 30일 기록 상세, 기록 모음, 설정으로 구성.
4. 하단 탭은 오늘/기록/과정 3개. 설정은 우측 상단 톱니바퀴.
5. 루틴 체크 가능. 단, 하루 마감 후에는 루틴 수정 불가.
6. 하루 마감 누르면 완료/미완성 결과 모달 표시.
7. 하루 마감 후에는 버튼 상태가 바뀌어야 함. 반복 마감 불가.
8. 하루 회고 작성은 입력창 하나만. 설명/예시/선택지 없음.
9. 회고 저장 후 기록 화면과 날짜 상세에 반영.
10. 상태는 우선 Zustand + AsyncStorage 또는 React Context + AsyncStorage로 저장.
11. 이미지 자산은 assets/visuals로 분리하고, 카드별로 교체 가능하게 구성.
12. TypeScript로 작성.
13. 주요 컴포넌트는 src/components로 분리.
14. 디자인 토큰은 src/constants로 분리.
15. 실행 방법까지 README에 작성.
```

---

## 15. 완료 기준

Codex 구현 결과가 아래 조건을 만족하면 1차 완료다.

- 앱 실행 시 온보딩 표시
- 시작하기 누르면 오늘 화면 이동
- 오늘/기록/과정 하단 탭 동작
- 설정 진입/뒤로가기 동작
- 루틴 체크 시 완료 수 변경
- 하루 마감 시 결과 모달 표시
- 하루 마감 후 버튼이 다시 마감되지 않음
- 하루 회고 작성 가능
- 회고 저장 후 기록 화면에 반영
- 30일 기록 페이지 진입 가능
- 날짜 클릭 시 상세 정보 표시
- 전체 톤이 HTML 프로토콜과 유사함

---

## 16. 현재 디자인에서 유지할 것 / 바꿔도 되는 것

### 반드시 유지

- 블랙/레드 톤
- 오늘/기록/과정 3탭
- 담백한 회고
- 컴팩트 하루 마감 모달
- 30일 과정 중심 구조
- 설정은 탭이 아닌 우측 상단

### 바꿔도 됨

- 캐릭터 이미지
- 카드별 이미지 자산
- 문구 세부 톤
- 알림 설정 세부 UI
- 프로필 LEVEL 표기

### 바꾸면 안 됨

- 하단 탭 개수
- 하루 회고에 선택지 추가
- 마감 후 루틴 수정 가능하게 두기
- 회고 자동 입력
- 게임식 XP/랭킹 추가
