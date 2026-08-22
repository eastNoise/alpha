# ALPHA 1.0.5 iOS / Android 업데이트 결과

검증일: 2026-08-22 KST

## 결론

- 앱 코드 버전을 `1.0.5`로 올렸다.
- iOS 빌드 `19`를 App Store Connect에 업로드하고 10개 언어 메타데이터와 스크린샷 80장을 적용한 뒤 심사 제출했다.
- Android version code `5` AAB를 Google Play 프로덕션 트랙에 업로드하고 10개 언어 메타데이터, 업데이트 노트, 스크린샷 80장, 새 앱 아이콘을 적용했다.
- 개발자 계정 이전과 매출·지급·재무 보고서는 건드리지 않았다.

## 버전과 자산

| 항목 | iOS | Android |
| --- | --- | --- |
| 앱 버전 | `1.0.5` | `1.0.5` |
| 빌드 번호 | `19` | `5` |
| 식별자 | `com.eastnoise.alpha` | `com.eastnoise.alpha` |
| 스크린샷 | 10개 언어 x 8장, 1320 x 2868 | 10개 언어 x 8장, 1320 x 2640 |
| 출시 문구 | 국가별 현지화 | 국가별 현지화 |

- iOS IPA SHA-256: `67ebe6530f401ff8beb7722b273165b1053c2877f079ce015ef63bd19a97665f`
- Android AAB SHA-256: `d6fda684b9648ac74ee3398e703f69ad3303fd03df8b2b67411e939fe33868fc`
- Google Play 아이콘 SHA-256: `5bed455b380c8f0f0af4139afd46e58c9025d1e2f7c1dfbc3ea8c986b0ba181b`

## App Store Connect

- Archive: `1.0.5 (19)`, `com.eastnoise.alpha`, iOS 15.1 이상
- Apple 업로드 검증: 오류 없이 통과
- 서버 빌드 처리 상태: `VALID`
- 메타데이터 로케일: `ko`, `en-US`, `ja`, `es-ES`, `de-DE`, `fr-FR`, `pt-BR`, `zh-Hant`, `it`, `zh-Hans`
- 스크린샷: 모든 로케일 8장, 전부 `COMPLETE`
- 심사 상태: `WAITING_FOR_REVIEW`
- 출시 방식: `MANUAL`

심사 통과 뒤 자동 공개되지는 않는다. App Store Connect에서 수동으로 출시해야 한다.

## Google Play

- AAB 구조와 서명 검증: 통과
- Manifest: package `com.eastnoise.alpha`, version `1.0.5 (5)`, min SDK 24, target SDK 36
- 차단 권한: `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW` 없음
- 프로덕션 트랙 API 상태: `completed`
- 로케일: `ko-KR`, `en-US`, `ja-JP`, `es-ES`, `de-DE`, `fr-FR`, `pt-BR`, `zh-TW`, `it-IT`, `zh-CN`
- 10개 로케일의 제목·짧은 설명·전체 설명이 로컬 JSON과 일치
- 80개 스크린샷과 새 앱 아이콘이 서버 SHA-256과 일치
- 피처 그래픽은 기존 서버 파일과 로컬 해시가 같아 유지

Google Play API의 `completed`는 프로덕션 트랙 편집 커밋을 확인한 상태다. Play 심사와 국가별 공개 페이지 전파 완료는 별도로 확인해야 한다.

## 검증

- `npx tsc --noEmit`: 통과
- `npm run verify:core`: 통과
- `npm run verify:i18n`: 10개 언어, 언어별 90개 문구 통과
- `npm run verify:google-play`: 10개 언어, 스크린샷 80장 통과
- iOS Release archive, export, App Store upload validation: 통과
- Android Release AAB build, JAR signature, `bundletool validate`: 통과
- `git diff --check`: 통과
- `expo-doctor`: 17/18

`expo-doctor`의 한 건은 네이티브 폴더와 `app.json`을 함께 관리할 때 설정 동기화가 자동 보장되지 않는다는 기존 경고다. iOS 네이티브 버전은 직접 맞췄고 Android 릴리스 스크립트는 `expo prebuild --clean`을 거쳐 AAB를 생성했다.

## 남은 게이트

- iOS 심사 통과와 수동 출시
- Google Play 심사 또는 처리 완료와 국가별 공개 전파 확인
- 실제 iPhone과 Android 기기에서 업데이트 설치 후 핵심 흐름 확인
- 개발자 계정 이전 완료 뒤 새 계정 권한 검증

이번 작업에서는 계정 이전, 매출 보고서, 지급 설정, 가격, 판매 국가를 변경하지 않았다.
