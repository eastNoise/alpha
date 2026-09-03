# ALPHA Google Play 1.0.6 제출 체크리스트

최종 확인: 2026-09-03 KST

## 현재 결론

- [x] Google Play 개발자 계정과 앱을 새 소유자 계정으로 이전
- [x] 새 Google Cloud 프로젝트와 keyless 서비스 계정으로 Play API 읽기·업로드 권한 확인
- [x] Expo SDK 57 기반 `1.0.6 (6)` 서명 AAB 생성 및 정적 검증
- [x] 새 Play 계정의 한국 개발자 Account Details 추가 정보 완료
- [x] API로 변경사항을 검토 대기 상태로 커밋
- [x] Play Console에서 **검토를 위해 변경사항 전송**
- [x] 앱 재제공용 `업데이트 상태` 변경의 **검토 다시 시작** 확인과 전송 성공 receipt 확인
- [ ] Play 심사 완료와 국가별 공개 페이지 전파 확인

`1.0.6 (6)`은 원격 production 트랙에 커밋됐고 Play Console에서 검토 전송까지 완료됐다. 앱이 삭제된 상태에서 다시 제공되기 위한 `업데이트 상태` 변경도 검토 재시작으로 전송했으며 성공 토스트와 활동 로그를 확인했다. 현재 production은 `검토 중인 변경사항`이고 승인·공개 전파는 아직 완료되지 않았다.

## 릴리스 산출물

- [x] 패키지: `com.eastnoise.alpha`
- [x] 버전: `1.0.6 (6)`
- [x] AAB: `release/google-play/build/ALPHA-1.0.6-vc6.aab` (로컬 산출물, Git 제외)
- [x] AAB SHA-256: `6037e8925252fc91b5f4ad4fbe0ef1139a94bfc944a10c58488b98e4fa2620a9`
- [x] 업로드 인증서 SHA-256이 기존 `1.0.5 (5)` AAB와 일치
- [x] 최소 SDK 24, 대상 SDK 36
- [x] JAR 서명 검증과 `bundletool validate` 통과
- [x] `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`가 병합 Manifest에 없음
- [x] 10개 로케일 업데이트 노트 작성
- [x] 기존 10개 로케일 스토어 문구와 스크린샷 80장 검증

## SDK 57 전환

- [x] Expo `57.0.19`, React Native `0.86.3`, React `19.2.3`으로 업데이트
- [x] Expo 권장 네이티브 모듈 버전으로 정렬
- [x] TypeScript `6.0.3`으로 업데이트하고 검증 스크립트 호환성 수정
- [x] React Compiler 활성화 후 Android production 번들 생성
- [x] iOS 최소 버전을 SDK 57 요구사항인 16.4로 갱신
- [x] iOS Prebuild 때 10개 언어 권한 문구가 유지되도록 로컬 config plugin 추가
- [x] `npx expo install --check` 통과
- [x] `expo-doctor` 20/20 통과
- [x] TypeScript, 핵심 상태 전이, 다국어, Play 에셋 검사 통과

네이티브 폴더와 `app.json`을 함께 관리한다는 Expo Doctor 일반 경고는 비활성화했다. Android 릴리스 빌드는 매번 `expo prebuild --clean`을 실행하고, iOS 현지화는 config plugin으로 재생성 가능하게 만들었기 때문이다.

## 계정 이전과 API

- 새 Google Cloud 프로젝트: `eastnoise-alpha-play`
- 기본 서비스 계정: `alpha-play-console-submit@eastnoise-alpha-play.iam.gserviceaccount.com`
- 인증 방식: 새 소유자 계정의 gcloud 인증을 이용한 keyless impersonation
- 사용자 관리형 서비스 계정 키 파일: 없음
- 이전 서비스 계정의 Play API 접근: 차단 확인
- 현재 production API 조회: `1.0.6 (6)`, `completed`, 출시 노트 10개

`scripts/google-play-release.cjs`는 `GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW=true`일 때 자동 심사 전송 없이 edit을 커밋한다. 다음 명령으로 이번 production edit을 커밋했다.

```sh
GOOGLE_PLAY_AAB=release/google-play/build/ALPHA-1.0.6-vc6.aab \
GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW=true \
node scripts/google-play-release.cjs
```

커밋 성공 뒤 Play Console에서 검토를 위해 변경사항을 전송했다. API의 `completed`는 edit/track 상태이지 심사 완료나 사용자 공개 완료를 뜻하지 않는다.

## 유지한 콘솔 설정

- 유료 앱 설정과 가격
- 카테고리, 판매 국가와 지역
- 개인정보 처리방침, 웹사이트, 고객지원 URL
- 앱 액세스, 광고, 대상 연령, 콘텐츠 등급, 건강 앱 선언, 데이터 보안 답변
- 기존 스토어 아이콘, 피처 그래픽, 스크린샷 80장

이번 업데이트는 앱의 로컬 저장 구조와 데이터 전송 방식을 바꾸지 않는다.

## 남은 운영 게이트

1. 게시 개요가 재제공용 `업데이트 상태` 행을 미제출 영역에 계속 표시하는지 다음 상태 변경 때 확인한다. 전송 성공 receipt와 활동 로그가 있으므로 같은 심사를 반복 재시작하지 않는다.
2. Play 심사·게시 상태와 국가별 공개 페이지를 따로 확인한다.
3. Play 사전 출시 보고서를 확인한다.
4. 실제 Android 기기에서 업데이트 설치, 알림, 사진 선택·크롭, 저장 복원을 확인한다.
