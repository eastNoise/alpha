# ALPHA Android 1.0.6 릴리스 상태

검증일: 2026-09-08 KST

## 현재 상태 (2026-09-08)

한국 Google Play 공개 주소가 HTTP 200이며 공개 페이지 버전 데이터는 `1.0.6`이다. 한국 앱 재제공·공개 전파를 확인했다. 아래 검토 중 상태는 9월 3일 제출 이력이다. 다른 국가, 콘솔 잔여 변경, 사전 출시 보고서와 실제 Android 설치본 QA는 이 확인에 포함되지 않는다. 후속 정리는 `../post-release-status-2026-09-08.md`를 참조한다.

## 결론

`1.0.6 (6)`은 Expo SDK 57 업그레이드, 릴리스 빌드, 서명과 AAB 정적 검증을 완료했다. 새 1730 소유자 계정의 keyless Play API로 production edit을 커밋했고, Play Console에서 검토 전송까지 완료했다. 현재는 Google의 자동 사전 검사 뒤 심사로 전송되는 `검토 중인 변경사항` 단계이며 심사 승인·공개 전파는 완료로 간주하지 않는다.

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
- 한국 개발자 Account Details 필수 항목 저장: 통과
- 원격 production 트랙 `1.0.6 (6)`, status `completed`, 출시 노트 10개: API 재조회 통과
- Play Console `검토를 위해 변경사항 전송`: 완료

## 원격 제출 상태

첫 시도는 Play가 자동 심사 전송을 허용하지 않아 `changesNotSentForReview=true`를 요구했다. 스크립트에 검토 대기 커밋 옵션을 추가했다. 다음 시도에서 한국 개발자 계정의 Account Details 추가 정보가 필요하다는 정책 오류를 확인했다.

```text
To comply with Korean law, developers in Korea must provide additional information on the Account Details page.
```

실패 시 생성된 Google Play edit은 스크립트가 삭제했다. 사업자등록·통신판매업 신고·발급기관 필수 항목을 공식 등록 문서와 대조해 Play Console에 저장한 뒤 재시도했고, 원격 production 트랙은 `1.0.6 (6)`으로 커밋됐다. Play Console의 최종 검토 전송도 완료됐다.

자동 사전 검사 뒤 삭제된 앱을 다시 제공하기 위한 `업데이트 상태` 변경이 별도로 나타났다. 이를 전송하면서 기존 심사를 재시작한다는 경고를 확인하고 승인했으며, 전송 성공 토스트와 활동 로그의 제출 기록을 확인했다. 게시 개요는 이후에도 이 파생 행을 미제출 영역에 표시하지만 production `1.0.6 (6)`은 `검토 중인 변경사항`이다. 반복 전송은 기존 심사를 다시 취소하므로 다음 Google 상태 변경 전에는 재시도하지 않는다.

## 남은 위험과 다음 행동

- 앱 재제공용 `업데이트 상태` 행의 콘솔 표시와 실제 심사 receipt가 엇갈리므로 다음 Google 상태 변경 때 다시 대조해야 한다.
- 한국 공개 페이지의 앱 재제공·버전 `1.0.6` 확인 완료. 다른 국가와 콘솔 상세 상태는 별도 확인한다.
- 실제 Android 기기와 Play 사전 출시 보고서는 아직 확인하지 않았다.
- SDK 57 업그레이드로 iOS 최소 지원 버전이 15.1에서 16.4로 올라갔다. iOS `1.0.6 (20)`도 별도 제출해 `WAITING_FOR_REVIEW`이며 실제 기기 QA는 남아 있다.
- `npm audit --omit=dev`의 moderate 11건은 Expo CLI/Xcode 파서 계열 전이 의존성이다. SDK 권장 버전을 깨는 강제 업데이트는 적용하지 않았다.
