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
- 새 Play 개발자 계정의 사용자 목록에서 26 계정: 0명

ALPHA 앱은 Firebase SDK나 Firebase 프로젝트를 사용하지 않는다. 알림은 기기 로컬 예약 방식이다.

## 구 26 계정에서 제거한 대상

다음 네 프로젝트는 결제 연결을 먼저 해제하고 `DELETE_REQUESTED`를 확인했다.

- 구 ALPHA Google Play 프로젝트
- STAY HARD 프로젝트
- My First Project
- Default Gemini Project

Default Gemini Project의 사용하지 않는 Gemini API 키는 프로젝트 삭제 전에 별도로 삭제했다. 프로젝트 삭제는 Google Cloud의 제한된 복구 기간 동안 되돌릴 수 있지만 일부 리소스는 더 일찍 제거될 수 있다.

구 Cloud Billing 계정 2개도 연결 프로젝트 0개를 다시 확인한 뒤 폐쇄했고 CLI 재조회에서 모두 `OPEN=False`를 확인했다.

## 사용자 결정과 별도 처리 범위

- 구 26 Google Play 개발자 계정과 그 안의 SCENE: 사용자가 직접 처리 중
- Gmail·Google Drive·회사 문서: 26 계정을 계속 사용하며 1730으로 이전하지 않음
- AdMob·AdSense: Play·Cloud 이전과 분리해 사용자가 별도로 처리
- gcloud·Firebase CLI와 Google 운영 콘솔의 기본 로그인 세션: 1730 계정 사용
- Google Payments: 26과 1730의 결제 프로필을 병행 보관하고, 신규 Play 정산은 1730 프로필을 사용

`eastnoise26@gmail.com` 문의 메일, Google Drive 문서와 과거 이력의 주소 표기는 의도적으로 유지한다. 이는 Google Cloud 프로젝트·Firebase 프로젝트·새 Play 개발자 계정 소유권 또는 IAM 권한이 26 계정에 남아 있다는 의미가 아니다.

Play 앱 이전 전 주문은 구 개발자 계정에 남고, 지급·수익·대량 내보내기 보고서는 앱과 함께 이전되지 않는다. 따라서 26 결제 프로필과 구 Play 계정은 필요한 재무 보고서 보관, 과거 주문의 환불·취소 대응, 미정산·세금 요청 확인이 끝나기 전 닫지 않는다. 결제 프로필 폐쇄는 거래·결제 정보를 영구 제거하고 다시 열 수 없으므로 현재 실행 대상이 아니다.

## Google Payments 처리 순서

1. 1730 Play Console의 결제 프로필에서 신규 매출의 지급 계좌, 법적 이름·주소와 세금 정보가 실제 운영 주체와 맞는지 확인한다.
2. 26 Play Console의 **보고서 다운로드 > 재무**에서 이전 전 지급·수익·대량 내보내기 보고서를 보관한다.
3. 이전 전 주문의 환불·취소는 구 개발자 계정에서 처리해야 하므로, 관련 주문과 미정산 금액이 남아 있는 동안 26 접근을 유지한다.
4. 브라질 세금 요청이 조세조약상 IRRF 감면 신청이라면 요청이 표시된 결제 프로필에 한국 과세당국 발급 거주자증명서를 제출한다. 승인 효과는 향후 지급분에만 적용되고 CIDE에는 적용되지 않는다. 정확한 제출 주체와 증명 내용은 세무사 또는 국세청에 확인한다.
5. 위 항목이 끝나도 과거 거래 조회가 필요하면 26 Payments 프로필은 보관한다. 폐쇄는 별도 필요가 확인된 경우에만 진행한다.

Cloud Billing 계정은 CLI/공개 REST API로 닫을 수 없어 Google Cloud Console의 **Billing > Account management > Close billing account**에서 폐쇄했다. 계정 기록 자체는 닫은 뒤에도 보고·감사 목적으로 삭제되지 않는다.

## 현재 경계

- 26 계정 소유의 활성 Cloud/Firebase 프로젝트, 새 ALPHA 프로젝트의 26 직접 IAM, 새 Play 개발자 계정의 26 사용자, 열린 구 Cloud Billing 계정은 현재 확인 범위에서 모두 0개다.
- 구 Play 개발자 계정과 SCENE은 사용자가 직접 처리 중이며, AdMob·AdSense도 별도 범위다.
- 회사 웹사이트·앱 고객 문의와 Gmail·Drive는 26을 유지한다. gcloud·Firebase CLI와 Google 운영 콘솔의 기본 세션은 1730을 사용한다.
- 1730 결제 프로필은 신규 Play 정산용, 26 결제 프로필은 이전 전 거래·보고서 대응용으로 구분한다. 26 프로필 폐쇄는 보류한다.
