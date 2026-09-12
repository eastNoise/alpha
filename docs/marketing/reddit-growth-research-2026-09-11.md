# ALPHA Reddit 성장 리서치와 30일 실행안

- 조사 기준일: 2026-09-11 (KST)
- 대상: 영어권 Reddit 유기적 홍보, iOS·Android 유료 앱
- 제품 기준: 현재 저장소, 미국 App Store 공개 정보, ALPHA 공식 웹사이트
- 문서 상태: `r/ShowYourApp` 첫 게시 공개·로그아웃 노출 검증 완료

## 실행 현황 — 2026-09-12 KST

| 항목 | 상태 | 근거·다음 행동 |
| --- | --- | --- |
| 공식 웹의 오래된 버전 표기 | 완료 | 버전 숫자를 제거하고 App Store·Google Play 공개 상태로 배포. `east-noise-web` commit `2773a38` |
| 30일/90일 문서 충돌 | 완료 | `docs/localization/global-store-copy.md`를 현재 3×30일·90일 계약과 JSON source of truth 기준으로 갱신 |
| Reddit 이미지·영상 | 완료 | `release/marketing/reddit/2026-09-11/`에 4:5 이미지 5장과 6.23초 영상·manifest·게시 초안 생성 |
| Android Reddit UTM | 준비 완료 | 커뮤니티별 `utm_source=reddit`, `utm_campaign` 링크를 게시 초안에 반영 |
| App Store 캠페인 링크 | 대기 | 현재 연결 가능한 로그인 브라우저가 없어 App Store Connect의 Campaigns에서 생성 필요 |
| Reddit 계정 자격 | 확인 완료 | `u/Impressive_Shock_785`가 Google `eastnoise26`에 연결됨. 이메일 인증 완료. 공개 이름은 `East Noise Apps`, 제품·팀 관계를 밝힌 프로필 설명 적용. 2026-09-11 생성, 게시물 카르마 1·댓글 카르마 0이라 `r/ProductivityApps`의 로컬 카르마 10 요건은 미충족. `r/ShowYourApp` 가입 완료 |
| 창업자 Day 1 기록 | 사용자 실행 필요 | 실제 앱에서 BASIC을 시작하고 성공·실패 화면과 한 줄 회고를 보존 |
| 공개 게시 | 완료 | 2026-09-12 `r/ShowYourApp`에 `Feedback` 플레어로 [첫 게시물](https://www.reddit.com/r/ShowYourApp/comments/1we57jh/we_built_a_90day_discipline_app_that_doesnt_let/) 공개. 로그아웃 브라우저에서 제목·본문·양대 스토어 링크를 확인했고 API는 `removed_by_category: null`, `is_robot_indexable: true`를 반환. 초기 기준선은 점수 1·댓글 0이며 1h·6h·24h 성과는 별도 측정 |

## 1. 결론부터

ALPHA가 Reddit에서 살아남을 가능성이 가장 높은 설명은 **“alpha male 앱”도, “또 하나의 habit tracker”도 아닌, 사용자가 직접 시스템을 설계할 필요가 없는 고정형 90일 자기통제 코스**다.

권장 핵심 문장은 다음과 같다.

> **ALPHA is a fixed 90-day discipline program for people who don't want to design another productivity system.**

브랜드 오해를 막는 보조 문장은 다음이 좋다.

> **ALPHA isn't about dominating other people. It's about keeping promises to yourself.**

첫 홍보의 목표는 대형 바이럴이 아니다. 현재 ALPHA는 미국 App Store 기준 평점·리뷰가 0개이고, 창업자나 실제 사용자의 30일·90일 완료 기록도 공개되어 있지 않다. 따라서 지금 가장 큰 병목은 노출이 아니라 **신뢰할 수 있는 증거의 부재**다. 첫 30일은 다음 네 가지를 동시에 만드는 기간으로 봐야 한다.

1. 허용된 커뮤니티에서 계정 신뢰도와 규칙상 게시 자격을 확보한다.
2. ALPHA를 실제로 쓰는 창업자의 Day 1→7→14→30 기록을 만든다.
3. 서로 다른 훅과 실제 앱 화면이 어떤 반응을 만드는지 소규모로 검증한다.
4. Reddit 반응과 스토어 유입·구매를 연결해 “업보트”가 아니라 매출 가능성을 본다.

가짜 사용자 후기, 다른 계정으로 “우연히 발견했는데 인생이 바뀌었다”는 글, 지인 동원 업보트, 반복 복붙, 무차별 DM은 쓰지 않는다. 이는 단순한 도덕 문제가 아니다. Reddit의 스팸·조작 탐지 대상이고, 미국에서는 가짜 후기와 관계를 숨긴 내부자 후기가 FTC 규칙의 대상이 될 수 있다.[^1][^2][^35] `r/androidapps` 운영진도 “좋은 앱을 우연히 발견했다”는 형식의 위장 홍보를 명시적으로 문제 삼았다.[^3]

## 2. 조사 방법과 판단 기준

이번 조사는 다음을 교차 확인했다.

- ALPHA 저장소의 현재 코스·루틴·스토어 메타데이터·스크린샷
- 미국 App Store의 공개 가격, 데이터 수집 고지, 평점 상태
- ALPHA 공식 소개·지원·개인정보처리방침·이용약관 페이지
- Reddit 공식 스팸 정책, 비즈니스 크리에이티브 연구, 게시물 인사이트
- `r/iOSApps`, `r/ProductivityApps`, `r/droidappshowcase`, `r/SideProject`, `r/ShowYourApp`, `r/getdisciplined`, `r/selfimprovement`, `r/androidapps`의 현재 규칙과 운영진 공지
- 습관·생산성 앱의 흥한 게시물과 묻힌 게시물 표본
- Atoms, Fabulous, Habitify, 75 HARD와 최근 90일 자기통제 앱들의 포지셔닝
- 습관 형성 기간과 자기 모니터링에 관한 원 논문·체계적 문헌

게시물의 업보트 수는 조사 시점 스냅샷이며, 제목 하나가 성과를 만들었다는 인과 증거가 아니다. 계정 이력, 게시 시점, 초반 댓글, 외부 유입 등 관찰할 수 없는 변수가 있다. 따라서 사례는 **복제할 공식**이 아니라 다음 실험의 가설로만 쓴다.

## 3. 지금 ALPHA가 실제로 파는 것

### 3.1 확인된 제품 계약

현재 제품과 스토어 메타데이터상 ALPHA는 다음 구조다.[^33][^34][^36]

- BASIC, STANDARD, HARD의 3개 과정
- 과정마다 30일, 핵심 여정 총 90일
- 매일 다른 짧은 문장과 정해진 루틴
- 단계가 오를수록 운동, 독서, 집중, 디지털 절제 등의 강도가 높아짐
- 루틴을 체크하고 하루를 직접 마감함
- 완료한 날과 실패한 날을 모두 기록함
- 기준을 통과하면 다음 과정으로 가고, 미달하면 다시 도전 가능
- 계정이 없고 기록은 기기에 저장됨
- 미국 App Store 가격은 일회성 $2.99이며 현재 공개 평점·리뷰는 0개

이 구조는 커스텀 습관 생성이 핵심인 일반 트래커와 다르다. ALPHA의 실질적 가치는 “체크박스”가 아니라 **무엇을 할지 정해 주는 순서, 난이도 상승, 하루 마감, 실패도 지우지 않는 기록**이다.

### 3.2 팔아야 할 장점과 숨기면 안 되는 단점

| 항목 | 사용자에게 주는 가치 | 정직하게 밝혀야 할 트레이드오프 |
|---|---|---|
| 고정 코스 | 매일 습관을 설계하는 선택 피로를 줄임 | 자유로운 커스텀을 원하는 사람에게는 맞지 않음 |
| 30일 × 3단계 | 시작점과 다음 단계가 명확함 | 90일 자체가 변화의 과학적 보장은 아님 |
| 실패 기록 | 연속 성공만 미화하지 않고 실제 수행을 남김 | 실패 표시가 일부 사용자에게 압박으로 느껴질 수 있음 |
| 로컬 저장 | 가입·클라우드 계정·행동 추적 없이 바로 사용 | 기기 삭제·손상 시 별도 클라우드 복구가 없음 |
| $2.99 일회성 | 구독 피로 없이 가격을 예측할 수 있음 | 무료 트래커보다 첫 설치 장벽이 높음 |
| 강한 시각 언어 | 앱의 태도와 구분이 선명함 | 과장된 남성성·분노·수치심으로 보이면 반감이 큼 |

“모두에게 맞는 앱”처럼 말하지 않는 것이 오히려 신뢰를 만든다. 추천 문구는 다음이다.

> **It is intentionally rigid. If you want a flexible habit tracker, this probably isn't for you.**

### 3.3 90일 주장의 안전한 범위

습관 형성 연구에서 널리 인용되는 Lally 등의 연구는 참가자가 선택한 행동을 일정한 맥락에서 반복했을 때 자동성에 가까워지는 시간이 사람과 행동에 따라 18일에서 254일까지 크게 달랐고, 모델상 평균은 66일이었다. 한 번의 누락이 전체 형성을 망치지도 않았다.[^4] 자기 모니터링과 행동 목표 설정이 여러 행동변화 개입에서 흔하고 유효한 구성요소라는 문헌도 있다.[^5][^6]

따라서 다음 표현은 가능하다.

- “A structured 90-day practice”
- “Three 30-day stages that progressively raise the standard”
- “A framework for repeated daily action”

다음 표현은 실제 ALPHA 임상·행동 결과가 없는 한 쓰지 않는다.

- “90 days scientifically rewires your brain”
- “Guaranteed to change your life”
- “Clinically proven” 또는 “science-proven”
- “You will become disciplined forever”

90일은 **제품의 커리큘럼 길이**이지 보장된 인간 변화의 마법 숫자가 아니다.

## 4. 경쟁 시장에서 차지할 자리

| 제품 | 주된 약속 | 구조 | ALPHA가 피해야 할 정면승부 |
|---|---|---|---|
| Atoms | 정체성 기반의 작은 습관과 코칭 | 유연한 습관, 일일 레슨, 리마인더 | “매일 좋은 문장”만으로 차별화하기 |
| Fabulous | 전반적 웰니스와 코칭 | 아침·저녁 루틴, 자기관리, 커뮤니티 | 부드러운 올인원 웰니스 앱처럼 보이기 |
| Habitify | 여러 기기에서 쓰는 정교한 습관 관리 | 커스텀 습관, 동기화, 분석, 연동 | 기능 수와 커스터마이징으로 경쟁하기 |
| 75 HARD | 이미 알려진 강한 75일 프로그램 | 엄격한 규칙, 공식 브랜드·커뮤니티 | 이름·규칙·성과를 모방하거나 혼동시키기 |
| Protocol 90 | AI가 만드는 90일 변화·그룹 책임 | 개인화, AI 코치, 커뮤니티, 다기능 | 근거 없는 과장·전쟁 은유·기능 백화점 |
| Discipline App | 엄격한 90일 그리드와 사회적 책임 | 커스텀 규칙, 친구, 분석, 클라우드 | “가장 잔혹한 앱” 같은 강도 경쟁 |
| ALPHA | 선택 없이 따라가는 3단계 자기통제 코스 | 고정 루틴, 일일 마감, 실패 기록, 로컬 | **단순성·프라이버시·처방된 경로를 버리는 것** |

Atoms는 정체성 기반의 작은 습관과 유연성을, Fabulous는 웰니스 코칭을, Habitify는 다기기 습관 관리와 분석을 앞세운다.[^7][^8][^9] 75 HARD는 이미 프로그램 자체의 인지도를 보유한다.[^10] 최근 Google Play에는 ALPHA와 매우 가까운 “strict 90-day” 앱, AI·분대·전투 언어를 쓰는 앱, 남성 전용 Alpha+ 앱도 존재한다.[^11][^12][^13] 즉, 검정·빨강과 “NO EXCUSES”만으로는 이미 붐비는 영역이다.

ALPHA의 방어 가능한 이야기는 다음 조합이다.

> **Prescribed path + progressive stages + honest day closeout + local-only + one-time price**

기능이 적은 것을 숨기지 말고, “설정하고 분석하는 데 시간을 쓰지 않는 앱”으로 바꿔 말한다.

## 5. Reddit의 실제 분위기

### 5.1 Reddit 사용자가 홍보 자체를 싫어하는 것은 아니다

문제는 제품 링크가 아니라, 커뮤니티를 광고 슬롯으로만 쓰는 태도다. `r/SideProject`에는 링크만 던지고 사라지는 홍보 계정에 대한 반발 게시물이 높은 반응을 얻었다.[^14] Reddit 공식 스팸 정책도 반복 게시, 대량 노출 목적의 콘텐츠, 원치 않는 DM과 자동화를 문제로 본다.[^1]

반대로 다음은 받아들여질 여지가 있다.

- 누가 만들었는지 즉시 밝힘
- 왜 만들었는지 구체적인 개인 문제를 말함
- 가격·구독·데이터 수집을 숨기지 않음
- 경쟁 제품을 뭉뚱그려 비난하지 않고 차이를 설명함
- 실제 화면과 실제 숫자를 보여 줌
- 커뮤니티 규칙을 지키고 댓글에 남아 답함
- 홍보 글 이외에도 관련 문제에 유용한 답변을 해 온 계정

### 5.2 “alpha male”은 이름보다 설명에서 더 위험하다

영어권 자기계발 커뮤니티에서는 “alpha male”을 Tate식 과장, 지위 경쟁, 여성·다른 남성을 지배하려는 태도와 연결해 거부하는 반응이 적지 않다. Reddit에는 남성 자기계발 커뮤니티를 찾으면서도 “alpha male bs”는 피하고 싶다는 수요가 직접 나타난다.[^15] 늑대 무리의 “alpha” 대중서사도 야생 무리가 대체로 가족 단위라는 Mech의 설명과 맞지 않는다.[^16]

브랜드명 ALPHA를 버릴 필요는 없다. 다만 설명을 다음처럼 고정해야 한다.

- 남보다 위에 서기 → 자기 약속을 지키기
- 남성성 증명 → 일상의 자기통제
- 수치심과 처벌 → 결과를 숨기지 않고 다시 시작하기
- 극적인 변신 → 오늘 할 일을 끝내는 반복

Reddit 제목에는 `alpha male`, `high-value man`, `dominate`, `sigma`, `beast mode`를 쓰지 않는다. 앱의 남성적 미감은 남기되, 메시지는 **self-command**와 **honest record**로 번역한다.

## 6. 커뮤니티별 진입 지도

회원 수는 조사 당일 표시된 대략적인 값이므로 게시 전 다시 확인한다. 규칙은 각 커뮤니티의 현재 페이지와 운영진 공지를 기준으로 요약했다.[^3][^17][^18][^37][^38][^39][^40][^41]

| 커뮤니티 | 당시 규모·분위기 | 현재 핵심 규칙 | ALPHA 역할 | 우선순위 |
|---|---|---|---|---|
| `r/ProductivityApps` | 약 9.4만. 앱 홍보가 많아 포화됐지만 구매 의도와 주제가 맞음 | Self Promotion 허용, 월 1회, 커뮤니티 카르마 10 필요, 저품질 피드백 요청·테스터 모집 금지 | 첫 제품·메시지 검증 | 1 |
| `r/iOSApps` | 약 5.3만. 개발자 홍보의 투명성을 강하게 요구 | 로컬 카르마 10, 개발자당 30일 1회, 직접 App Store 링크, Trust 또는 Transparency, ABC와 관계 공개 | iOS 구매 전환 | 1 |
| `r/droidappshowcase` | 약 8.9천. Android 앱 데모 전용 | 계정 24시간, 이메일 인증, 합산 카르마 2+, 계정당 주 1회, 직접 스토어 링크 | Android 저위험 공개 | 2 |
| `r/ShowYourApp` | 약 2.9천. 링크와 데모에 우호적이나 도달은 작음 | 맥락 있는 소개와 상호 참여 | 크리에이티브·설명 리허설 | 2 |
| `r/SideProject` | 빌더·창업자 중심. 이야기와 실제 숫자에 반응 | 노골적 링크 드롭에 피로가 큼 | 실제 데이터가 생긴 뒤 빌드 스토리 | 3 |
| `r/getdisciplined` | 약 200만. 실천·책임·후속 기록 중시 | 위장 자기홍보는 영구 밴 가능, 과장·quick fix 거부 | 홍보 금지. 문제·언어 리서치만 | 듣기 전용 |
| `r/selfimprovement` | 대형 자기계발 커뮤니티 | 자기홍보, 프로필 유도, 제품 검색 유도도 강하게 금지 | 홍보 금지. 문제 리서치만 | 듣기 전용 |
| `r/androidapps` | Android 앱 이용자 대형 커뮤니티 | 자기홍보·테스터·피드백 글 사실상 금지. 정확히 찾는 질문에 공개된 개발자 답변 정도만 예외 | 글 게시 금지. 정말 정확한 요청에만 공개 댓글 | 제한적 |

`r/iOSApps`의 2026년 현재 Transparency 경로는 실제 신원·연락처·포트폴리오 또는 LinkedIn과, 웹사이트의 Privacy Policy·Terms를 요구한다. ALPHA 웹사이트에는 사업자번호, 지원 이메일, 개인정보처리방침, 이용약관이 있고 각 페이지는 현재 HTTP 200으로 열렸다. East Noise 영문 홈의 Studio 영역에는 공동창업자 `Soogeun Cho`, `Yuseok Lee`도 공개돼 있다. 따라서 게시자의 실제 이름을 첫 문단에서 밝히고 영문 홈과 법적 페이지를 직접 연결하면 현재 표면으로 Transparency 경로를 시도할 수 있다.[^17][^18]

조사 중 발견한 공식 ALPHA 소개 페이지의 `App Store v1.0.3 · Google Play v1.0.4` 표기는 2026-09-11에 버전 숫자 없는 공개 상태 문구로 교체하고 프로덕션 배포까지 완료했다. 향후에도 변동이 잦은 버전 숫자를 마케팅 웹에 중복 하드코딩하지 않는다.

`r/iOSApps`의 ABC는 다음을 한 글 안에서 답하라는 뜻이다.[^17]

- **Answer the problem:** 어떤 구체적 문제를 해결하는가
- **Better than named alternatives:** 일반 트래커와 무엇이 다르고 어떤 사람에게 나은가
- **Cost:** 선결제·구독·IAP를 포함해 얼마인가

평점 20개 이상의 Trust 기준은 지금 충족하지 못하므로, ALPHA는 Transparency 경로가 현실적이다.

## 7. 반응을 얻은 글과 묻힌 글의 차이

### 7.1 반응이 상대적으로 좋았던 패턴

`r/SideProject`에서 습관 앱 Habstick 소개는 “Flutter로 혼자 만들었고, 다운로드 약 6.5만, 월 수익 약 $200”이라는 구체적이고 다소 초라할 수도 있는 실제 숫자를 제목부터 공개해 약 75점의 반응을 얻었다.[^19] 다른 습관 앱 글은 “4주, 500 installs, $350”처럼 시점과 수치를 명확히 보여 주고 이후 사용자 피드백으로 무엇을 바꿨는지 공유해 약 241점의 반응을 얻었다.[^20]

`r/iOSApps`에서는 다음 요소가 있는 글이 상대적으로 좋은 반응을 받았다.

- `local-first`, `no login`, `no ads`, `no subscription`처럼 구매 전 불안을 바로 제거함
- 한 앱이 해결하는 단일 작업을 제목에서 설명함
- 개발자가 직접 만들었다고 공개함
- 추상적 “삶의 변화”보다 데이터가 어디에 머무는지, 돈을 어떻게 받는지 설명함

예를 들어 Payback은 “local-first iPhone money tracker”와 로그인·광고·구독 부재를 분명히 했고 약 22점, Milestones는 개인적 필요와 2년의 제작 기간, iCloud·프라이버시를 구체적으로 적어 약 41점의 반응을 얻었다.[^21][^22]

`r/ProductivityApps`에서는 “내 인생을 바꾼 생산성 앱과 그 이유”처럼 실제 행동 변화의 원인을 묻는 글, 여러 앱을 써 보고 비교한 티어 리스트가 각각 약 94점, 136점 수준의 반응을 얻었다.[^23][^24] 이 형식은 비교·학습 가치를 먼저 제공하기 때문이다. 다만 ALPHA가 자사 계정으로 “모든 앱을 비교해 보니 우리 것이 최고”라고 쓰면 다시 위장 홍보가 된다. 향후 독립 리뷰어에게 아무 대가나 긍정 조건 없이 정직한 비교를 요청하는 방식만 허용한다.

### 7.2 묻히거나 반감을 산 패턴

`r/SideProject`의 “내 Hello World 앱, habit tracker를 만들었다”는 기능 나열형 글은 조사 시점 약 1점에 머물렀다.[^25] 같은 커뮤니티에서 습관 트래커는 개발자의 흔한 연습작이고 전환 비용이 낮은 상품이라는 지적이 반복된다.[^26] `r/iOSApps`의 습관 트래커 게시물에는 “좋아, 또 하나의 habit tracker”라는 냉소도 보였다.[^27]

묻힐 가능성이 큰 ALPHA 글은 다음과 같다.

- “I made an amazing habit tracker. Please support me.”
- 기능을 10개 이상 나열하고, 누구에게 필요한지는 말하지 않는 글
- “This app changed my life”라고 쓰지만 기간·행동·전후 기록이 없는 글
- 여러 서브레딧에 같은 제목·본문·이미지를 같은 날 복붙하는 글
- 광택이 강한 광고 이미지뿐이고 실제 화면이나 가격이 없는 글
- “우연히 발견한 앱”처럼 관계를 숨기는 글
- 링크만 올리고 질문·비판에 답하지 않는 글

ALPHA의 첫 제목은 `habit tracker`를 주명사로 쓰지 말아야 한다. 비교를 위해 한 번 언급하되, 카테고리는 **fixed program**, **90-day course**, **prescribed path**로 잡는다.

## 8. 메시지 체계

### 8.1 한 문장 포지셔닝

> **A fixed 90-day discipline program: BASIC, STANDARD, HARD. No account, no subscription, no habit-system setup.**

### 8.2 메시지 우선순위

1. **선택 피로:** “습관 시스템을 또 설계하는 일이 미루기의 한 형태가 됐다.”
2. **작동 방식:** “30일씩 세 단계, 정해진 루틴을 따라가며 강도가 올라간다.”
3. **정직한 기록:** “실패한 날도 기록에서 사라지지 않는다.”
4. **프라이버시와 가격:** “계정 없음, 기기 저장, $2.99 한 번.”
5. **대상 제한:** “유연한 트래커를 원한다면 맞지 않는다.”
6. **브랜드 재정의:** “ALPHA는 타인을 지배하는 뜻이 아니라 자신과의 약속을 지키는 뜻이다.”

### 8.3 제목 훅 후보

광고처럼 보이지 않으면서 제품 차이를 드러내는 순서다.

1. `I made a fixed 90-day discipline program so the user does not have to design another habit system`
2. `Would you rather choose your habits—or follow a fixed 90-day program?`
3. `I built a $2.99, local-only discipline app with no account or subscription`
4. `Missed days don't disappear in the 90-day program I built`
5. `BASIC → STANDARD → HARD: a prescribed 90-day path instead of another flexible tracker`

“We built X because we were tired of Y” 형식도 이미 흔하다. 반드시 이어지는 본문에서 실제 설계 선택, 가격, 한계, 화면을 보여 줘야 한다.

### 8.4 금지하거나 증거가 생길 때까지 보류할 문구

- `This changed my life` — 실제 30일·90일 전후 기록 없이는 사용 금지
- `Thousands transformed` — 검증된 숫자 없이는 사용 금지
- `The #1 discipline app` — 객관적 근거 없이는 사용 금지
- `Science-proven 90-day transformation` — 제품 연구가 없으므로 사용 금지
- `Become an alpha male` — 브랜드 오해와 커뮤니티 반감이 큼
- `No excuses`만 반복 — 사용자의 문제를 이해하지 못하는 범용 문구
- 실제 사용자처럼 꾸민 창업자·마케터 후기 — 관계 미공개와 가짜 후기 위험

## 9. 이미지와 영상은 이렇게 만든다

### 9.1 Reddit용 첫 크리에이티브 원칙

Reddit이 약 15만 개 인피드 광고를 분석한 2026년 자료에서는 4:5 이미지·영상이 1:1이나 16:9보다 평균 전환 영향이 높았고, 6초 미만 영상이 가장 높은 평균 전환 영향을 보였다. 대화체, 명확한 제품·가격·구매 방법, 실제 사용 맥락도 권장한다.[^28] 이는 **유료 광고 데이터**이므로 유기적 게시물에서 같은 결과를 보장하지는 않는다. 그래도 모바일 피드 점유율과 빠른 이해를 위한 첫 형식 가설로 쓸 수 있다.

첫 테스트 규격은 다음으로 통일한다.

- 정적 이미지: 1200×1500, 4:5, PNG 또는 고품질 JPG
- 영상: 1080×1350 또는 1080×1920 원본을 4:5 안전영역으로 구성, 5~8초
- 무음이어도 이해 가능하게 함
- 로고는 작게 쓰되 첫 화면을 가리지 않음
- 화면 한 장당 주장 하나, 본문 텍스트는 12단어 안팎
- stock “alpha male”, 고급차, 시가, 근육질 남성 몽타주 사용 금지
- 가짜 전후 사진, 가짜 알림 수, 가짜 streak 사용 금지

### 9.2 첫 이미지 세트: 제품을 바로 보여 주는 4장

기존 스토어용 시네마틱 8장은 브랜드 무드를 만드는 데는 좋지만, Reddit에서는 첫 세 장이 실제 앱 구조를 늦게 보여 준다. 유기적 게시물에서는 실제 화면을 1장째부터 쓴다.

| 장 | 사용할 실제 소스 | 화면 문구 | 보여 줘야 할 것 |
|---|---|---|---|
| 1 | `release/screenshots/raw/en-US/02-today.png` | `A 90-DAY PROGRAM. NOT ANOTHER HABIT SYSTEM.` | Today 화면과 오늘 루틴 |
| 2 | `release/screenshots/raw/en-US/03-course.png` | `30 DAYS × 3 — BASIC → STANDARD → HARD` | 코스 진행과 단계 상승 |
| 3 | `release/screenshots/raw/en-US/05-records.png` 또는 `04-day-result.png` | `MISSED DAYS STAY ON THE RECORD.` | 성공뿐 아니라 실패 기록 |
| 4 | `assets/icon.png` + 작게 실제 화면 | `$2.99 ONCE · NO ACCOUNT · DATA STAYS ON DEVICE` | 가격·프라이버시·직접 링크 |

기존 앱 아이콘은 검정 바탕의 붉은 불꽃과 α 문자가 강해 작은 썸네일에서도 보인다. 다만 이미지 전체를 아이콘과 불꽃으로 채우면 게임·크립토·“manosphere” 앱처럼 오해될 수 있다. Reddit 첫 장에서는 아이콘보다 **Today 화면과 90일 구조**가 주인공이어야 한다.

### 9.3 첫 6초 영상 구성

| 구간 | 장면 | 고정 텍스트 |
|---|---|---|
| 0.0–1.3초 | Today 화면 즉시 등장 | `STOP DESIGNING ANOTHER HABIT SYSTEM.` |
| 1.3–3.0초 | BASIC→STANDARD→HARD 코스 스와이프 | `FOLLOW ONE FOR 90 DAYS.` |
| 3.0–4.7초 | 하루 마감과 실패 기록 | `WINS AND MISSES STAY.` |
| 4.7–6.0초 | 앱 아이콘 + 실제 화면 축소 | `$2.99 ONCE · NO ACCOUNT` |

영상은 릴스식 동기부여 몽타주보다 “앱이 어떤 결정을 대신해 주는지”를 보여 줘야 한다. 사용자가 이전에 정한 제품 우선 방향과도 맞는다.

### 9.4 매일 다른 명언의 활용법

명언 하나만 올리는 카드는 제품 증거가 아니며, Reddit 서브레딧에 매일 올리면 반복 홍보로 보인다. 명언은 다음처럼 **실제 사용 일지의 문을 여는 장치**로 쓴다.

> `Day 7/90 — “Get up. Nothing happens until you move.”`
>
> `What I actually completed: 5/7 routines.`
>
> `What failed: I left the walk until 11:40 p.m.`
>
> `Change for tomorrow: walk immediately after lunch.`

이 기록은 우선 ALPHA 공식 또는 창업자 개인 프로필에 주 2~3회 올린다. 관련 커뮤니티에는 규칙이 허용하고 공유할 만한 7일·30일 학습이 쌓였을 때만 요약한다. 앱 링크가 없어도 읽을 가치가 있어야 한다.

## 10. 커뮤니티별 게시글 초안

아래 문안은 그대로 동시 게시하는 템플릿이 아니다. 각 커뮤니티의 최신 규칙과 당시 대화를 확인하고, 한 곳에서 얻은 질문을 다음 글에 반영한다.

### 10.1 `r/ProductivityApps` — 첫 제품 검증 글

게시 조건: 해당 커뮤니티 카르마 10 이상, 최근 한 달 내 개발자 홍보 없음, Self Promotion flair.

**Title**

> I made a fixed 90-day discipline program so the user does not have to design another habit system

**Body**

> Developer here. Many productivity apps begin by asking the user to design another system. We wanted to test the opposite constraint.
>
> So I built ALPHA around the opposite constraint: you do not design the program. It gives you three 30-day stages — BASIC, STANDARD, and HARD — and gradually raises the routines. You check what you actually did, close the day, and both completed and missed days stay in the record.
>
> It is intentionally rigid. If you want a flexible tracker, this probably is not for you.
>
> ALPHA is $2.99 once, with no subscription or account. Routine data and reflections stay on the device. It is available on iOS and Android.
>
> The question I am trying to answer is whether removing setup feels freeing or simply too restrictive. Which side are you on?
>
> [Direct App Store link] · [Direct Google Play link]

이 글의 장점은 “좋아해 달라”가 아니라 고정형 설계의 트레이드오프를 토론하게 한다는 점이다. 다만 “피드백 주세요”라는 넓은 요청 대신 한 가지 제품 판단만 묻는다.

### 10.2 `r/iOSApps` — Transparency + ABC 글

게시 조건: 로컬 카르마 10 이상, 30일 1회, 실명·연락처·경력 연결, Privacy·Terms, 직접 App Store 링크.

**Title**

> I built a $2.99, local-only 90-day discipline app with no account or subscription

**Body**

> I am [REAL NAME], co-founder of East Noise and the developer of ALPHA. [Personal portfolio or LinkedIn]
>
> **The problem:** Flexible habit apps kept turning setup into another task. ALPHA gives you a prescribed 90-day path instead: BASIC, STANDARD, and HARD, 30 days each.
>
> **What is different:** The routines progressively increase, you explicitly close each day, and missed days remain visible instead of disappearing behind a perfect streak. There is no social feed, AI coach, or cloud account.
>
> **Cost:** $2.99 one-time purchase. No subscription or in-app purchase.
>
> **Privacy:** No account is required. Routines, progress, reflections, and selected card images stay on the device. Deleting the app can delete those records because there is no cloud backup.
>
> Direct App Store link: [APP STORE CAMPAIGN LINK]
>
> Developer/contact: [LINK]
>
> Privacy: [Privacy Policy](https://east-noise-web.vercel.app/legal/alpha/privacy)
>
> Terms: [Terms of Use](https://east-noise-web.vercel.app/legal/alpha/terms)

앱의 좋은 점뿐 아니라 클라우드 백업이 없다는 결과까지 적어야 “local-only”가 마케팅 구호가 아니라 실제 계약이 된다.

### 10.3 `r/droidappshowcase` — Android 데모 글

게시 조건: 게시 직전 최신 템플릿 확인, 직접 Google Play 링크, 주 1회 제한, SFW.

**Title**

> ALPHA — a fixed 90-day discipline program with no account or subscription

**Body**

> **What it does:** ALPHA gives you a prescribed 90-day discipline path instead of asking you to build a custom habit system.
>
> **How it works:** BASIC, STANDARD, and HARD run for 30 days each. Complete the daily routines, close the day, and keep both wins and misses in your record.
>
> **Privacy:** No account. Routine data and reflections stay on the device.
>
> **Price:** $2.99 one-time purchase, no subscription.
>
> **Developer disclosure:** I am a co-founder of East Noise and worked on the app.
>
> Google Play: [DIRECT PLAY LINK WITH REDDIT UTM]

HARD 과정의 성인·민감 루틴은 SFW 커뮤니티의 첫 이미지나 제목에서 강조하지 않는다. 필요하면 “digital restraint”로 설명하고, 세부 화면을 묻는 사용자에게 정확히 답한다.

### 10.4 `r/ShowYourApp` — 저위험 리허설

**Title**

> We built a 90-day discipline app that doesn't let you customize the program — freeing or too rigid?

**Body**

> We're East Noise, the small team behind ALPHA.
>
> Most habit apps start by asking you to design a system. We chose the opposite: ALPHA gives you a fixed 90-day path. BASIC → STANDARD → HARD raises the standard every 30 days, and completed and missed days both stay visible.
>
> It's intentionally rigid: $2.99 once, no account, no subscription, and progress and reflections stay on your device (so there is no cloud backup).
>
> We'd genuinely like feedback on the core constraint: does a fixed path feel freeing, or just too restrictive?
>
> [iOS] · [Android]

### 10.5 `r/SideProject` — 실제 숫자가 생긴 뒤만 사용

아래 제목의 대괄호를 진짜 수치로 채울 수 있을 때만 올린다.

> We charged $2.99 for a local-only 90-day discipline app. Here is what [X Reddit views], [Y store visits], and [Z sales] taught us.

본문에는 제품 홍보보다 다음을 담는다.

- 왜 구독 대신 일회성 유료를 택했는가
- 고정 코스가 자유로운 트래커보다 낫다는 가설이 맞았는가
- 가장 많이 나온 반론 3개
- 첫 크리에이티브와 바꾼 크리에이티브
- 숫자와 기간, 측정 한계
- 다음에 바꿀 것과 바꾸지 않을 것

수치가 없는데 “journey”만 말하면 링크 드롭으로 보일 가능성이 높다.

## 11. 댓글 운영

### 11.1 게시 전

- 목표 커뮤니티의 지난 30일 상위 글과 새 글을 읽는다.
- 7~10일 동안 매일 1~2개의 구체적인 도움 댓글을 쓴다.
- 앱 이름과 링크는 먼저 꺼내지 않는다.
- ALPHA가 정확한 답인 “고정 루틴을 원한다”, “구독 없는 로컬 앱을 찾는다”는 요청에만 개발자임을 밝히고 답한다.
- 다른 계정으로 질문을 심거나 팀원이 업보트를 몰아주지 않는다.

### 11.2 게시 당일

- 창업자가 최소 2시간 답할 수 있는 시간에 게시한다.
- 초기 테스트 시간은 화~목 미국 동부 08:00~11:00, 즉 한국 21:00~자정으로 잡는다. 이는 보장된 “최적 시간”이 아니라 영어권과 실시간 대화를 겹치게 하는 운영 가설이다.
- 비판 댓글을 삭제하거나 논쟁으로 이기려 하지 않는다.
- 질문이 반복되면 원문에 `Edit:`로 한 번만 명확히 보완한다.
- 가격, 관계, 데이터 수집을 댓글 깊숙한 곳에 숨기지 않는다.

### 11.3 자주 나올 반론에 대한 답변

**“Another habit tracker?”**

> Fair reaction. The main difference is that you do not create the habits or build a dashboard. It is a fixed three-stage program. If you want customization, a normal tracker is the better choice.

**“Why exactly 90 days?”**

> Ninety days is the structure of the program, not a scientific guarantee. Habit timing varies widely by person and behavior. We chose three 30-day stages so the routine can progress in clear steps.

**“Why pay when free apps exist?”**

> The price is $2.99 once. There is no account, ad model, or subscription. The tradeoff is that there is also no cloud backup.

**“The name ALPHA is cringe.”**

> I understand the association. We use it to mean self-command, not status or domination over other people. If the product page fails to make that clear, that is on us.

**“What happens when I fail a day?”**

> The missed day remains in the record. The app is not pretending every streak is perfect; you review the result and keep going or repeat the course when needed.

## 12. 30일 실행 캘린더

### Days 1–3: 게시 자격과 신뢰 표면 정리

- 완료: 공식 웹의 오래된 앱 버전 표기를 제거하고 프로덕션 배포했다.
- 확인: 영문 홈에 창업자 실명·역할, 사이트에 연락처·법적 페이지가 있다. 게시하는 창업자가 본문에서 본인 이름과 관계를 동일하게 밝힌다.
- Reddit 계정 이메일 인증과 각 커뮤니티 카르마·게시 이력을 확인한다.
- 최근 자기홍보일을 기록해 30일·월 1회 제한을 넘지 않게 한다.
- App Store Connect에서 `reddit_iosapps_01`, `reddit_productivityapps_01` 캠페인 링크를 만든다.
- Google Play 링크에는 `utm_source=reddit`와 커뮤니티별 `utm_campaign`을 구분하고 Play Console 보고서에서 인식되는지 테스트한다.[^29][^30]
- 창업자 한 명이 실제 BASIC Day 1을 시작하고 매일 스크린샷·완료 수·한 줄 회고를 비공개 원본으로 보존한다.

### Days 4–10: 듣기와 언어 수집

- `r/ProductivityApps`, `r/getdisciplined`, `r/75HARD`, `r/iOSApps`의 새 글에서 다음 표현을 수집한다.
  - 앱을 그만 쓰게 되는 이유
  - “rigid”가 도움이 되는 순간과 압박이 되는 순간
  - 구독·가입·알림에 대한 불만
  - 실패·streak reset에 대한 감정
- 하루 1~2개, 제품 링크 없는 도움 댓글을 쓴다.
- 반복되는 반론을 `customization`, `proof`, `price`, `privacy`, `rigidity`, `brand stigma`로 태깅한다.
- 4장 이미지 A와 6초 영상 B를 만든다. 문구 이외의 화면·가격·제품 사실은 동일하게 유지한다.

### Days 11–14: 저위험 리허설

- 창업자 프로필에 Day 7 실제 기록을 공개한다. 성공만 고르지 않는다.
- `r/ShowYourApp`에 6초 데모 하나를 게시한다.
- Android가 직접 링크에서 구매 가능한 것을 재확인한 뒤 `r/droidappshowcase`에 규칙상 한 번 게시한다.
- 24시간 후 제목 훅, 첫 이미지 이해도, 반복 질문, 스토어 유입을 정리한다.

### Days 15–21: 주력 커뮤니티 1차

- 자격을 충족했다면 `r/ProductivityApps`에 한 번 게시한다.
- `r/ShowYourApp` 문안을 그대로 복붙하지 않고, 가장 많이 나온 반론을 첫 두 문단에서 답한다.
- 1시간·6시간·24시간 지표를 기록한다.
- Day 14 실제 기록을 창업자 프로필에 공개한다.

### Days 22–30: iOS 전환 검증과 회고

- Transparency 표면이 완성되고 로컬 카르마 10을 충족하면 `r/iOSApps`에 한 번 게시한다.
- 직접 App Store 캠페인 링크, 가격, 개발자 관계, Privacy, Terms를 본문에 포함한다.
- Day 30에 실제 BASIC 결과를 공개한다. 완료했다면 성공뿐 아니라 실패일·수정한 행동도 포함한다.
- 30일 전체에서 가장 좋은 훅 1개와 가장 강한 반론 1개를 확정한다.
- 유료 광고는 아직 시작하지 않는다. Reddit의 광고 최적화 가이드는 7~14일과 일 $100 수준의 테스트를 권장하므로, 현재처럼 증거와 전환 기준선이 없는 상태에서는 비용 대비 학습이 나쁠 가능성이 높다.[^31]

일정은 카르마를 억지로 맞추기 위해 조작하지 않는다. 자격이 늦어지면 게시 날짜도 늦춘다.

## 13. 성과 측정

### 13.1 Reddit 안에서 볼 것

Reddit의 Post & Comment Insights는 게시물 조회, 첫 24시간 시간대별 조회, 업보트, 댓글, 공유, 재게시 등을 제공한다.[^32] 각 게시물마다 다음을 남긴다.

| 구분 | 기록값 |
|---|---|
| 입력 | 커뮤니티, 날짜·시간, 제목, 훅 유형, 이미지/영상 버전, 링크 캠페인 |
| 1시간 | 조회, 업보트, 댓글, 첫 반론 |
| 6시간 | 조회, 댓글 수, 의미 있는 질문 수, 공유 |
| 24시간 | 총 조회, 업보트, 댓글, 공유, 재게시, 상위 반론 3개 |
| 품질 | 가격을 이해한 댓글, “설치/구매했다”는 자발적 댓글, 제품 오해, 삭제·모더레이션 여부 |

업보트는 보조 지표다. “예쁘다”, “멋지다”보다 가격·고정 코스·프라이버시에 관한 질문이 구매 의도에 가깝다.

### 13.2 스토어에서 볼 것

Apple은 App Store Connect 캠페인 링크를 통해 노출, 제품 페이지 조회, 다운로드, 판매와 사용 지표를 캠페인별로 볼 수 있게 한다. 캠페인 데이터는 최소 24시간이 지나고, 일부 지표는 최소 5개의 다운로드 같은 개인정보 보호 임계값을 넘어야 보인다.[^29] Google Play Console은 ads/referrals와 UTM source·campaign별 방문·설치 또는 2026년 개편된 클릭 지표를 분석할 수 있다.[^30]

| 퍼널 | iOS | Android |
|---|---|---|
| 노출·관심 | Reddit 게시물 조회·댓글 | Reddit 게시물 조회·댓글 |
| 스토어 방문 | 캠페인별 Product Page Views | UTM별 Store listing visitors/clicks |
| 구매·설치 | First-Time Downloads, Sales/Proceeds | Store listing acquisitions 또는 구매 보고 |
| 전환 | Product Page View → Download | Store visitor/click → acquisition |
| 품질 | 캠페인별 사용 지표는 옵트인·임계값 한계 표시 | 현재 앱 내 별도 분석이 없으므로 제한적 |

ALPHA는 로컬 전용이고 사용 분석을 수집하지 않으므로, Reddit 유입자의 7일·30일 실제 수행률을 자동으로 알 수 없다. 이를 보완하려고 몰래 SDK를 추가하면 핵심 프라이버시 약속을 훼손한다. 먼저 다음 두 방법을 쓴다.

1. 스토어 캠페인별 구매와 Apple의 개인정보 보호형 사용 지표만 본다.
2. 별도 동의를 받은 10~20명의 소규모 테스트 참가자에게 Day 1·7·14·30 스크린샷과 짧은 회고를 요청한다. 긍정 후기나 별점은 조건으로 걸지 않는다.

### 13.3 30일 판단 게이트

다음 숫자는 업계 벤치마크가 아니라 ALPHA의 초기 학습을 끝내기 위한 내부 기준이다.

- **메시지 통과:** 서로 다른 허용 커뮤니티 2곳 이상에서 고정 코스의 차이를 스스로 다시 말해 주는 댓글이 나온다.
- **획득 통과:** 한 캠페인이 Apple 표시 임계값인 5개 이상의 첫 다운로드를 만들거나, Android에서 UTM별 방문→구매 움직임을 확인한다.
- **신뢰 통과:** 실제 사용자 또는 창업자의 Day 7·14·30 기록을 공개할 수 있고, 실패일도 포함한다.
- **중단·수정:** 세 번의 규칙 준수 게시 후에도 반응이 “또 habit tracker”에 머물고 스토어 유입 변화가 없다면 크리에이티브를 늘리지 말고 포지셔닝부터 바꾼다.
- **유료 확장:** 유기적 글 하나 이상이 구매를 만들고, 제품 페이지 전환 기준선과 환불·부정 반응을 확인한 뒤에만 작은 유료 실험을 설계한다.

## 14. 지금 먼저 고칠 것

홍보 전에 필요한 순서다.

1. **완료 — 웹 버전 표기:** 공식 소개 페이지의 오래된 App Store/Play 버전 숫자를 제거하고 배포.
2. **확인 — 창업자 투명성 표면:** 영문 홈에 실명·역할, 사이트에 연락처·Privacy·Terms가 있다. 게시자의 이름과 관계를 본문 첫 문단에서 일치시킬 것.
3. **완료 — 30일과 90일 문서:** `docs/localization/global-store-copy.md`를 30일 × 3단계의 90일 코스와 JSON source of truth로 정리.
4. **부분 완료 — 캠페인 링크:** Android UTM은 준비. App Store Connect 캠페인 링크는 로그인 브라우저가 연결될 때 생성.
5. **사용자 실행 — 실제 증거:** 창업자 BASIC Day 1 시작, 원본 화면·실패·회고 보존.
6. **확인 대기 — Reddit 자격:** `r/ProductivityApps`와 `r/iOSApps` 로컬 카르마, 최근 자기홍보일, 이메일 인증.
7. **완료 — 첫 크리에이티브:** 4:5 이미지 5장과 6.23초 실제 화면 데모, manifest, 게시 초안 생성.

## 15. 최종 권고

ALPHA의 Reddit 캠페인은 “나도 이 앱을 써 봤는데 인생이 달라졌다”는 가짜 사용자가 아니라, **강한 취향을 가진 창업자가 자신의 설계 선택과 실제 30일 기록을 공개하는 캠페인**이어야 한다.

가장 유력한 성장 루프는 다음이다.

1. 관련 문제에 유용한 댓글로 계정 신뢰를 쌓는다.
2. 실제 Day 7·14·30 기록으로 제품의 엄격함과 한계를 동시에 보여 준다.
3. 허용된 앱 커뮤니티에서 한 달에 한 번, 서로 다른 질문에 답하는 글을 올린다.
4. 실제 화면·가격·로컬 저장을 첫 이미지와 첫 문단에 보여 준다.
5. Reddit 인사이트와 스토어 캠페인 전환을 함께 본다.
6. 실제 증거가 생기면 SideProject에 숫자와 실패를 포함한 빌드 스토리를 낸다.
7. 90일 완료자가 생긴 뒤에만 “무엇이 달라졌는가”를 당사자의 동의와 정확한 관계 공개 아래 사용한다.

이 방식은 초반 화력이 느릴 수 있다. 대신 계정 정지, 커뮤니티 반감, 가짜 후기 위험을 피하면서 ALPHA가 가장 필요로 하는 **진짜 결과물과 반복 가능한 신뢰 자산**을 동시에 만든다.

## 출처

[^1]: [Reddit Help — Spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam), 2026-05-19 갱신, 2026-09-11 확인.
[^2]: [U.S. Federal Trade Commission — Final Rule Banning Fake Reviews and Testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials), [Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), 2026-09-11 확인.
[^3]: [`r/androidapps` — Mod Update: Quality Over Quantity](https://www.reddit.com/r/androidapps/comments/1tphf6p/randroidapps_mod_update_quality_over_quantity/), 2026-09-11 확인.
[^4]: Phillippa Lally et al., [How are habits formed: Modelling habit formation in the real world](https://www.flexyourbrain.com/wp-content/uploads/2015/10/UL-STUDY-66-Days-IJSP_998-1009.pdf), *European Journal of Social Psychology* 40, 2010.
[^5]: [Behavior change techniques in digital interventions for midlife adults: systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7113799/), 2026-09-11 확인.
[^6]: [Goal setting and self-monitoring in physical activity interventions: meta-regression](https://pubmed.ncbi.nlm.nih.gov/30425028/), 2026-09-11 확인.
[^7]: [Atoms — official product page](https://atoms.jamesclear.com/), 2026-09-11 확인.
[^8]: [Fabulous — App Store](https://apps.apple.com/us/app/fabulous-daily-habit-tracker/id1203637303), 2026-09-11 확인.
[^9]: [Habitify — Pricing](https://habitify.me/pricing), 2026-09-11 확인.
[^10]: [75 HARD — official app page](https://andyfrisella.com/products/75-hard-app), [App Store](https://apps.apple.com/us/app/75-hard/id1502228408), 2026-09-11 확인.
[^11]: [Discipline App — Google Play](https://play.google.com/store/apps/details?id=com.onesiterank.discipline), 2026-09-11 확인.
[^12]: [Protocol 90 — Google Play](https://play.google.com/store/apps/details?id=com.protocol90.app), 2026-09-11 확인.
[^13]: [Alpha+ Daily Routine Planner — Google Play](https://play.google.com/store/apps/details?id=com.kripton.alpha.dailyplanner), 2026-09-11 확인.
[^14]: [`r/SideProject` — The selfish promotion epidemic is killing this sub](https://www.reddit.com/r/SideProject/comments/1u07rgx/the_selfish_promotion_epidemic_is_killing_this_sub/), 조사 시점 약 117점.
[^15]: [`r/findareddit` — male self-improvement without alpha-male content](https://www.reddit.com/r/findareddit/comments/1d88554/), 2026-09-11 확인.
[^16]: U.S. Geological Survey, David Mech, [Alpha status, dominance, leadership, and division of labor in wolf packs](https://www.usgs.gov/publications/alpha-status-dominance-leadership-and-division-labor-wolf-packs), 1999.
[^17]: [`r/iOSApps` — Moderation Update Phase 2: Trust, Transparency & ABC](https://www.reddit.com/r/iosapps/comments/1u9aw0f/riosapps_moderation_update_phase_2_trust/), 2026-09-11 확인.
[^18]: [`r/iOSApps` — Clarification of Trust and Transparency](https://www.reddit.com/r/iosapps/comments/1v7lb8w/clarification_of_trust_and_transparency/), 2026-09-11 확인.
[^19]: [`r/SideProject` — Habstick: 65K downloads and $200/month breakdown](https://www.reddit.com/r/SideProject/comments/1sctqtt/i_built_a_habit_tracker_app_solo_in_flutter_65k/), 조사 시점 약 75점.
[^20]: [`r/SideProject` — Habit app: $350, 500 installs, four weeks](https://www.reddit.com/r/SideProject/comments/1k8ewwa), 조사 시점 약 241점.
[^21]: [`r/iOSApps` — Payback, a local-first iPhone money tracker](https://www.reddit.com/r/iosapps/comments/1tijblp/i_built_payback_a_localfirst_iphone_money_tracker/), 조사 시점 약 22점.
[^22]: [`r/iOSApps` — Milestones, a private native project tracker](https://www.reddit.com/r/iosapps/comments/1twq78q/i_built_milestones_a_private_native_project/), 조사 시점 약 41점.
[^23]: [`r/ProductivityApps` — What's the one productivity app that changed your life and how?](https://www.reddit.com/r/ProductivityApps/comments/1w03dwp/whats_the_one_productivity_app_that_changed_your/), 조사 시점 약 94점.
[^24]: [`r/ProductivityApps` — All top tracker apps tier list](https://www.reddit.com/r/ProductivityApps/comments/1vi2njw/all_top_tracker_apps_tier_list/), 조사 시점 약 136점.
[^25]: [`r/SideProject` — I built my own Hello World app, a habit tracker](https://www.reddit.com/r/SideProject/comments/1so4hik/i_built_my_own_hello_world_app_a_habit_tracker/), 조사 시점 약 1점.
[^26]: [`r/SideProject` — discussion of habit trackers as common starter projects](https://www.reddit.com/r/SideProject/comments/1l01zl0), 2026-09-11 확인.
[^27]: [`r/iOSApps` — removed habit tracker post and community reaction](https://www.reddit.com/r/iosapps/comments/1u1ftru/removed/), 2026-09-11 확인.
[^28]: [Reddit Business — Copy and Creative Best Practices](https://www.business.reddit.com/copy-creative-best-practices), [Image Ad Specs](https://www.business.reddit.com/learning-hub/articles/reddit-image-ad-specs), 2026-09-11 확인.
[^29]: Apple Developer, [App Store Connect Analytics — Campaign Links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/), [Acquisition](https://developer.apple.com/help/app-store-connect-analytics/acquisition/acquisition/), 2026-09-11 확인.
[^30]: Google Play Console Help, [Understand and grow your app's user base](https://support.google.com/googleplay/android-developer/answer/9859173?hl=en), 2026-09-11 확인.
[^31]: [Reddit Business — How to optimize Reddit Ads](https://www.business.reddit.com/learning-hub/articles/how-to-optimize-reddit-ads), 2026-09-11 확인.
[^32]: [Reddit Help — Post & Comment Insights](https://support.reddithelp.com/hc/en-us/articles/35363096996500-Post-Comment-Insights), 2026-09-11 확인.
[^33]: [ALPHA - 90-Day Discipline — U.S. App Store](https://apps.apple.com/us/app/alpha-90-day-discipline/id6788264733), 2026-09-11 확인. 가격·공개 평점 상태·카테고리·다국어·데이터 수집 고지 확인.
[^34]: East Noise, [ALPHA 소개](https://east-noise-web.vercel.app/alpha), [지원](https://east-noise-web.vercel.app/alpha/support), [개인정보처리방침](https://east-noise-web.vercel.app/legal/alpha/privacy), [이용약관](https://east-noise-web.vercel.app/legal/alpha/terms), 2026-09-11 확인.
[^35]: [Reddit Help — Disrupting Communities](https://support.reddithelp.com/hc/en-us/articles/360043066412-Disrupting-Communities), 2026-05-19 갱신, 2026-09-11 확인. 다중 계정·조직된 집단·자동화를 이용한 투표 조작을 금지한다.
[^36]: [ALPHA - 90-Day Discipline — Google Play](https://play.google.com/store/apps/details?id=com.eastnoise.alpha&hl=en_US&gl=US), 2026-09-11 확인. 미국 영어권 직접 listing URL의 HTTP 200 도달을 재확인했으며, 게시 직전 실제 구매 가능 상태는 기기·국가별로 다시 점검한다.
[^37]: [`r/ProductivityApps` current community page and rules](https://www.reddit.com/r/ProductivityApps/), 2026-09-11 확인.
[^38]: [`r/droidappshowcase` current community page and rules](https://www.reddit.com/r/droidappshowcase/), 2026-09-11 확인.
[^39]: [`r/ShowYourApp` current community page and rules](https://www.reddit.com/r/ShowYourApp/), 2026-09-11 확인.
[^40]: [`r/getdisciplined` — The future of r/getdisciplined](https://www.reddit.com/r/getdisciplined/comments/1lumfrc/meta_the_future_of_rgetdisciplined_lets_build_it/), 2026-09-11 확인.
[^41]: [`r/selfimprovement` — community self-promotion policy discussion](https://www.reddit.com/r/selfimprovement/comments/o318uq), 2026-09-11 확인.
