# ALPHA Global Store Copy

- updated: 2026-09-11
- status: current
- App Store source of truth: `release/app-store-metadata.json`
- Google Play source of truth: `release/google-play/store-listings.json`

이 문서는 스토어 카피의 사람이 읽는 색인이다. 실제 제출 문자열은 위 JSON을 기준으로 하며, 이 문서에 상세 설명을 중복 복사하지 않는다.

## Product contract

- 앱은 `BASIC → STANDARD → HARD`의 3단계 자기통제 프로그램이다.
- 각 과정은 30일이고, 세 과정을 한 번에 통과하는 기본 여정은 90일이다.
- 완료한 날과 미완료한 날이 모두 기록된다.
- 계정은 필요하지 않으며 기록은 기기에 저장된다.
- ALPHA 전체를 단일 30일 프로그램으로 표현하지 않는다.
- 90일을 과학적으로 보장된 변화 기간처럼 표현하지 않는다.

## Current localized names and subtitles

| Locale | Name | Subtitle |
| --- | --- | --- |
| ko | ALPHA - 90일 자기통제 | 90일로 네 인생을 다시 세워라 |
| en-US | ALPHA - 90-Day Discipline | Rebuild Your Life in 90 Days |
| ja | ALPHA - 90日間の自己規律 | 90日で人生を立て直せ |
| es-ES | ALPHA - Disciplina en 90 días | Reconstruye tu vida en 90 días |
| de-DE | ALPHA - 90 Tage Disziplin | Bau dein Leben in 90 Tagen neu |
| fr-FR | ALPHA - Discipline en 90 jours | Rebâtis ta vie en 90 jours |
| pt-BR | ALPHA - Disciplina em 90 dias | Reconstrua sua vida em 90 dias |
| zh-Hant | ALPHA - 90天自律養成 | 用90天，重新建立你的人生 |
| it | ALPHA - Disciplina: 90 giorni | Ricostruisciti in 90 giorni |
| zh-Hans | ALPHA - 90天自律养成 | 用90天，重建你的人生 |

## English message hierarchy

1. `A fixed 90-day discipline program.`
2. `BASIC, STANDARD, and HARD each run for 30 days.`
3. `Complete your routines, close the day, and keep an honest record.`
4. `No account is required. Your records stay on your device.`

Reddit 등 커뮤니티 홍보에서는 다음 보조 포지셔닝을 사용한다.

> ALPHA is a fixed 90-day discipline program for people who don't want to design another productivity system.

브랜드의 ALPHA는 타인 지배나 지위가 아니라 자기통제로 정의한다.

> ALPHA isn't about dominating other people. It's about keeping promises to yourself.

상세 Reddit 채널·카피·크리에이티브 기준은 `docs/marketing/reddit-growth-research-2026-09-11.md`를 참고한다.

## Validation

스토어 카피를 변경할 때는 다음을 함께 확인한다.

```bash
jq -e '.localizations | length == 10' release/app-store-metadata.json
jq -e '.localizations | length == 10' release/google-play/store-listings.json
rg -n 'ALPHA is a 30-day discipline program|ALPHA는 말이 아니라 반복으로 자신을 다시 만드는 30일' \
  release/app-store-metadata.json release/google-play/store-listings.json
```

마지막 검색은 과거의 “전체가 30일” 표현이 다시 들어오지 않았는지 검토하기 위한 것이다. 각 과정이 30일이라는 정확한 설명은 유지한다.
