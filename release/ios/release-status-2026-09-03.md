# ALPHA iOS 1.0.6 릴리스 상태

검증일: 2026-09-03 KST

## 결론

Expo SDK 57 기반 `1.0.6 (20)`을 App Store Connect에 업로드하고 빌드·메타데이터·스크린샷·등급 정보를 연결한 뒤 심사 제출했다. App Store Connect API 재조회 상태는 `WAITING_FOR_REVIEW`다. 출시 방식은 `MANUAL`이므로 심사 승인 뒤에도 수동 출시와 공개 전파 확인이 별도로 필요하다.

현재 공개된 iOS `1.0.5`는 App Store Connect API에서 `READY_FOR_SALE`이다.

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
- 심사 제출: `WAITING_FOR_REVIEW`

## 자동화 보강

- `release/ios/ExportOptionsUpload.plist`: Xcode CLI의 App Store Connect 직접 업로드 설정
- `scripts/app-store-connect.py verify-metadata`: 10개 언어의 이름·부제·설명·키워드·URL·프로모션·업데이트 문구 원격 대조
- `scripts/app-store-connect.py verify-screenshots`: 로케일·파일명·순서·처리 상태 원격 대조
- `release/ios/build/`과 Python cache를 Git 제외 대상으로 추가

## 남은 위험과 다음 행동

- Apple 심사 승인 뒤 수동 출시하고 한국 App Store 공개 페이지와 실제 업데이트 가능 상태를 확인한다.
- 실제 iPhone에서 업데이트 설치, 첫 실행, 알림, 사진 선택·크롭, 저장 복원을 확인한다.
- 업로드는 성공했지만 ExpoImageManipulator, React, ReactNativeDependencies, SDWebImage, hermesvm 프레임워크의 dSYM 누락 경고가 있었다. 앱 자체 dSYM은 포함됐으며 심사 차단 오류는 아니지만 해당 프레임워크 내부 크래시의 심볼화가 제한될 수 있다.
- 심사 제출·승인·수동 출시·공개 전파·실기기 QA를 각각 별도 상태로 유지한다.
