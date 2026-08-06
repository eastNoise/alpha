# ALPHA 개인정보·정책·가격 검증

검사일: 2026-08-06
대상: `com.eastnoise.alpha`, 공개 버전 `1.0.3`

## 결론

- App Store의 `데이터가 수집되지 않음`과 Google Play의 `수집·공유 데이터 없음` 답변은 현재 앱 동작과 일치한다.
- 루틴, 완료 기록, 회고, 설정과 선택한 카드 이미지는 기기 내부에만 저장된다. 계정, 광고, 분석 SDK, 원격 API 호출은 없다.
- Android 공개 버전에는 불필요한 외부 저장소 읽기·쓰기 권한이 표시된다. 다음 빌드에서는 시스템 사진 선택기만 사용하고 두 권한을 제거하도록 수정했다.
- Android 자동 백업은 켜져 있다. 개인정보 처리방침은 운영체제 백업 가능성을 밝히며, 데이터 초기화와 카드 이미지 삭제 방법을 구분하도록 문구를 보완했다.
- 한국 가격은 두 스토어 모두 `KRW 4,400`으로 확인됐다.
- 전체 판매 국가의 콘솔 설정은 API 자격증명이 없는 현재 환경에서 확인하지 못했다. 아래 공개 판매 확인은 콘솔 설정의 완전한 대체가 아니다.

## 공개 스토어 상태

| 항목 | App Store | Google Play |
| --- | --- | --- |
| 공개 이름 | `ALPHA: REFORGE` | `ALPHA: REFORGE` |
| 공개 버전 | `1.0.3` | `1.0.3` |
| 한국 가격 | `KRW 4,400` | `KRW 4,400` |
| 한국 등급 | `4+` | `3세 이상` |
| 개인정보 표시 | 데이터가 수집되지 않음 | 수집·공유 데이터 없음 |
| 개인정보 URL | 정상 응답 | 정상 응답 |

공개 페이지:

- App Store: https://apps.apple.com/kr/app/alpha-reforge/id6788264733
- Google Play: https://play.google.com/store/apps/details?id=com.eastnoise.alpha&hl=ko&gl=KR
- 개인정보 처리방침: https://east-noise-web.vercel.app/legal/alpha/privacy
- 지원: https://east-noise-web.vercel.app/alpha/support
- 마케팅: https://east-noise-web.vercel.app/alpha

## 실제 데이터 흐름

### 기기 내부 저장

- `AsyncStorage`: 과정 상태, 루틴, 일별 완료 기록, 회고, 언어·알림·햅틱 설정.
- 앱 문서 디렉터리: 사용자가 직접 선택하고 자른 카드 이미지.
- 로컬 알림: 사용자가 허용한 경우 매일 21:30 하루 마감 알림을 기기에서 예약.
- 운영체제 백업: Android `allowBackup=true`; 플랫폼 설정에 따라 로컬 앱 데이터가 백업·복원될 수 있음.

### 외부 전송

- 앱 소스에 `fetch`, Axios, Supabase, Firebase Analytics, 광고, 크래시 수집 또는 계정 인증 호출이 없다.
- Android에 `expo-notifications`의 FCM 관련 네이티브 구성요소가 포함되지만, `google-services.json`, Firebase 앱 설정, 푸시 토큰 등록 호출은 없다.
- iOS `PrivacyInfo.xcprivacy`는 추적 안 함, 수집 데이터 없음으로 선언한다.
- 실제 기기 네트워크 캡처는 아직 하지 않았으므로 최종 출시 QA에서 한 번 더 확인한다.

## 플랫폼 답변

### App Store 개인정보

유지:

- Data Collected: `No`
- Tracking: `No`

근거: Apple은 기기 안에서만 처리되고 서버로 보내지지 않는 데이터를 App Privacy의 수집으로 보지 않는다.

### Google Play 데이터 보안

유지:

- Data collected: `No`
- Data shared: `No`
- Account creation: `No`

다음 AAB 확인:

- `READ_EXTERNAL_STORAGE` 없음
- `WRITE_EXTERNAL_STORAGE` 없음
- 사진은 Android 시스템 사진 선택기로 사용자가 고른 한 장만 접근
- 공개 권한 목록에서 기존 `USB 저장소 읽기·수정` 항목이 사라졌는지 확인

## 백업과 삭제

