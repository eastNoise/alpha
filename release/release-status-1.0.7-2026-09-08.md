# ALPHA 1.0.7 릴리스

확인일: 2026-09-08 KST. 대상: `com.eastnoise.alpha`.

## 변경 및 QA

- Expo 57.0.20 패치와 네이티브 모듈 정렬, xcode 도구의 uuid 보안 패치를 새 바이너리에 포함한다.
- 버전: Android 1.0.7 (7), iOS 1.0.7 (21).
- 10개 언어 업데이트 노트를 안정성·호환성 개선으로 갱신했다. 기존 스토어 소개·이미지·가격·판매 국가를 유지한다.
- 공개 1.0.6 실기기 QA는 사용자 완료 확인. 이번 소스는 Expo Doctor 20/20, TypeScript, core, i18n, 스토어 자산, Xcode tooling, npm audit 0건을 통과했다.
- Android 서명 Release AAB 및 iOS Release archive 생성 성공. 직전 동일 패치 소스의 양 플랫폼 시뮬레이터 Release 설치·재실행도 검증했다.

## Android

- AAB SHA-256: `727e2b7712288e122cfabc6c502db8b85560c3147a66e64a31f3f7abcf6eb856`.
- 1730 keyless 서비스 계정으로 production 1.0.7 (7) 업로드·커밋 성공, `changesNotSentForReview=false`.
- Console: 검토 중인 변경사항의 production 1.0.7 (7), 빠른 사전 검사 진행 중. 관리형 게시 꺼짐.
- 기존 alpha 비공개 테스트 트랙에도 동일 version code 7을 커밋했다. 테스터 그룹 변경 없음. 사전 출시 보고서는 기존 미생성이었고 새 결과는 별도 확인해야 한다.

## iOS

- Release archive 생성 성공. App Store Connect 1.0.7 생성 및 10개 언어 메타데이터 대조 성공.
- 스크린샷 10개 언어 × 8장 = 80장 COMPLETE, 원격 순서 대조 통과.
- 로컬 배포 인증서 부재로 최초 export 실패. 새 Apple Distribution 인증서와 ALPHA 전용 App Store 프로필을 발급했다. 전용 release keychain에 codesign 접근을 구성하고 기존 keychain은 유지했다.
- 인증서·프로필·비공개 키는 로컬 비공개 설정 경로에서 관리하며 Git에 포함하지 않는다.
- App Store Connect 업로드 성공, 빌드 21 `VALID` 확인 후 1.0.7에 연결했다. 10:30 KST 심사 제출 결과 `WAITING_FOR_REVIEW`, submission `1240c98f-8c05-489f-b8a8-b453d6761a07`.
- 출시 방식은 `AFTER_APPROVAL`로 변경하고 API 재조회했다. 승인 후 자동 출시하며, 심사 제출을 사용자 공개로 간주하지 않는다.

## dSYM

- `node scripts/supplement-ios-dsyms.cjs <archive.xcarchive>`로 프레임워크와 dSYM UUID를 대조한다. 일치하는 파일만 복사하고 기존 파일은 덮어쓰지 않는다.
- 1.0.7 ExpoImageManipulator의 누락 dSYM을 Pods에서 확보하고 UUID 일치를 확인해 아카이브에 보충했다.
- React, ReactNativeDependencies, SDWebImage, hermesvm은 로컬 Pods 및 공식 React Native 캐시 tarball에 일치하는 dSYM이 없다. 앱 자체 dSYM은 포함돼 있다. 이 네 프레임워크의 내부 크래시 심볼화 제한은 남는다.
- 기존 1.0.6의 누락 5개는 신규 dSYM과 UUID가 달라 대체할 수 없다. 원본 provider 심볼이 필요한 기존 이슈로 남긴다.

## Google 계정 경계 및 지급 상태

- EAS 로컬 26 로그인 해제. ALPHA 운영 Play API는 1730이고 문의 주소는 26을 유지한다.
- Play Payments는 지급 보류·본인 확인 심사 진행 중이다. 현재 화면에는 추가 자료 제출 요청이 없다. Google의 심사 완료가 필요하며 승인으로 기록하지 않는다.
- 별도 구 Play/SCENE·AdMob/AdSense 삭제, 과거 Payments 폐쇄, 15% 수수료 약관 수락은 실행하지 않았다. 기존 보관 정책과 법적 계정 관계 확인이 필요하며 ALPHA 릴리스 수정 대상과 구분한다.

## 보관

- 바이너리와 서명 관련 로그: `/Users/josugeun/Projects/East-Noise/release-artifacts/ALPHA/1.0.7`.
- 공개 1.0.6 바이너리와 과거 디자인 원본은 계속 보관한다.

## 남은 외부 상태

- Apple 심사·자동 출시 및 한국 공개 1.0.7 전파 확인.
- Google 빠른 검사·심사·자동 게시 및 한국 공개 1.0.7 전파 확인. production과 Alpha 모두 검토 중인 변경사항에 있으며 별도 전송 대기 항목은 없다.
- Play 사전 출시 보고서 생성·결과 확인. 아직 보고서가 없어 통과로 기록하지 않는다.
- Google Payments 본인 확인 심사와 지급 보류 해제. 추가 자료 요청이 생기면 계정 소유자 대응이 필요하다.
- upstream 프레임워크 4개의 정확한 UUID dSYM 확보는 미해결이다. 임의 재빌드 심볼로 대체하지 않는다.
