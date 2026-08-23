# ALPHA Google Play Release Readiness Report

> Historical report: this document records the `1.0.1 (2)` submission on 2026-07-24. Use `release/aso-validation-report-2026-08-22.md` and `release/google-play/play-console-checklist.md` for the current state.

검사일: 2026-07-24

## 결론

Google Play 프로덕션 업데이트 `1.0.1 (2)`를 제출했다.

## 준비된 릴리스

- 앱 이름: `ALPHA: REFORGE`
- 패키지: `com.eastnoise.alpha`
- 버전: `1.0.1`
- 버전 코드: `2`
- 최소 Android: API 24
- 대상 Android: API 36
- AAB: `/Users/ustone/Downloads/ALPHA-1.0.1-vc2.aab`
- AAB SHA-256: `f43882bf50d95f6c03ba85b65756ff8e70c03d13269be6729a433de623af734f`
- 업로드 인증서 SHA-256: `2C:6E:F9:25:25:E9:12:0A:D6:D6:A4:F3:83:86:5D:FF:94:44:B5:B0:12:0F:3C:8F:0F:6B:25:E9:BB:43:42:E6`

## 완료한 작업

- Android 업로드 서명키를 별도 보안 폴더에 생성하고 릴리스 서명을 연결했다.
- AAB와 서명된 릴리스 APK를 생성했다.
- Android 앱 아이콘이 Expo 기본 아이콘으로 남던 문제를 수정했다.
- 카메라, 마이크, 다른 앱 위 표시 권한을 제거하거나 차단했다.
- 사진 선택은 갤러리에서 사용자가 명시적으로 고르는 방식만 유지했다.
- 앱의 어두운 화면 스타일이 Android에서도 일관되게 적용되도록 `expo-system-ui`를 연결했다.
- Android 릴리스 빌드가 매번 깨끗한 네이티브 프로젝트를 생성한 뒤 빌드되도록 자동화했다.
- 한국어, 영어, 일본어, 스페인어, 독일어, 프랑스어, 포르투갈어(브라질), 중국어 번체, 이탈리아어, 중국어 간체의 스토어 문구와 출시 노트를 준비했다.
- 위 10개 언어별 휴대전화 스크린샷을 5장씩, 총 50장 준비했다.
- 스크린샷에서 iPhone 상태 표시를 제거하고 Google Play용 `1320 x 2640` 규격으로 맞췄다.
- 512 x 512 앱 아이콘과 1024 x 500 피처 그래픽을 준비했다.
- 개인정보 처리방침, 앱 소개, 고객지원 URL의 실제 응답을 확인했다.
- Play Console 앱 콘텐츠와 데이터 보안 설문에 사용할 답변을 정리했다.
- 저장소 안에 Google 서비스 계정 키, Android 업로드 키, Apple API 키가 들어가지 않은 것을 확인했다.

## 검증 결과

- 핵심 상태와 과정 전환 자동 검사: 통과
- 10개 언어, 언어별 90개 문구, 권한 안내문 검사: 통과
- TypeScript 검사: 통과
- Expo 의존성 버전 검사: 통과
- Google Play 문구 글자 수, 이미지 규격, 50개 스크린샷 검사: 통과
- AAB 구조 검사(`bundletool validate`): 통과
- 패키지, 버전, SDK, 권한 Manifest 검사: 통과
- 개인정보 처리방침 URL: HTTP 200
- 앱 소개 URL: HTTP 200
- 고객지원 URL: HTTP 200

## 사용자가 최종 확인할 항목

1. Play Console에서 AAB를 업로드하고 최초 업로드 시 Play App Signing을 활성화한다.
2. 앱을 유료로 설정하고 대한민국 기준 가격을 `KRW 4,400`으로 확인한다.
3. 판매할 국가와 지역을 최종 선택한다. 무료로 게시한 앱은 나중에 유료로 바꿀 수 없으므로 게시 전 반드시 다시 확인한다.
4. 준비된 10개 언어 스토어 문구, 출시 노트, 아이콘, 피처 그래픽, 스크린샷을 등록한다.
5. 앱 액세스, 광고, 대상 연령, 콘텐츠 등급, 데이터 보안 설문을 체크리스트대로 입력하고 미리보기를 확인한다.
6. 내부 또는 비공개 테스트에 올린 뒤 실제 Android 기기에서 설치, 알림, 사진 선택 및 크롭, 앱 재실행 후 저장 상태를 확인한다.
7. Play 사전 출시 보고서에서 비정상 종료, ANR, 접근성, 레이아웃 문제를 확인한다.
8. 모든 항목이 맞을 때만 프로덕션 게시를 진행한다.

## 남은 제한과 비차단 사항

- 이 작업 환경의 Android Emulator는 Hypervisor 권한 오류(`HV_DENIED`)로 실행할 수 없었다. AAB와 APK 정적 검증은 완료했지만 실제 Android 기기 최종 QA는 반드시 필요하다.
- Google Play 서비스 계정 인증과 앱별 배포 권한을 확인했으며, Google Play Developer API로 프로덕션 업데이트 제출을 완료했다.
- `expo-doctor`는 17/18을 통과했다. 남은 경고는 네이티브 폴더가 있을 때 `app.json` 설정이 자동 반영되지 않을 수 있다는 내용이다. Android 릴리스 스크립트가 매번 `expo prebuild --clean`을 실행하므로 이번 Android AAB에는 설정이 반영됐다.
- `npm audit`의 13건은 Expo CLI와 빌드 도구의 전이 의존성이다. 앱의 사용자 데이터 처리 코드에서 발견된 취약점은 아니며, 일괄 수정은 Expo SDK 57 업그레이드를 요구한다. 첫 출시 후 별도 업그레이드 작업으로 처리하는 편이 안전하다.

## 준비 파일

- 최종 체크리스트: `release/google-play/play-console-checklist.md`
- 스토어 문구: `release/google-play/store-listings.json`
- 출시 노트: `release/google-play/release-notes.json`
- 앱 아이콘: `release/google-play/assets/app-icon-512.png`
- 피처 그래픽: `release/google-play/assets/feature-graphic.png`
- 스크린샷: `release/google-play/screenshots/`
