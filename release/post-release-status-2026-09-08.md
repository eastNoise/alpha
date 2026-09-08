# ALPHA 1.0.6 공개 이후 정리

확인일: 2026-09-08 KST. Owner: East Noise / Codex.

## 공개 버전

- iOS: App Store Connect `1.0.6`, `READY_FOR_SALE`, `downloadable=true`; 한국 공개 lookup `1.0.6`.
- Android: 한국 Play 공개 페이지 HTTP 200; 버전 필드 `1.0.6`. API 접근 정상.
- 이 문서의 Expo 패치는 기존 공개 1.0.6 바이너리에 포함되지 않는다. 후속 1.0.7을 양대 스토어에 제출했으며 세부 상태는 `release-status-1.0.7-2026-09-08.md`를 따른다.

## 로컬 유지보수

- Expo 57.0.20, ImageManipulator 57.0.16, ImagePicker 57.0.16, Notifications 57.0.17 및 npm/CocoaPods lock 정렬.
- Expo install check, Doctor 20/20, TypeScript, core, i18n, Google Play 자산 검증 통과.
- npm audit는 최종 0건이다. XML parser 항목은 패치 설치로 해소했고, Expo 도구 → xcode → uuid 경로는 xcode에만 `uuid: 11.1.1` override를 적용했다.
- xcode는 CommonJS `uuid.v4()`를 사용한다. 수정 버전의 CJS 제공을 확인하고 `verify:xcode`로 1,000개 ID 생성·형식·중복 및 Xcode 프로젝트 parse/write roundtrip을 검증했다. upstream xcode가 수정 버전을 수용하면 override를 제거한다. Owner: East Noise, 재검토: 다음 릴리스 또는 2026-10-08 중 먼저 도래하는 시점. Rollback: package.json override와 해당 lock 변경을 함께 되돌리고 audit 예외를 재평가한다.
- Android Release APK와 iOS Simulator Release 빌드 성공. 로컬 설치 및 Metro 없이 프로세스 실행 성공. 이는 공개 스토어 바이너리 실기기 QA를 대신하지 않는다.
- Android 신규 설치 → Begin → 알림 거부 → Today의 0/3 루틴과 권한 거부 안내 표시 확인. iOS 기존 테스트 기록이 있는 시뮬레이터에 업데이트 설치 후 DAY 79 / HARD 화면 표시 확인. 실제 사용자 기기 데이터로 검증한 것은 아니다.
- npm ci --ignore-scripts 재설치 뒤 Doctor 20/20 및 Xcode tooling 재검증 통과.

## 디자인 원본 보관

- Git 미추적 디자인 파일 735개, 378,098,580 bytes를 저장소 밖 `../release-artifacts/ALPHA/design-archive-20260908`로 이동했다.
- 각 파일의 이동 전후 SHA-256 일치 확인. 보관 폴더 `manifest.json`에 원본 상대 경로·크기·해시가 있다.
- Git 추적 스토어 자산은 보존했다. 보관 파일은 manifest 상대 경로로 원래 저장소에 복원할 수 있다. 삭제 작업은 하지 않았다.

## 인증 및 계정

- 노출된 Firebase CLI refresh token은 `firebase logout`의 Google revoke 요청 성공으로 폐기했다. 인증 원문은 문서에 기록하지 않는다.
- Firebase CLI 로컬 콜백 재인증 완료: 로그인 계정은 1730 하나다. 원격 로그인 방식은 OAuth 오류로 실패했으나 로컬 방식으로 복구했다.
- ALPHA 자체에는 Firebase/EAS 프로젝트 연결이 없다. EAS의 전역 로그인은 다른 제품에 영향이 있어 ALPHA 소유권 이전과 별도로 관리한다.
- 26 문의 주소·회사 웹사이트·Gmail/Drive·과거 Payments 보관 정책은 유지한다.

## 2026-09-08 후속 처리

- 사용자가 공개 설치본 실기기 QA 완료를 확인했다. 이전의 기기 연결 대기는 종료한다.
- Play Console 정상 접근 복구: 1.0.6 미게시 변경 없음 확인. 기존 사전 출시 보고서는 미생성 상태였다.
- 1.0.7 (7)을 production과 기존 alpha 비공개 테스트 트랙에 API로 커밋했다. 사전 출시 보고서 생성을 위해 같은 검증된 AAB를 테스트 트랙에서도 사용한다. 테스터·판매 국가·가격은 바꾸지 않았다.
- EAS CLI의 26 로컬 로그인 해제 완료. 회사 문의·Gmail/Drive 및 과거 정산 보관 정책은 그대로다.
- 새 릴리스 진행 상황은 `release-status-1.0.7-2026-09-08.md`에서 관리한다.

## 이전 미확인 항목 (후속 처리로 갱신)

- 실제 iPhone과 Android 공개 설치본 QA: 사용자 완료 확인. 상세 기기·테스트 결과는 사용자 확인 근거이며 Codex 직접 수행 결과와 구분한다. ALPHA는 계정 없는 로컬 앱이므로 로그인 QA는 해당하지 않는다.
- Play Console의 초기 렌더링 문제는 후속 조회에서 해소했다. 1.0.6 미게시 변경은 없고, 기존 사전 출시 보고서는 생성되지 않았음을 확인했다.
- 공개 iOS 1.0.6의 프레임워크 dSYM 누락: 앱 자체 dSYM은 보관 중이며 일부 프레임워크 심볼화가 제한된다. 새로 빌드한 dSYM은 UUID가 같지 않으면 이전 바이너리 복구에 사용할 수 없다. 원본 UUID 일치 심볼 확보가 필요하다.
