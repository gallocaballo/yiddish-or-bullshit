# BULLSHIT — Share Card Redesign

## Claude Code Build Instructions — March 6, 2026

This document describes the share card redesign ("The Ticker Tape, Light Mode"). It replaces the current dark-mode share card with a light-mode design that matches the game's editorial aesthetic. Apply these changes to the existing codebase.

---

## Design Overview

The new share card uses a **light background (#F7F5F0)** matching the game's own surface color, with serif typography (Georgia) matching the game's headline font. The layout is split into two columns: a score block on the left and a round-by-round horizontal bar chart on the right. Each bar's width represents the confidence level used on that round, and its color indicates correct (teal) or incorrect (amber). This encodes the *narrative* of the session — what risks the player took and where they were right or wrong — rather than showing uniform circles.

### What This Replaces

The current share card is dark-mode (#0D0D0D background) with uniform-sized circles for each round, all showing the same percentage label. The new card:

- Switches to light mode (#F7F5F0) to match the game's visual identity
- Replaces uniform circles with variable-width horizontal bars that encode confidence level
- Uses the 5-tier confidence labels (Guess / Hunch / Pretty Sure / Damn Sure / No Doubt) instead of percentage numbers
- Adds a provocative CTA: "I spotted the fake headlines. Can you?"
- Formats the date as readable text (e.g., "March 6, 2026"), not ISO string
- Uses Georgia serif throughout to match the game

---

## Visual Spec

```
┌─────────────────────────────────────────────────────────────────┐
│ ███████████████████████████████████████████████████████████████ │  ← 3px solid #0D0D0D top rule
│                                                                 │
│  Bullshit                              March 6, 2026            │  ← Georgia bold 22px / italic 12px #999
│  ─────────────────────────────────────────────────────────────  │  ← 1px rule, rgba(0,0,0,0.08)
│                                                                 │
│   485              1 ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░ Hunch        ✓  │
│   points           2 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░ Pretty Sure  ✓  │
│                    3 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ Damn Sure    ✗  │  ← amber bar
│   ───              4 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ No Doubt     ✓  │
│   4       4        5 ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░ Hunch        ✓  │
│   correct streak                                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │  ← 1px rule, rgba(0,0,0,0.06)
│  I spotted the fake headlines. Can you?       playbullshit.com  │
└─────────────────────────────────────────────────────────────────┘
```

**Dimensions:** 1200 × 630px (Open Graph standard). Render at 2× for retina sharpness.

---

## Color Palette (unchanged from PRD, applied to light background)

| Element | Value | Notes |
|---|---|---|
| Card background | #F7F5F0 | Same warm off-white as game |
| Top rule | #0D0D0D | 3px solid bar, full width |
| Title text | #0D0D0D | "Bullshit" in Georgia bold |
| Score number | #0D0D0D | Large, Georgia bold |
| Date text | #999999 | Italic, right-aligned |
| Correct bar fill | #0D7A55 → #0a6345 | Linear gradient left-to-right, 85% opacity |
| Incorrect bar fill | #A05C00 → #8a5200 | Linear gradient left-to-right, 85% opacity |
| Bar background (empty) | rgba(0,0,0,0.04) | Subtle track |
| Bar label text | #FFFFFF | Bold, inside the filled portion of the bar |
| ✓ / ✗ icons | #0D7A55 / #A05C00 | Match bar color |
| Correct stat number | #0D7A55 | Teal |
| Streak stat number | #A07820 | Gold |
| Stat labels | #999999 | Uppercase, letter-spaced |
| CTA text | #555555 | Italic |
| URL text | #999999 | Right-aligned |
| Divider rules | rgba(0,0,0,0.06–0.08) | 1px horizontal rules |

---

## Typography

| Element | Font | Size (at 1200px) | Weight | Style |
|---|---|---|---|---|
| Title "Bullshit" | Georgia, serif | 44px | Bold | Normal |
| Date | Georgia, serif | 24px | Normal | Italic |
| Score number | Georgia, serif | 108px | Bold | Normal, letter-spacing: -0.03em |
| "points" label | Georgia, serif | 24px | Normal | Italic |
| Stat numbers (4, 4) | Georgia, serif | 44px | Bold | Normal |
| Stat labels (correct, streak) | System/sans | 18px | Normal | Uppercase, letter-spacing: 0.12em |
| Round number | Monospace | 20px | Normal | Normal |
| Bar label (confidence name) | System/sans | 20px | Bold | Normal, letter-spacing: 0.04em |
| ✓ / ✗ | System | 28px | Bold | Normal |
| CTA text | Georgia, serif | 22px | Normal | Italic |
| URL | Georgia, serif | 22px | Normal | Normal |

*Note: Sizes above are for the 1200×630 canvas. If rendering at 600×315 logical pixels at 2× DPR, halve these values in CSS.*

---

## Layout Specification

### Structure (two-column)

The card is divided into:

**Left column (score block):** Fixed width, roughly 30% of card width.
- Score number: largest element, top of column
- "points" label directly below
- Horizontal rule separator
- Two stats side by side: accuracy count (in teal) and best streak (in gold), each with an uppercase label beneath

**Right column (round bars):** Fills remaining width.
- 5 rows, one per round
- Each row contains: round number (left), horizontal bar (center, fills available space), ✓/✗ icon (right)
- Bar width is proportional to confidence tier: `(tier / maxTier) * 100%`
- Confidence tier mapping for the 5-tier system:
  - Guess = tier 1 → 20% width
  - Hunch = tier 2 → 40% width
  - Pretty Sure = tier 3 → 60% width
  - Damn Sure = tier 4 → 80% width
  - No Doubt = tier 5 → 100% width
- Confidence label text is positioned inside the filled portion of the bar (left-aligned, white text with subtle text-shadow)
- Bar track (unfilled portion) is rgba(0,0,0,0.04), border-radius 4px
- Bar fill has border-radius 4px, uses a linear-gradient for subtle depth

### Header

- "Bullshit" left-aligned, date right-aligned, same baseline
- 1px horizontal rule below, full width within padding

### Footer

- 1px horizontal rule above
- CTA text ("I spotted the fake headlines. Can you?") left-aligned, italic
- URL ("playbullshit.com") right-aligned
- Both on the same baseline

---

## Rendering Method

Use **Canvas API** (preferred) or **html2canvas** to generate the share card client-side. No server-side rendering.

### Canvas API approach (recommended)

Create a hidden `<canvas>` element at 1200×630px. Draw all elements using Canvas 2D context methods:

1. Fill background (#F7F5F0)
2. Draw top rule (fillRect, 0, 0, 1200, 6 — doubled for 2× if needed)
3. Draw text elements using `ctx.font` with Georgia
4. Draw bars using `fillRect` with rounded corners via `ctx.roundRect` or path arcs
5. Draw divider lines
6. Export via `canvas.toDataURL('image/png')` or `canvas.toBlob()`

### Share flow

1. Generate canvas on session completion
2. Convert to blob/data URL
3. **Copy to clipboard:** Use `navigator.clipboard.write()` with the blob (preferred) or fall back to copying the share text
4. **Web Share API (mobile):** Use `navigator.share({ files: [file], text: shareText })` if available
5. **Share text:** "I scored [SCORE] on today's Bullshit challenge. [ACCURACY]/5 correct. Can you spot the fake headlines? [URL]"

---

## Data Mapping

The share card needs the following data from `SessionResult`:

| Card Element | Source |
|---|---|
| Score | `sessionResult.totalPoints` |
| Accuracy | Count of rounds where `correct === true` |
| Best Streak | Longest consecutive `correct === true` run in `sessionResult.rounds` |
| Date | Current date, formatted with `toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })` |
| Round bars | `sessionResult.rounds` array — for each round, need `correct` (boolean) and `confidence` (ConfidenceLevel 1–5) |
| Bar label | Look up `CONFIDENCE_TIERS[round.confidence].label` |
| Bar width % | `(round.confidence / 5) * 100` |
| Bar color | `round.correct ? '#0D7A55' : '#A05C00'` |

---

## What to Change in the Codebase

### ShareCard.tsx

Rewrite the share card rendering to match the spec above. Key changes:

1. **Background:** Change from `#0D0D0D` (dark) to `#F7F5F0` (light)
2. **Layout:** Replace the centered single-column layout with the two-column layout (score left, bars right)
3. **Round indicators:** Replace uniform circles + percentage labels with variable-width horizontal bars + confidence tier labels
4. **Title:** Change from all-caps "BULLSHIT" in gold to mixed-case "Bullshit" in near-black (#0D0D0D), matching the game's home screen
5. **Date:** Format as readable text ("March 6, 2026"), not ISO string ("2026-03-06")
6. **Footer CTA:** Change to "I spotted the fake headlines. Can you?"
7. **Stats:** Show accuracy count and best streak (not average confidence)
8. **Top accent:** Replace any existing top decoration with a 3px solid #0D0D0D rule spanning full width

### ScoreScreen.tsx

No structural changes. Ensure the share card generation is triggered correctly and uses the updated ShareCard component.

### Share text

Update the auto-populated copy text to:

```
I scored [SCORE] on today's Bullshit challenge. [ACCURACY]/5 correct. Can you spot the fake headlines? [URL]
```

---

## Do NOT Change

- The `calculateCalibration()` function or any game logic
- The results screen layout or metrics displayed
- The game screen, vote buttons, confidence slider, or reveal panel
- The content schema or items.json
- Any other component not listed above

---

## Verification Checklist

After implementing, verify:

1. Share card renders at 1200×630px with #F7F5F0 background
2. "Bullshit" title appears in Georgia serif, matching game home screen style
3. Date is formatted as readable text (e.g., "March 6, 2026")
4. Score is large and prominent on the left
5. Five horizontal bars appear on the right, one per round
6. Bar width varies by confidence tier (Guess = narrowest, No Doubt = full width)
7. Correct bars are teal (#0D7A55), incorrect bars are amber (#A05C00)
8. Confidence label text appears inside each bar in white
9. ✓ / ✗ icons appear to the right of each bar in the matching color
10. Footer shows "I spotted the fake headlines. Can you?" and "playbullshit.com"
11. 3px dark rule appears at the very top of the card
12. Card copies to clipboard and/or shares via Web Share API correctly
13. Card looks sharp on retina displays (rendered at 2×)
14. No headlines or spoiler content appears on the card
