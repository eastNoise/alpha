# ALPHA Google 계정 이전 정리 상태

확인일: 2026-09-03 KST

## 새 1730 계정

- 역할: Google Play·Cloud·Firebase 운영/관리 계정
- 고객 문의 및 회사 웹사이트 공개 연락처: `eastnoise26@gmail.com` 유지
- Google Play 앱 소유권 이전: 완료
- 전용 Google Cloud 프로젝트 `eastnoise-alpha-play`: ACTIVE
- 새 결제 계정 연결: 활성
- Android Publisher API와 IAM Credentials API: 활성
- Play 제출 서비스 계정: `alpha-play-console-submit@eastnoise-alpha-play.iam.gserviceaccount.com`
- 인증: 사용자 관리형 키 파일 없이 gcloud keyless impersonation
- Play API 읽기·AAB 업로드·listing 쓰기: 확인
- 26 계정의 새 프로젝트 직접 IAM 바인딩: 없음
- 1730 계정이 조회 가능한 활성 Cloud 프로젝트 전체의 26 계정 직접 IAM 바인딩: 0건
- 26 계정으로 조회 가능한 Cloud 프로젝트: 0개

ALPHA 앱은 Firebase SDK나 Firebase 프로젝트를 사용하지 않는다. 알림은 기기 로컬 예약 방식이다.

## 구 26 계정에서 제거한 대상

다음 네 프로젝트는 결제 연결을 먼저 해제하고 `DELETE_REQUESTED`를 확인했다.

- 구 ALPHA Google Play 프로젝트
- STAY HARD 프로젝트
- My First Project
- Default Gemini Project

Default Gemini Project의 사용하지 않는 Gemini API 키는 프로젝트 삭제 전에 별도로 삭제했다. 프로젝트 삭제는 Google Cloud의 제한된 복구 기간 동안 되돌릴 수 있지만 일부 리소스는 더 일찍 제거될 수 있다.

## 아직 남은 항목

- 구 Cloud Billing 계정 2개: 연결 프로젝트 0개지만 `OPEN`
- 구 26 조직: 사용자 요청으로 나중에 처리
- 구 Google Play 개발자 계정: 사용자 요청으로 나중에 처리
- gcloud·Firebase·브라우저 로그인 세션: 사용자가 직접 로그아웃 예정

`eastnoise26@gmail.com` 문의 메일과 과거 이력의 주소 표기는 의도적으로 유지한다. 이는 Google Cloud 프로젝트·Firebase 프로젝트·Play 소유권 또는 IAM 권한이 26 계정에 남아 있다는 의미가 아니다.

Cloud Billing 계정은 CLI/공개 REST API로 닫을 수 없고 Google Cloud Console의 **Billing > Account management > Close billing account**에서 처리해야 한다. 계정 기록 자체는 닫은 뒤에도 보고·감사 목적으로 삭제되지 않는다.

## 남은 수동 작업

1. 26 계정으로 Google Cloud Console에 로그인한다.
2. 구 결제 계정 두 개를 각각 열고 연결 프로젝트가 0개인지 다시 확인한다.
3. **Account management > Close billing account**를 실행한다.
4. 조직·구 Play 개발자 계정·로그아웃은 기존 결정대로 별도 처리한다.
