# ALPHA Magazine Asset Source Register

Updated: 2026-07-10

## Purpose

Track every external or generated visual asset used for ALPHA Magazine mockups and production.

Do not publish or commit source stock files without a final license/source pass.

## Required Fields

For every production asset, record:

```text
asset_id:
file_name:
post_or_screen:
source_type:
source_url:
creator:
license_or_terms:
accessed_at:
usage:
production_status:
notes:
```

## Status Values

```text
candidate
mockup_only
approved_for_post
needs_replacement
retired
```

## Current Mockup Assets

### A001

```text
asset_id: A001
file_name: mockups/assets/unsplash-morning-clock.jpg
post_or_screen: Day 1 magazine cover mockup
source_type: external stock candidate
source_url: https://unsplash.com/photos/nqr6-Ix22EQ
creator: Unsplash creator, verify on source page before production
license_or_terms: Unsplash License, verify before production
accessed_at: 2026-07-10 KST
usage: Morning/alarm routine image for "너는 시간이 없는 게 아니다"
production_status: mockup_only
notes: Direction works. Before posting, re-check source page and creator attribution.
```

### A002

```text
asset_id: A002
file_name: mockups/assets/pexels-phone-bed.jpg
post_or_screen: Day 2 magazine cover mockup
source_type: external stock candidate
source_url: https://www.pexels.com/photo/young-woman-sitting-in-bed-in-dark-with-cellphone-8036686/
creator: Pexels creator, verify on source page before production
license_or_terms: Pexels License, verify before production
accessed_at: 2026-07-10 KST
usage: Phone-in-bed dopamine image for "눈뜨자마자 폰을 들면"
production_status: needs_replacement
notes: Behavior is right, but the image reads too lifestyle/female-coded for the male-first ALPHA target. Replace with a darker, less influencer-like phone/bed image before publishing.
```

### A003

```text
asset_id: A003
file_name: mockups/assets/unsplash-dark-gym.jpg
post_or_screen: ALPHA PASS paywall mockup
source_type: external stock candidate
source_url: https://unsplash.com/photos/LtvqPsbyYvg
creator: Unsplash creator, verify on source page before production
license_or_terms: Unsplash License, verify before production
accessed_at: 2026-07-10 KST
usage: Dark gym discipline image for paywall mood exploration
production_status: mockup_only
notes: Good enough for paywall direction. Avoid visible brand marks if final image has recognizable logos.
```

### A004

```text
asset_id: A004
file_name: assets/visuals/onboarding_hero.png
post_or_screen: Day 3 bed/routine mockup and app mood texture
source_type: repo asset
source_url: local repository asset
creator: Existing ALPHA app asset, origin needs team confirmation
license_or_terms: Internal asset assumption, verify before external publication
accessed_at: 2026-07-10 KST
usage: ALPHA character/mood crop
production_status: mockup_only
notes: Works for app-system texture. Do not make this the main Instagram identity before confirming ownership and brand direction.
```

### A005

```text
asset_id: A005
file_name: assets/visuals/today_fire.png
post_or_screen: Day 1 app screen mockup
source_type: repo asset
source_url: local repository asset
creator: Existing ALPHA app asset, origin needs team confirmation
license_or_terms: Internal asset assumption, verify before external publication
accessed_at: 2026-07-10 KST
usage: Cropped app header mood texture
production_status: mockup_only
notes: Strong visual intensity, but should stay inside app/promo context rather than all magazine posts.
```

## Missing Assets To Source

### M001: Male-first phone-in-bed image

Need:

- Dark room.
- Phone glow.
- No bright lifestyle palette.
- No influencer bedroom styling.
- Prefer hand/phone/bed crop over identifiable model face.

Use for:

- Day 2 cover.
- Day 3 reel.

### M002: Unmade bed / bed-making image

Need:

- Realistic unmade bed.
- Dark or neutral room.
- No luxury hotel look.
- No romantic/lifestyle styling.

Use for:

- Day 4 carousel.
- Day 5 reel.

### M003: Receipt / convenience store spending image

Need:

- Receipt, convenience store counter, delivery app payment, or small purchase evidence.
- Should feel like money leaking, not finance advice.

Use for:

- Day 9 money post.

### M004: Dirty room floor image

Need:

- Clothes, cables, packaging, or desk mess.
- Realistic but not disgusting.
- Needs enough dark empty space for typography.

Use for:

- Day 12 room post.

## Production Rule

Before final posting, every `mockup_only` asset must become either:

```text
approved_for_post
```

or:

```text
needs_replacement
```

No production post should use an unregistered external asset.
