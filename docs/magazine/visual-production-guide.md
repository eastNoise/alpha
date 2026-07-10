# ALPHA Magazine Visual Production Guide

Updated: 2026-07-10

## Purpose

This guide keeps ALPHA Magazine visuals consistent while the app implementation stays separate.

The goal is not to make motivational posters. The goal is to make a recognizable cold magazine system that can later point to the app.

## Visual Principles

1. Use real behavior as the image subject.
   - Phone in bed.
   - Alarm clock.
   - Unmade bed.
   - Dark desk.
   - Gym corner.
   - Convenience store receipt.
   - Dirty room floor.

2. Keep the ALPHA character as app-system texture.
   - Good: cropped header, paywall mood, Day 1 screen.
   - Bad: every Instagram post becomes anime-character motivation.

3. Prioritize Korean headline readability.
   - The hook is the asset.
   - Image is atmosphere, not the message.

4. Use one red accent.
   - Red bar.
   - Red logo.
   - Red CTA.
   - Do not flood every element red.

5. Do not use lifestyle-flex imagery.
   - No luxury cars.
   - No watches.
   - No fake business jets.
   - No "women want this man" framing.

## Format Specs

### Instagram feed cover

```text
Size: 1080 x 1350
Safe margins: 72px left/right
Top masthead: ALPHA MAGAZINE
Issue line: ISSUE 01 / ROUTINE
Headline: 3-5 Korean lines
Subcopy: 1 direct sentence
Footer: action + alpha.app
```

### Carousel inner slide

```text
Size: 1080 x 1350
Background: black or dark photo crop
Headline: one sentence
Body: max 2 lines
Slide number: optional, small
No more than one divider
```

### Reel cover

```text
Size: 1080 x 1920
Top: ALPHA MAGAZINE
Center: one hook
Bottom: one action
Do not place text over faces unless contrast is controlled
```

### Story poll

```text
Size: 1080 x 1920
Question: one direct behavior
Options: 2
Background: same post asset, darker
```

## Typography

Use a bold Korean sans-serif style.

If creating in design tools:

- Pretendard Black / Bold.
- Apple SD Gothic Neo Heavy if using macOS native.
- Avoid decorative display fonts.

Type scale for feed covers:

```text
Masthead: 42-48px
Issue: 28-32px
Headline: 82-104px
Subcopy: 36-44px
Footer: 32-36px
```

Rules:

- Do not use negative letter spacing.
- Avoid more than two font weights per image.
- Keep headline line breaks intentional.
- If the longest Korean word feels cramped, reduce font size instead of squeezing.

## Color System

Base:

```text
Black: #030303
Panel black: #09090A
White: #F6F6F7
Muted: #85858A
Red: #F11919
Dark red wash: rgba(241, 25, 25, 0.25-0.45)
Line: rgba(255, 255, 255, 0.12)
```

Do not use:

- Purple-blue gradients.
- Beige/cream/sand.
- Brown espresso palettes.
- Neon cyberpunk palettes.
- Random bright colors per topic.

## Asset Sources

Preferred source types:

- Original photos taken by team.
- Unsplash.
- Pexels.
- Public-domain or clearly licensed texture/photo sources.
- Generated assets only when a specific scene is needed and stock looks generic.

Before shipping, record:

```text
source_url
creator
license/access date
file_name
post_id
```

Local exploration assets currently used for mockups:

- `mockups/assets/unsplash-morning-clock.jpg`
- `mockups/assets/pexels-phone-bed.jpg`
- `mockups/assets/unsplash-dark-gym.jpg`
- `assets/visuals/onboarding_hero.png`
- `assets/visuals/today_fire.png`

These are exploration assets, not final approved production assets.

## Template A: Photo Hook Cover

Use when:

- The post is about a concrete daily behavior.
- The photo can show the behavior directly.

Structure:

```text
Top: ALPHA MAGAZINE
Issue line
Large hook
Red vertical bar + subcopy
Footer action
```

Examples:

- `너는 시간이 없는 게 아니다`
- `눈뜨자마자 폰을 들면 하루는 이미 밀린다`
- `돈이 없는 게 아니라 새고 있다`

## Template B: Black Editorial Slide

Use when:

- Explaining the logic behind the hook.
- Avoiding visual noise in carousel inner slides.

Structure:

```text
Small label
One sentence headline
Short supporting copy
One red line or marker
```

Examples:

- `문제는 의지가 아니다`
- `시작 전에 져버리는 구조다`
- `작은 허락이 한 달을 만든다`

## Template C: ALPHA System Screen

Use when:

- Showing app-adjacent concepts.
- Day 1, diagnosis, paywall, streak, closing ritual.

Structure:

```text
Black app-like surface
Cropped ALPHA illustration header
Score / mission / progress UI
One red CTA
```

Examples:

- `통제력 점수 38 / 100`
- `오늘의 통제 미션`
- `Day 2부터 진짜 코스가 열린다`

## Production Checklist

Before posting:

- Hook is readable at phone thumbnail size.
- Post attacks a habit, not a person/group.
- One action is clear.
- Red accent is used once or twice only.
- CTA does not sound like generic app advertising.
- No fake masculinity/flex imagery.
- If using external asset, source is recorded.
- If using generated asset, it does not look like generic AI slop.
- Text is not clipped.
- Contrast is strong in both feed and profile grid.

## Current Visual Direction Decision

Use this split:

```text
Instagram Magazine: real photos, editorial black overlay, sharp red accent.
App Screens: existing ALPHA illustrations cropped as mood/system texture.
Paywall: real world discipline imagery + ALPHA red CTA.
```

Do not make the Instagram account depend on the anime-style ALPHA character. The character can belong to the app world, while the magazine should feel closer to real daily failure and real daily control.
