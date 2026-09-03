# ALPHA Android 1.0.6 릴리스 상태

검증일: 2026-09-03 KST

## 결론

`1.0.6 (6)`은 Expo SDK 57 업그레이드, 릴리스 빌드, 서명과 AAB 정적 검증까지 완료됐다. 새 1730 소유자 계정의 keyless Play API로 앱 조회와 AAB 업로드도 성공했으나, production edit commit은 새 한국 개발자 계정의 Account Details 추가 정보 미완료로 차단됐다. 따라서 이 문서 시점에는 심사 제출 완료로 간주하지 않는다.

## 변경 내용

- Expo SDK 54에서 SDK 57.0.19로 업그레이드
- React Native 0.81.5에서 0.86.3, React 19.1.0에서 19.2.3으로 업그레이드
- Expo SDK 57 권장 모듈 버전과 TypeScript 6.0.3 적용
- React Native 0.86에서 제거된 `StyleSheet.absoluteFillObject` 사용 수정
- TypeScript 6 CLI 변경에 맞춰 핵심·다국어 검증 스크립트 수정
- React Compiler 활성화
- iOS 16.4 최소 버전과 SDK 57 네이티브 프로젝트 재생성
- iOS Prebuild에서도 10개 언어 사진 권한 문구가 보존되도록 config plugin 추가
- 앱 버전 `1.0.6`, Android version code `6` 적용
- 10개 언어 출시 노트 갱신
- Play API 기본 인증을 새 서비스 계정의 keyless impersonation으로 전환
- Google 운영 계정은 1730으로 전환하되 개인정보처리방침·지원 페이지의 고객 문의 주소는 26으로 유지

## 검증 증거

- Node.js: `26.3.0` (프로젝트 최소 요구사항 `>=22.13.0`)
- `npx expo install --check`: 통과
- `npx expo-doctor`: 20/20 통과
- `npx tsc --noEmit`: 통과
- `npm run verify:core`: 통과
- `npm run verify:i18n`: 10개 언어, 각 90개 문구와 네이티브 권한 문구 통과
- `npm run verify:google-play`: 10개 스토어 로케일, 스크린샷 80장 통과
- Android `bundleRelease`: 성공
- React Compiler가 켜진 production JS bundle: 성공
- AAB JAR 서명: 통과
- `bundletool validate`: 통과
- Manifest: `com.eastnoise.alpha`, `1.0.6 (6)`, min 24, target 36
- 금지 권한 5종: 없음
- AAB SHA-256: `6037e8925252fc91b5f4ad4fbe0ef1139a94bfc944a10c58488b98e4fa2620a9`
- 기존 `1.0.5 (5)` AAB와 업로드 인증서 일치
- iOS Simulator Debug 빌드: 성공
- 새 서비스 계정 Play API 읽기: 통과
- 새 서비스 계정 AAB 업로드와 listing 쓰기: 통과

## 원격 제출 상태

첫 시도는 Play가 자동 심사 전송을 허용하지 않아 `changesNotSentForReview=true`를 요구했다. 스크립트에 검토 대기 커밋 옵션을 추가했다. 두 번째 유효 커밋 시도는 다음 계정 정책 오류로 차단됐다.

```text
To comply with Korean law, developers in Korea must provide additional information on the Account Details page.
```

각 실패 시 생성된 Google Play edit은 스크립트가 삭제했다. 현재 원격 production 트랙은 여전히 `1.0.5 (5)`이며, `1.0.6 (6)` 제출·심사·공개는 미완료다.

## 남은 위험과 다음 행동

- `remote_dashboard_needed`: Play Console Account Details에 실제 한국 개발자 정보를 입력해야 한다. 본인확인·법적 정보는 자동 추정하지 않는다.
- Account Details 완료 뒤 API edit commit과 Play Console의 최종 검토 전송을 각각 확인한다.
- 실제 Android 기기와 Play 사전 출시 보고서는 아직 확인하지 않았다.
- SDK 57 업그레이드로 iOS 최소 지원 버전이 15.1에서 16.4로 올라갔다. 이번 제출은 Android 전용이며 iOS 업데이트는 별도 빌드·기기 QA·심사가 필요하다.
- `npm audit --omit=dev`의 moderate 11건은 Expo CLI/Xcode 파서 계열 전이 의존성이다. SDK 권장 버전을 깨는 강제 업데이트는 적용하지 않았다.
