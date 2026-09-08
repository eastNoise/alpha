# ALPHA iOS 1.0.6 릴리스 상태

최종 갱신: 2026-09-08 KST

## 현재 상태 (2026-09-08)

App Store Connect와 한국 공개 lookup 모두 `1.0.6` 공개를 확인했다. `downloadable=true`, `READY_FOR_SALE`이며 공개 전파 대기는 종료했다. 아래 9월 4일 조회 결과는 당시 이력이다. 공개 설치본 실기기 QA와 프레임워크 dSYM 경고 추적은 남는다. 후속 로컬 패치·검증 상태는 `../post-release-status-2026-09-08.md`를 참조한다.

## 결론

Expo SDK 57 기반 `1.0.6 (20)`의 심사가 승인돼 App Store Connect API로 수동 출시 요청을 전송했다. 요청 직후 API 재조회 상태는 `READY_FOR_SALE`·`READY_FOR_DISTRIBUTION`이다. 한국 App Store 공개 조회는 아직 `1.0.5`를 반환하므로 `1.0.6` 공개 전파와 실제 업데이트 가능 상태는 별도로 확인해야 한다.

출시 요청 시각은 2026-09-04 10:58 KST다. Apple 안내상 수동 출시 뒤 스토어 반영에는 최대 24시간이 걸릴 수 있다.

## 산출물과 검증

- Release archive: `release/ios/build/ALPHA-1.0.6-20.xcarchive` (Git 제외)
- App Store IPA: `release/ios/build/export-1.0.6-20/ALPHA.ipa` (Git 제외)
- IPA SHA-256: `2ced7bbba4288d26b58f83f27534d78a2b40ed5b66011565b2c3117a983cff14`
- 번들: `com.eastnoise.alpha`, `1.0.6 (20)`, iOS 16.4 이상
- Release archive와 App Store export: 성공
- Apple Distribution 서명과 codesign strict 검증: 통과
- App Store 프로비저닝: `get-task-allow=false`, TestFlight 보고 활성, 유효기간 확인
- 암호화 신고: `ITSAppUsesNonExemptEncryption=false`
- App Store Connect 업로드: 성공, 서버 빌드 처리 `VALID`
- 10개 언어 메타데이터: 로컬 JSON과 원격 값 일치
- 10개 언어 x 8장 스크린샷: 원격 80장, 전부 `COMPLETE`, 순서 일치
- 콘텐츠 권리·카테고리·연령 등급: API 반영
- 빌드 20을 iOS 1.0.6에 연결
- 심사 승인: `PENDING_DEVELOPER_RELEASE` 확인
- 수동 출시 요청: App Store Connect API `201 Created`
- 출시 요청 직후 상태: `READY_FOR_SALE`·`READY_FOR_DISTRIBUTION`
- 한국 공개 조회: 아직 `1.0.5`, 전파 대기

## 자동화 보강

- `release/ios/ExportOptionsUpload.plist`: Xcode CLI의 App Store Connect 직접 업로드 설정
- `scripts/app-store-connect.py verify-metadata`: 10개 언어의 이름·부제·설명·키워드·URL·프로모션·업데이트 문구 원격 대조
- `scripts/app-store-connect.py verify-screenshots`: 로케일·파일명·순서·처리 상태 원격 대조
- `release/ios/build/`과 Python cache를 Git 제외 대상으로 추가

## 2026-09-04 수동 출시

- 대상이 `com.eastnoise.alpha`, iOS `1.0.6 (20)`, `PENDING_DEVELOPER_RELEASE`인지 API로 재확인한 뒤 해당 버전에만 출시 요청을 전송했다.
- 출시 요청은 성공했고 App Store Connect 원격 상태가 `READY_FOR_SALE`·`READY_FOR_DISTRIBUTION`으로 전환됐다.
- 한국 storefront 공개 API는 같은 시각 기존 `1.0.5`를 반환했다. 이는 출시 요청 실패가 아니라 공개 전파가 아직 끝나지 않은 상태로 분리해 추적한다.

## 남은 위험과 다음 행동

- 한국 App Store 공개 API `1.0.6` 전환 확인 완료 (2026-09-08 재조회).
- 실제 iPhone에서 업데이트 설치, 첫 실행, 알림, 사진 선택·크롭, 저장 복원을 확인한다.
- 업로드는 성공했지만 ExpoImageManipulator, React, ReactNativeDependencies, SDWebImage, hermesvm 프레임워크의 dSYM 누락 경고가 있었다. 앱 자체 dSYM은 포함됐으며 심사 차단 오류는 아니지만 해당 프레임워크 내부 크래시의 심볼화가 제한될 수 있다.
- 심사 제출·승인·수동 출시·공개 전파·실기기 QA를 각각 별도 상태로 유지한다.