- 데이터 초기화는 루틴, 마감, 회고와 과정 진행을 삭제한다.
- 각 카드의 `기본 이미지 복원`은 해당 사용자가 선택한 이미지를 삭제한다.
- 앱 삭제는 로컬 앱 데이터를 제거하지만, 운영체제 백업 설정에 따라 재설치 시 복원될 수 있다.
- 개발자가 운영하는 계정 또는 클라우드 백업은 없다.

## 등급과 건강 선언

### Apple

- `gunsOrOtherWeapons`는 앱에 해당 콘텐츠가 없어 `NONE`으로 수정했다.
- 운동 루틴을 제공하므로 `healthOrWellnessTopics=true`를 유지한다.
- `포르노 금지`라는 비노골적 문구가 반복 노출되므로 `matureOrSuggestiveThemes=INFREQUENT`로 보수적으로 분류했다.
- 새 설문 적용 시 iOS 26 계열에서 `9+`가 예상되지만, 실제 계산 결과는 App Store Connect에서 확인해야 한다.

### Google Play

- 현재 한국 공개 등급은 `3세 이상`이다.
- Health apps declaration은 `Health and fitness > Activity and Fitness`로 답한다.
- 진단, 치료, 의료 조언, Health Connect 접근 또는 건강 데이터 수집은 하지 않는다.
- 콘텐츠가 바뀌거나 설문을 다시 제출할 때 `포르노 금지` 문구를 포함해 IARC 답변을 재검토한다.

## 가격과 공개 판매 확인

한국:

- App Store: `KRW 4,400`
- Google Play: `KRW 4,400`

10개 현지화 대표 국가 공개 확인:

| 국가 | App Store | Google Play |
| --- | --- | --- |
| KR | 판매 확인 | 판매 확인 |
| US | 판매 확인 | 판매 확인 |
| JP | 판매 확인 | 판매 확인 |
| ES | 판매 확인 | 판매 확인 |
| DE | 판매 확인 | 판매 확인 |
| FR | 판매 확인 | 판매 확인 |
| BR | 판매 확인 | 판매 확인 |
| CN | 판매 확인 | Google Play 판매 페이지 없음 |
| TW | 판매 확인 | 판매 확인 |
| IT | 판매 확인 | 판매 확인 |

## URL 대조

- 개인정보 처리방침과 지원 URL은 `200 OK`이며 현재 앱의 로컬 저장, 사진, 알림, 백업 동작을 설명한다.
- 공개 마케팅 페이지는 검사 시점에 `30일`, `App Store 출시 준비 중`으로 남아 있었다.
- `east-noise-web` 로컬 소스는 `3단계 90일`, `App Store·Google Play 공개` 기준으로 수정했고 빌드가 통과했다.
- 웹 저장소에 ALPHA와 무관한 기존 미커밋 변경이 있어 이번 작업에서는 배포하지 않았다.

## 검증

- `npm run verify:core`: 통과
- `npm run verify:i18n`: 통과
- `npx tsc --noEmit`: 통과
- `npx expo config --type public`: 통과
- `npm run verify:google-play`: 통과, 10개 로케일 60장 확인
- `./gradlew :app:assembleDebug --no-daemon`: 통과
- `./gradlew :app:processDebugManifest --no-daemon`: 통과
- 생성된 debug APK: 외부 저장소 읽기·쓰기 권한 없음
- 임시 로컬 테스트 서명으로 생성한 release 병합 Manifest: 외부 저장소·카메라·마이크·오버레이 권한 없음
- `node --check scripts/configure-android-release.cjs`: 통과
- release Gradle 작업의 업로드 키 필수 가드: 유지 확인
- `git diff --check`: 앱·웹 저장소 모두 통과
- `east-noise-web npm run build`: 통과

## 남은 게이트

1. 프로덕션 업로드 키 환경에서 release Manifest와 AAB를 생성해 권한을 다시 확인한다.
2. Android 실제 기기에서 사진 선택·자르기·기본 이미지 복원과 Android 8~최신 버전 호환성을 확인한다.
3. App Store Connect와 Play Console에서 정확한 판매 국가, 연령·건강 선언, 가격을 캡처한다.
4. 수정한 홈페이지와 개인정보 처리방침을 다른 웹 작업과 분리해 검토·배포한다.
5. 실제 기기의 네트워크 활동을 확인한 뒤 개인정보 답변을 최종 제출한다.
