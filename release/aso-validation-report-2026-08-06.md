# ALPHA iOS / Android ASO Validation

검사일: 2026-08-06
검사 커밋: `0484bfa` (`codex/supabase-auth-foundation`)

## 결론

- 작업 시작 기준 iOS와 Android 공개 스토어는 `ALPHA: REFORGE` `1.0.3`, `KRW 4,400`이었다.
- App Store Connect `1.0.4`와 Google Play에 확정된 10개 언어 메타데이터와 언어별 스크린샷 6장을 반영했다. iOS `1.0.4 (18)`은 심사 대기 중이다.
- Google Play 한국 공개 페이지는 새 이름과 짧은 설명으로 갱신됐고, 프로덕션 바이너리는 기존 `1.0.3 (3)`을 유지한다. Android `1.0.4 (4)` AAB는 준비됐지만 업로드 키 재설정 승인 전이라 출시 트랙은 변경하지 않았다.
- 10개 언어의 메타데이터 길이와 이미지 규격은 Apple 및 Google Play 제출 기준을 통과한다.
- 앱은 `BASIC 30일 -> STANDARD 30일 -> HARD 30일` 구조다. 현재 전 언어의 "30일 프로그램" 표기는 전체 과정을 30일로 오해하게 하므로 다음 메타데이터 업데이트 전 수정이 필요하다.
- 한국어 부제와 짧은 설명인 `알파가 되어라.`는 브랜드 톤은 선명하지만, 검색 결과에서 앱의 기능과 차별점을 설명하지 못한다.
- 현재 스크린샷은 실제 UI와 현지화를 충실히 보여주지만, 작은 썸네일에서 첫 1~3장의 효익과 흐름이 약하다.

## 현재 상태

| 항목 | iOS | Android |
| --- | --- | --- |
| 공개 버전 | 1.0.3 | 1.0.3 (3) |
| 가격 | KRW 4,400 | KRW 4,400 |
| 앱 식별자 | `com.eastnoise.alpha` | `com.eastnoise.alpha` |
| 기본 카테고리 | Productivity | Productivity |
| 현지화 | 10개 | 10개 |
| 스크린샷 | 10개 언어 x 6장, 1320 x 2868 | 10개 언어 x 6장, 1320 x 2640 |
| 개인정보 | 계정 및 서버 전송 없음 | 계정 및 서버 전송 없음 |

### 스토어 콘솔 반영 현황

- App Store의 10개 언어 앱 이름, 부제, 설명, 키워드, 프로모션 문구, 업데이트 내용을 API로 반영하고 서버 저장값을 다시 조회했다.
- 앱 이름은 `ALPHA - 90일 자기통제`, 부제는 `90일로 네 인생을 다시 세워라`다.
- App Store 스크린샷 60장을 `APP_IPHONE_67` 세트에 업로드했으며 전부 `COMPLETE` 상태다.
- 기본 카테고리는 `Productivity`, 보조 카테고리는 `Lifestyle`이다.
- 콘텐츠 권리는 타사 콘텐츠 미사용으로 유지했다.
- 건강·웰니스 주제는 유지하고, 앱과 무관하게 남아 있던 무기 관련 답변과 성인·선정적 주제 답변은 `NONE`으로 정정했다. App Store 연령 등급은 `4+`다.
- API 개인 키는 저장소 밖의 로컬 비공개 경로에 보관했고 저장소에는 자격증명을 추가하지 않았다.
- Google Play의 10개 언어 제목·짧은 설명·전체 설명과 스크린샷 60장을 Developer API로 반영했다.
- Google Play 서버의 스크린샷 SHA-256, 앱 아이콘, 피처 그래픽이 로컬 원본과 모두 일치한다.
- Google Play는 개인 키 파일 없이 전용 서비스 계정 impersonation으로 인증한다. 새 업로드 인증서의 키 재설정 요청은 대기 중이며 AAB와 출시 트랙은 변경하지 않았다.

공개 페이지:

