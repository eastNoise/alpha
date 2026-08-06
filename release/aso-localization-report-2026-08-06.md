# ALPHA ASO 다국어 현지화 보고서

작업일: 2026-08-06
기준 언어: 한국어 승인본
상태: 양 스토어 10개 언어 메타데이터·스크린샷 반영 및 API 재검증 완료

## 공통 포지셔닝

- BASIC, STANDARD, HARD는 각각 30일이며 기본 여정은 90일이다.
- 핵심 행동은 매일 루틴 완료, 하루 마감, 짧은 회고, 성공과 실패의 기록이다.
- 다음 과정은 기준 충족 후 열리고, 미달 시 같은 과정을 다시 시작할 수 있다.
- 계정은 필요하지 않으며 기록은 기기에 저장된다.

## 현지화 결과

| iOS | Google Play | 앱 이름 |
| --- | --- | --- |
| `ko` | `ko-KR` | `ALPHA - 90일 자기통제` |
| `en-US` | `en-US` | `ALPHA - 90-Day Discipline` |
| `ja` | `ja-JP` | `ALPHA - 90日間の自己規律` |
| `es-ES` | `es-ES` | `ALPHA - Disciplina en 90 días` |
| `de-DE` | `de-DE` | `ALPHA - 90 Tage Disziplin` |
| `fr-FR` | `fr-FR` | `ALPHA - Discipline en 90 jours` |
| `pt-BR` | `pt-BR` | `ALPHA - Disciplina em 90 dias` |
| `zh-Hant` | `zh-TW` | `ALPHA - 90天自律養成` |
| `it` | `it-IT` | `ALPHA - Disciplina: 90 giorni` |
| `zh-Hans` | `zh-CN` | `ALPHA - 90天自律养成` |

메타데이터 원본:

- iOS: `release/app-store-metadata.json`
- Google Play: `release/google-play/store-listings.json`
- Google Play 출시 노트: `release/google-play/release-notes.json`

## 스크린샷

- iOS 제출용: `release/screenshots/upload` 아래 10개 언어, 각 6장
- Google Play 제출용: `release/google-play/screenshots` 아래 10개 언어, 각 6장
- 렌더 원본과 언어별 카피: `release/aso-mockups/2026-08-06/v2-refined`
- 공통 구성: 앞 3장 연결형 90일 약속, 뒤 3장 오늘·기록·과정의 실제 앱 UI

## 검증

- App Store 이름·부제·키워드·프로모션 문구·설명 길이 통과
- Google Play 제목·짧은 설명·전체 설명 길이 통과
- iOS 60장: `1320 x 2868`, JPEG, 알파 채널 없음
- Google Play 60장: `1320 x 2640`, JPEG, 알파 채널 없음
- 8개 추가 언어의 iOS·Android 96장은 렌더 원본과 바이트 단위 일치
- 16개 전체 미리보기에서 제목, 보조 문구, 앱 컴포넌트 잘림 없음

## 남은 확인

- App Store Connect `1.0.4`와 Google Play에 업로드를 완료했다. App Store 60장은 모두 `COMPLETE`, Google Play 60장은 서버와 로컬 SHA-256이 일치한다.
- Google Play 한국 공개 페이지는 새 이름과 짧은 설명이 노출된다. App Store 공개 페이지는 `1.0.4` 미제출 상태라 기존 버전을 유지한다.
- 콘솔 시각 미리보기 캡처와 공개 스토어 반영 시점 확인은 심사·게시 상태와 분리해 남겨둔다.
- 국가별 원어민 마케팅 검수는 별도 외부 검수 단계로 남는다.
- 다음 단계는 제출 직전 개인정보·데이터 보안·가격·판매 국가의 콘솔 캡처다.
