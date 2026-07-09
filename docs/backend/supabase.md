# ALPHA Supabase Backend

## 목표

ALPHA 앱은 로컬 우선으로 동작하고, Supabase 로그인이 활성화되면 같은 `AppState`를 사용자 계정에 동기화한다. 화면과 도메인 로직은 Supabase API를 직접 호출하지 않고 `src/backend` 저장소 계층만 통한다.

## 설정 순서

1. Supabase 프로젝트를 만든다.
2. SQL Editor에서 `supabase/schema.sql` 전체를 실행한다.
3. Project Connect 또는 API Keys 화면에서 Project URL과 Publishable key를 복사한다.
4. 루트에 `.env`를 만들고 `.env.example` 형식으로 값을 넣는다.
5. Supabase Authentication Providers에서 Apple, Google을 켠다.
6. 앱을 다시 빌드한다. Expo public env는 JS 번들에 포함되므로 값 변경 후 재시작/재빌드가 필요하다.

## 현재 테이블

- `profiles`: Supabase Auth 사용자에 붙는 앱 프로필.
- `alpha_state_snapshots`: v19 앱 상태 전체 스냅샷. `schema_version`으로 마이그레이션 경계를 둔다.
- `push_tokens`: 실제 원격 푸시 발송용 Expo push token 저장소. EAS project id가 없으면 앱은 토큰 저장을 건너뛰고 로컬 알림만 사용한다.

## 알림 정책

- 현재 앱은 `expo-notifications`로 매일 21:30 로컬 “하루 마감” 알림을 예약한다.
- 사용자가 설정에서 알림을 끄면 예약 알림을 취소한다.
- Supabase 로그인 상태이고 EAS project id가 있는 빌드라면 Expo push token을 `push_tokens`에 저장한다.
- 원격 푸시 발송 서버는 아직 만들지 않았다. 나중에 Supabase Edge Function에서 `push_tokens`를 읽어 Expo Push API로 발송하면 된다.

## 햅틱 정책

- `expo-haptics`로 루틴 체크, 마감, 저장, 삭제, 설정 토글에 피드백을 준다.
- 설정에서 “탭 피드백 설정”을 끄면 모든 햅틱 호출을 무시한다.

## 보안 기준

- 앱에는 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 넣는다.
- `service_role` 또는 secret key는 절대 앱 코드/환경 변수에 넣지 않는다.
- 모든 공개 스키마 테이블은 RLS를 켜고, 정책은 `(select auth.uid()) = user_id` 또는 `id` 소유권 조건을 사용한다.

## 확장 계획

결제, 랭킹, 고급 통계처럼 서버 조회가 늘어나면 `alpha_state_snapshots`를 유지한 채 `courses`, `daily_records`, `routines` 계열 정규화 테이블을 추가한다. 앱 화면은 저장소 인터페이스만 보게 유지하면 UI와 비즈니스 로직을 다시 뜯지 않아도 된다.