- App Store: https://apps.apple.com/kr/app/alpha-reforge/id6788264733
- Google Play: https://play.google.com/store/apps/details?id=com.eastnoise.alpha&hl=ko&gl=KR
- 개인정보 처리방침: https://east-noise-web.vercel.app/legal/alpha/privacy
- 고객지원: https://east-noise-web.vercel.app/alpha/support

## 제출 규격 검증

### App Store

- 앱 이름 30자, 부제 30자, 키워드 100 UTF-8 바이트, 프로모션 문구 170자 제한을 10개 언어 모두 통과했다.
- 프랑스어 키워드는 99/100바이트, 독일어는 96/100바이트로 여유가 작다. 단어를 추가할 때 반드시 재검증해야 한다.
- 스크린샷 60장은 모두 1320 x 2868이며 알파 채널이 없다.
- 마케팅, 지원, 개인정보 처리방침 URL은 HTTP 200으로 확인됐다.

### Google Play

- 제목 30자, 짧은 설명 80자, 전체 설명 4,000자 제한을 10개 언어 모두 통과했다.
- 휴대전화 스크린샷 60장은 모두 1320 x 2640이다.
- 앱 아이콘은 512 x 512, 피처 그래픽은 1024 x 500이며 둘 다 알파 채널이 없다.
- `1.0.4 (4)` release AAB 빌드와 JAR 서명 검증을 통과했다. AAB signer가 새 업로드 키와 일치하고 release 병합 Manifest의 패키지·버전·차단 권한도 확인했다.

## 메타데이터 문제

### P1. 과정 기간이 실제 제품과 다름

코드와 과정 문서는 각 과정이 30일이고 통과 후 다음 과정이 열리는 구조를 정의한다. 세 과정을 한 번에 통과하면 기본 여정은 90일이며, 재도전 시 더 길어질 수 있다. 그러나 모든 언어의 설명은 ALPHA 전체를 "30일 프로그램"으로 소개한다.

다음 업데이트의 한국어 기준 문구:

- iOS 부제: `90일 자기통제 루틴`
- Google Play 짧은 설명: `BASIC부터 HARD까지, 90일 동안 루틴과 기록으로 자기통제를 완성하라.`
- 설명 첫 문단: `ALPHA는 말이 아니라 반복으로 자신을 다시 만드는 90일 자기통제 프로그램이다.`
- 설명 둘째 문단 시작: `BASIC, STANDARD, HARD. 각 30일 과정에서 몸과 생활의 기본을 세우고, 강도와 정확성을 높이며, 집중과 절제를 끝까지 밀어붙인다.`

영문을 포함한 나머지 9개 언어도 "90-day, three-stage journey"와 "30 days per stage"가 구분되도록 함께 수정해야 한다.

### P1. Android 릴리스 문서가 이전 버전을 가리킴

- `release-notes.json`의 버전이 `1.0.1`로 남아 있어 제출 대상인 `1.0.4`로 수정했다.
- `play-console-checklist.md`의 버전과 AAB 경로가 `1.0.1 (2)` 및 다른 개발자 로컬 경로로 남아 있어 현재 버전과 재빌드 조건으로 수정했다.
- `release-readiness-report.md`는 과거 제출 증거이므로 내용을 지우지 않고 역사 문서임을 표시했다.

### P2. 검색 결과에서 기능 설명이 약함

한국어 `알파가 되어라.`는 앱 이름과 메시지를 반복한다. `90일`, `루틴`, `자기통제` 중 핵심어를 부제나 짧은 설명에 배치하면 사용자가 설치 전에 제품을 이해할 수 있다. 키워드를 나열하기보다 고정된 3단계 과정이라는 차별점을 문장으로 설명하는 편이 적합하다.

### P2. 스크린샷 첫 3장의 서사가 약함

현재 이미지는 실제 앱 화면을 그대로 보여줘 신뢰성은 높다. 다만 검색 및 스토어 썸네일에서는 UI 안의 작은 문구를 읽기 어렵다. 실제 UI를 유지하면서 상단에 짧은 효익 문구를 추가하는 안을 우선 테스트한다.

1. `의욕 말고, 90일의 기록` - 오늘 화면
2. `BASIC부터 HARD까지` - 과정 화면
3. `완료도 실패도 숨기지 마라` - 하루 마감 화면
4. `하루를 닫아야 기록이 남는다` - 결과 화면
5. `쌓인 기록이 네 기준이 된다` - 기록 화면

### P3. 업데이트 문구가 구체적이지 않음

현재 "스토어 소개 문구와 안정성 개선"만 적혀 있어 사용자에게 달라진 기능이 보이지 않는다. 다음 버전에서는 실제 변경만 구체적으로 적는다. 예: `10개 언어 지원을 추가하고, BASIC·STANDARD·HARD 과정과 기록 흐름을 다듬었습니다. 카드 이미지 맞춤 설정과 앱 안정성도 개선했습니다.`

## 빌드 및 개인정보 검증

- `npm run verify:core`: 통과
- `npm run verify:i18n`: 통과
- `npm run verify:google-play`: 통과
- `npx tsc --noEmit`: 통과
- iOS Simulator Debug 빌드: 통과
- Android `1.0.4 (4)` Release AAB 빌드·서명·병합 Manifest 검사: 통과
- `expo-doctor`: 17/18. 네이티브 프로젝트와 `app.json`을 함께 관리할 때 설정 동기화가 자동 보장되지 않는다는 경고가 남는다.
- 앱 코드에는 로그인, 서버 업로드, 원격 데이터 수집이 없다. 루틴, 회고, 설정, 선택 이미지는 기기에 저장되고 알림은 로컬 예약 방식이다.
- Play Manifest에는 라이브러리에서 유입된 인터넷, 알림, 구형 저장소, FCM 관련 권한이 포함된다. Play Console 업로드 후 생성되는 권한 및 데이터 보안 미리보기는 수동 대조가 필요하다.

## 남은 게이트

- 새 Android 업로드 키와 `1.0.4 (4)` AAB를 준비했다. Google Play 업로드 키 재설정 요청은 제출됐으며 승인 전에는 AAB를 업로드할 수 없다.
- App Store Connect `1.0.4 (18)`은 `WAITING_FOR_REVIEW`다. 전체 판매 국가와 Google Play 데이터 보안 답변의 콘솔 캡처는 남았다.
- 실제 iPhone 및 Android 기기에서 설치, 사진 선택/크롭, 알림, 앱 재실행 후 로컬 저장을 검증하지 않았다.
- npm 의존성 검사에는 Expo 54 빌드 도구의 전이 취약점 15건이 남는다. 강제 자동 수정은 Expo 57 메이저 업그레이드를 요구하므로 별도 작업으로 다룬다.

## ASO 다음 순서

1. Google Play 업로드 키 재설정 승인을 확인하고 새 인증서 지문을 대조한다.
2. `1.0.4 (4)` AAB를 프로덕션 트랙에 업로드한 뒤 실제 릴리스 상태를 검증한다.
3. iOS Product Page Optimization과 Google Play Store Listing Experiment에서 기존본 대비 전환율을 비교한다.
4. 실제 기기 QA를 재개할 경우 설치·사진 선택·알림·로컬 저장을 플랫폼별로 검증한다.

## 참고 기준과 사례

- Apple App Store Connect 메타데이터 및 스크린샷 규격
  - https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/
  - https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Google Play 스토어 등록정보 및 그래픽 가이드
  - https://support.google.com/googleplay/android-developer/answer/13393723
  - https://support.google.com/googleplay/android-developer/answer/9866151
  - https://support.google.com/googleplay/android-developer/answer/9898842
- 국내 참고: 마이루틴, 루티너리, 열품타, 알라미
- 글로벌 참고: Habitify, Fabulous, Streaks
- ASO·KO 국내 앱 스크린샷 아카이브: https://asoko.hacokebu.com/about
