# BULLSHIT

## Product Requirements Document

**Core Game Loop · Epochs 1–3 · Claude Code Build Guide**

| | |
|---|---|
| **Status** | Draft v2.1 — Revised (Post-Playtest) |
| **Platform** | Web (Next.js) · Mobile-responsive |
| **Builder** | Claude Code (solo developer) |
| **Epoch 1 Target** | 1–2 weeks |
| **Epoch 1 Goal** | Prove the core mechanic is fun and replayable |

*This revision (v2.1) incorporates all post-playtest changes from March 4, 2026. It consolidates duplicate specifications, resolves internal contradictions, and establishes a single source of truth for each element. Sections reference each other rather than restating. The Claude Code build guide (Section 12) is the canonical build instruction and references specs defined elsewhere.*

---

## 1. Product Philosophy & Design Principles

Bullshit is a media literacy game. Its purpose is to make people better at detecting fabricated, manipulated, and AI-generated content — not through lectures, but through daily practice that is genuinely enjoyable.

Every design decision in this document is subordinate to one test: is this fun? If a feature makes the game more educational but less engaging, cut the feature. If a mechanic is clever but adds friction to a 3-minute session, cut the mechanic. Education is the output, not the product. The product is the game.

### The Five Principles

1. **The lesson is the reward.** Insight after a round — the tell, the technique, the moment of recognition — is the dopamine hit. Not a badge. Not a streak counter. The learning itself.

2. **Sessions are defined by completion, not time.** A round ends when the player finishes, not when a timer runs out. Completion rate is the primary retention metric.

3. **Confidence calibration, not just accuracy.** The game measures whether players know what they know, not just whether they get answers right. This is the unique pedagogical contribution.

4. **Precision over warmth.** Feedback is specific and true. 'The sourcing is anonymous' beats 'You missed this one — try again!' Respect the player's intelligence.

5. **Mobile-first interaction, web-first delivery.** Every tap target, every animation, every layout decision should work on a phone screen even if Epoch 1 ships as a web app.

*The single question every feature must answer: does this make someone more likely to come back tomorrow?*

---

## 2. What This Product Is

Bullshit is a daily habit game (3–5 minute sessions) and confidence calibration engine grounded in inoculation science. It is a content pipeline with a compounding data moat. The reference points are Wordle × Duolingo × The Economist.

It is not a news aggregator, fact-checking service, quiz game, edutainment app, or one-time novelty. It does not moralise about misinformation. It earns credibility through precision.

---

## 3. The Core Game Loop

The game loop completes in a single screen interaction per round with no page navigation. A five-round Daily Challenge session runs as follows:

### Session Flow

1. Player arrives. A session begins automatically — no mode selection, no onboarding friction. The Daily Challenge is the default entry point.

2. A single headline appears. Nothing else. No comparison pair. No source hint. Just the thing.

3. **Player selects REAL or BULLSHIT.** The button press registers a tentative vote. The confidence slider appears immediately after. The player may switch between REAL and BULLSHIT freely until they lock in (see below).

4. Player sets confidence using a slider that snaps to 10-point increments: 50%, 60%, 70%, 80%, 90%, 100%. **Default rests at 60%.** Player taps a **"Lock it in"** button below the slider to confirm. Only this button press locks the vote and confidence.

5. **The answer reveals.** The reveal animation plays (~500ms: 300ms card transition + 200ms explanation slide-up). The reveal screen remains visible indefinitely until the player taps to continue. A subtle "Tap anywhere to continue" prompt fades in at the bottom of the screen (200ms fade-in, 500ms delay after reveal completes).

6. After Round 5, the player's tap advances to the Session Score Screen with total points, accuracy, average confidence, and best streak.

7. Player shares or exits. Session complete.

### Critical Constraints

- Total session time target: 3–4 minutes for 5 rounds
- All content pre-loaded at session start — no loading screens between rounds
- No navigation away from the game surface during a session
- The answer reveal is the emotional peak — designed as such
- Player controls pacing after reveal — no auto-advance timers
- Exit at any time is possible but costs the in-progress session (no partial saves in Epoch 1)
- Free Play uses the same 5-round session structure with a "Play Again" option at the end

### Round States

| State | Name | Description |
|---|---|---|
| `idle` | Waiting | Content loaded, awaiting vote. Buttons active. |
| `voted` | Locked | Tentative vote registered. Confidence slider visible and active. "Lock it in" button shown. Player may switch vote freely. |
| `confirmed` | Revealed | Answer shown, explanation visible, points calculated. Entire game surface tappable to advance. Source link (if present) excluded from tap-to-advance. |

*Note: The "advancing" state from PRD v2.0 has been removed. There is no auto-advance timer. The player explicitly taps to proceed after reading the reveal.*

---

## 4. Scoring System

The scoring system must accomplish three things: reward accuracy, punish overconfidence, and reward well-calibrated uncertainty. The penalty curve for wrong answers is steeper than the reward curve for correct ones. This is intentional — overconfidence is the primary cognitive failure mode being addressed.

### Point Table

The confidence slider snaps to these six values only. No intermediate values exist.

| Confidence | Label | If Correct | If Wrong |
|---|---|---|---|
| 50% | Guess | +50 | −10 |
| 60% | Lean | +85 | −40 |
| 70% | Confident | +120 | −80 |
| 80% | Sure | +170 | −140 |
| 90% | Certain | +240 | −220 |
| 100% | Definite | +350 | −400 |

A player who always selects 50% and is always correct scores 250 per session. A player at 100% who gets 4 right and 1 wrong scores (4 × 350) − 400 = 1,000. The risk/reward is explicit and felt. The 50% floor means "I have no idea" is always a valid, non-punishing position.

### Streak Multipliers

- 3 correct in a row: +10% bonus on next round's points
- 5 correct in a row: +25% bonus on next round's points
- Streak resets on any wrong answer
- Multiplier displayed as a small indicator near the score counter — not announced loudly
- Multiplier applies to correct answers only; wrong answers are not amplified by streak

### Calibration Assessment

Calculated from the session's rounds by comparing average confidence on wrong answers versus right answers:

- **Overconfident:** avg confidence on wrong answers exceeds avg on right answers by >15 points
- **Well-calibrated:** within 15 points
- **Underconfident:** avg on right answers exceeds avg on wrong answers by >15 points
- **Edge cases:** 5/5 correct displays "Perfect" (no wrong answers to calibrate against). 0/5 correct displays "N/A" (no right answers to calibrate against).

*Note: The calibration calculation remains in the codebase (lib/game.ts) and is stored in SessionResult, but is not displayed on the results screen or share card in Epoch 1. Playtesting showed the label was meaningless to first-time players without additional explanation. The display will be reintroduced in Epoch 2 with supporting context.*

### Session Score Screen Metrics

The results screen displays exactly four metrics:

- **Total Points** — sum of round scores including multipliers
- **Accuracy** — correct answers out of 5
- **Average Confidence** — mean confidence across all rounds
- **Best Streak** — longest consecutive correct answers in the session

---

## 5. Content Specification

All Epoch 1 content is served from a static local JSON file bundled with the application at deploy time. No API, no database, no server-side content fetching.

### Minimum Viable Pool

- 60 content items minimum at launch
- Split: 30 real headlines, 30 fabricated headlines
- 3 categories: Politics / Government (20), Science & Health (20), Technology & AI (20)
- Difficulty distribution: 20 Easy (0.30–0.45), 25 Medium (0.46–0.65), 15 Hard (0.66–0.85)
- No item appears in a player's session more than once per day
- Daily Challenge: 5 items selected deterministically by date string (seeded PRNG, not Math.random). Same set for all players. Resets midnight UTC.

*Known limitation: 60 items ÷ 5 per day = 12 unique days before cross-day repetition is possible. Expanding to 100+ items before public launch is recommended.*

### Content Item Schema

#### Required Fields

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier. Three-digit zero-padded string. |
| type | enum | "headline" only in Epoch 1. |
| content | string | The headline text exactly as shown to player. Max 180 characters. |
| isReal | boolean | True = real news item. False = fabricated / AI-generated / meaningfully altered. |
| source | string \| null | For real items: the outlet name. For fakes: the impersonated outlet or null. |
| category | enum | "politics" \| "science-health" \| "tech-ai" |
| difficulty | float | 0.0–1.0. Manually assigned in Epoch 1. |
| tell | string | The precise observation identifying this item as real or fake. Shown after reveal. Must be specific — no vague generalisations. |
| technique | string | Slug from the approved taxonomy (see Section 6). |

#### Optional Fields

| Field | Type | Description |
|---|---|---|
| sourceUrl | string | URL to original article. When present on real items, enables "Read Source →" link on reveal screen. |
| publishedDate | string | ISO date string. Required for all real items. Displayed on reveal screen for real items only, formatted as a readable date (e.g. "March 2, 2026"). Not shown pre-vote. Omitted silently for fabricated items. |
| techniqueName | string | Human-readable technique name. |
| techniqueExplanation | string | One-paragraph explanation of the broader technique. |
| retiredAfterPlays | number | Retire from active pool after N plays. Default 500. Not enforced in Epoch 1. |
| addedDate | string | Date added to pool. |

### Content Freshness

Real headlines in the content pool should feel current — recent enough that a player would not search for them and find them stale. For Epoch 1, this means within the past 2–4 weeks at time of deploy. Content refresh is a manual editorial task in Epoch 1. Epoch 2 introduces the live feed infrastructure (see Section 9) with a 24-hour freshness requirement.

### Content Quality Rules

1. **Every tell must be specific.** 'The language seems emotional' is not valid. 'The verb "bombshell" appears in 340% more fabricated headlines than verified ones' is valid. Name the exact technique, word, or structural feature.

2. **Every fake must have a corresponding real counterpart** it is designed to mimic. Document the relationship in a separate editorial note, not in the JSON.

3. **No political items that take sides.** Items can be about political topics, but the correct answer must be determinable without partisan perspective.

4. **No items whose answer depends on recency.** Date-stamp time-sensitive items and include a review date.

5. **Hard items (>0.65) must have verifiable tells.** The player must be able to see it after the fact. If the tell is 'you'd have to already know this,' the item is unfair, not hard.

---

## 6. The Tell & Explanation System

The tell is the most important moment in the game. It is the sentence — or two — that names precisely what gave the item away. The quality of the tells is the quality of the product.

### Tell Principles

- **One observation.** The most important one. Not a list.
- **Specific, not general.** Name the actual word, technique, or structural feature.
- **True.** Verifiable observation, not interpretation.
- **Non-judgemental.** Does not comment on how the player should feel.
- **Consistent register.** Dry, precise, unsurprised — consistent with Z's eventual voice, even though Z does not appear in Epoch 1.

### Explanation Hierarchy

- **Level 1 — The Tell** (Epoch 1): One or two sentences. The specific observation. Always shown.
- **Level 2 — The Technique** (Epoch 2+): A short paragraph on the broader pattern. Shown in 'Learn More' expansion.

### Manipulation Technique Taxonomy

Every item is tagged with one technique. This table is the single canonical reference for technique slugs, definitions, and example tells.

| Technique Slug | Definition | Example Tell |
|---|---|---|
| anonymous-sourcing | 'Sources say,' 'officials claim' — no named, accountable source. | "The source is 'officials familiar with the matter.' No official is named, no institution cited. Accountability is structurally absent." |
| emotional-amplification | Charged verbs/adjectives ('bombshell,' 'shocking,' 'slammed') not in the original source. | "The verb 'slammed' does not appear in the cited source. It was introduced in the headline to signal conflict the underlying report does not describe." |
| headline-body-mismatch | The headline implies a claim the article body doesn't support. | "The headline states the drug 'cures' the condition. The study uses the word 'associated with reduced symptoms.' These are not the same claim." |
| false-precision | Invented statistics with false specificity ('87% of experts'). | "The figure '73% of Americans' is cited without a study. When a statistic is specific but sourceless, the specificity is doing rhetorical work the evidence cannot support." |
| recycled-news | A real old story resurfaced with present-tense framing. | "The article was published in 2019. The event concluded four years before this version began circulating." |
| out-of-context | A real image or quote used in a meaning-changing context. | A real photograph from a 2018 protest used to illustrate a 2026 headline about a different event. |
| false-authority | A claim attributed to an institution that didn't make it. | "The 'Global Health Council' cited does not exist as a formal body. The name mimics real institutions to borrow credibility." |
| ai-generated-text | LLM-produced text with structural tells (hedging, impossible specificity). | "The second paragraph cites three studies with no titles and no authors. Language models produce plausible-sounding citations that do not exist." |
| ai-generated-image | Generative-model image. Epoch 2+ only. | — |
| satire-presented-as-real | Satirical source presented without that context. | "This headline originates from The Babylon Bee, a satirical publication. It circulated without the satire label." |
| missing-dateline | No publication date, or date omitted to obscure staleness. | "No date appears on the article. The event described occurred in 2021, but the framing implies recency." |
| correlation-as-causation | A correlation study presented as establishing causation. | "The study found a correlation (r=0.34). The headline replaced 'associated with' with 'causes' — a claim the data cannot support." |

---

## 7. UI / UX Requirements

The visual language is editorial, not gamified. Reference points: The Economist and The New York Times, not Candy Crush or Duolingo. The interface feels like a serious publication — with the exception of scoring and reveal moments, which earn a single expressive beat each.

### Typography

| Element | Specification |
|---|---|
| Content headline | Georgia or serif stack, 20–22pt, regular weight, dark on light |
| UI labels and buttons | Inter or system-ui, 14–16pt, medium weight |
| Score and numbers | Inter, 28–48pt, bold, tabular figures |
| Tell / explanation | Georgia, 16pt, regular, medium contrast background |
| Category labels | All-caps, letter-spaced, 11pt, muted colour |

### Colour Palette

| Element | Value | Notes |
|---|---|---|
| Background | #F7F5F0 | Off-white. Warm, not clinical. |
| Surface (cards) | #FFFFFF | Pure white. |
| Text primary | #0D0D0D | Near-black. |
| Text secondary | #555555 | Mid-grey. |
| Text muted | #999999 | Deemphasised labels. |
| Correct indicator | #0D7A55 | Deep teal. Reveal moment only. |
| Incorrect indicator | #A05C00 | Warm amber. Not red — amber implies 'missed it,' not shame. |
| Accent / gold | #A07820 | Score highlights, streak indicator. |
| REAL button | #1A5C35 | Dark green. Decisive. |
| BULLSHIT button | #5C1A1A | Dark red. Decisive. |

### Layout — Game Screen

Four zones, stacked vertically on mobile, no horizontal scrolling:

1. **Session Header (fixed):** Round counter (e.g. '3 / 5'), current session score, streak indicator if active. Small and unobtrusive.

2. **Content Zone (variable):** The headline. Centre-aligned. Largest text on screen. No source attribution visible pre-vote. No date visible pre-vote.

3. **Action Zone (fixed):** REAL and BULLSHIT buttons — equal width, full-width on mobile, max 560px on desktop. Selected button is highlighted (full opacity + border change); unselected button is dimmed. Player may switch freely. Below: the confidence slider (hidden until first vote tap) and "Lock it in" confirm button.

4. **Explanation Zone (variable):** Hidden during voting. Slides in after reveal. Contains: correct/incorrect indicator, source attribution, publication date (real items only), the tell, and "Read Source →" link (real items with sourceUrl only).

### Animation Budget

One expressive animation per round: the reveal. Everything else is fast and invisible.

| Element | Duration | Notes |
|---|---|---|
| Reveal (card) | 300ms | Card flips or fades. Correct = teal border. Incorrect = amber border. |
| Reveal (explanation) | 200ms | Slides up from below. Total reveal sequence: 500ms. |
| "Tap anywhere to continue" | 200ms fade-in | Appears 500ms after reveal completes. Muted text (#999999), 13px, centre-aligned. |
| Score increment | 400ms | Ticks up/down with ease-in. Satisfying. |
| Button press | 100ms | Darken. No bounce. No pop. |
| Slider | — | Snaps to 10-point increments. No intermediate positions. |
| Session complete | 200ms | Crossfade to score screen. No fanfare. |

**⚠** *No animations on share card generation, no celebration screen, no confetti, no mascot reactions. The game's personality lives in the text, not the interface.*

### Error & Empty States

These states must be handled gracefully in Epoch 1:

- **Daily Challenge already completed:** Show today's score with option to play Free Play. Do not allow Daily Challenge replay (preserves share card integrity).
- **localStorage cleared mid-session:** Session continues (state is in React memory). Streak history lost — acceptable in Epoch 1.
- **Content JSON fails to load:** Show a simple error message: 'Content could not be loaded. Please refresh.' No retry loop.
- **Free Play exhausts pool:** Show a message: 'You've seen everything for today. Come back tomorrow or try the Daily Challenge.'

---

## 8. Share Card

The share card is the primary organic acquisition channel. Design it first — before anything else on the score screen.

### Requirements

- Generated client-side using html2canvas or Canvas API. No server-side rendering.
- Fixed dimensions: 1200 × 630px (Open Graph standard).
- **Contains:** game name (BULLSHIT), today's date, score (large), accuracy (e.g. '4/5'), and 5 round indicators (each showing ✓ or ✗ with the confidence used).
- **Does NOT contain:** the actual headlines (spoils the game), player name (no accounts in Epoch 1), point breakdown per round, or calibration label.
- Dark background (#0D0D0D), white score, gold accent (#A07820) for game name.
- **Copy text (auto-populated, editable):** 'I scored [SCORE] on today's Bullshit challenge. [ACCURACY] correct. Can you do better? [URL]'
- **Share targets:** Copy to clipboard (always), Web Share API on mobile. Twitter/X direct share is a bonus if it doesn't add complexity.

*Note: The domain (bullshit.game, bs.game, playbs.com) is an open question. Use a placeholder in the share card until confirmed.*

### Visual Spec

```
┌─────────────────────────────────────────────┐
│  BULLSHIT                 March 2, 2026     │
│                                             │
│                  1,240                      │
│                  points                     │
│                                             │
│         4 / 5 correct                       │
│                                             │
│    ✓85  ✓70  ✗90  ✓65  ✓75                 │
│    (confidence used each round)             │
│                                             │
│                  [URL]                       │
└─────────────────────────────────────────────┘
```

---

## 9. Epoch Roadmap

### Epoch 1 — Prove the Loop (Weeks 1–2)

*The only question Epoch 1 must answer: is this fun enough to want to play again tomorrow?*

#### What's In (beyond what's specified in Sections 3–8)

- Next.js 14 web app, no backend, no database, no auth
- Static JSON content pool (60 items, locally bundled)
- Free Play mode: random selection from full pool, 5-round sessions, unlimited replays
- Category filter (Politics / Science / Tech) accessible from Free Play entry
- Basic streak tracking via localStorage (session streak only)
- Daily Best score via localStorage (resets daily)
- Mobile-responsive layout (tested at 375px, 390px, 430px widths)
- Deployed to Vercel with shareable URL from day one
- Player-controlled pacing after reveal (tap to continue, no auto-advance)
- Vote switching allowed before lock-in
- Publication date displayed on reveal for real items only
- "Read Source →" link on reveal for real items with sourceUrl

#### What's Out

- User accounts, auth, server-side database, leaderboards
- Z narrator (tell text only, from items.json)
- Image-type content, token system, badges, progression
- Multiple game modes (Blitz, Sudden Death)
- Admin content management UI
- Analytics beyond Vercel built-in stats
- Calibration display on results screen or share card

#### Success Criteria

1. Five non-builders play a full session unprompted and report wanting to play again.
2. Session takes 3–4 minutes for 5 rounds, measured on a real phone.
3. Share card generates correctly and the URL is shareable.
4. No JavaScript errors on mobile Safari, Chrome mobile, or Chrome desktop.
5. Losing 400 points for a confident wrong answer feels consequential.

### Epoch 2 — Build the Habit (Weeks 3–8)

*Does a player come back the next day, and the day after?*

- **Auth & Accounts:** Email + Google OAuth via NextAuth.js. Persistent scores in Postgres (Supabase). Account creation prompted after first session, not before.
- **Cross-Session Streaks:** Server-side persistence. Miss a day = reset. 7-day bonus = +5,000 points.
- **Z Narrator (Static):** Pre-written response templates keyed to technique and outcome. Not AI-generated yet. ~5 templates per outcome category.
- **ELO Difficulty Engine:** Item difficulty and player skill ratings update after each play. Free Play uses skill-matched selection.
- **Leaderboards:** Top 100 monthly. Friend leaderboard by email invite. 30-day season resets.
- **Additional Modes:** Timed Blitz (60s, 1.5× multiplier), Sudden Death (one wrong = end, 2× multiplier). Locked until first Daily Challenge completed.
- **Calibration Display:** Reintroduce calibration metric on results screen with supporting explanation for players. The calculation already exists in the codebase from Epoch 1.
- **Content Expansion & Live Feed:** 200+ items, image-type items, live feed infrastructure (PolitiFact RSS + NewsAPI) with human editorial review pipeline.

#### Content Freshness Requirement (Epoch 2)

With the introduction of the live feed infrastructure, Epoch 2 enforces a 24-hour freshness requirement for all content entering the active pool:

- **Ingestion pipeline:** PolitiFact RSS and NewsAPI feeds are polled on a recurring schedule (minimum every 4 hours). New candidate items are ingested into a staging queue, not directly into the active pool.
- **Editorial review gate:** Every candidate item must pass human editorial review before entering the active pool. No automated promotion. Reviewers verify: the item meets content quality rules (Section 5), the tell is specific and accurate, the technique tag is correct, and difficulty is appropriately rated.
- **24-hour freshness enforcement:** Real items must have a publishedDate within 24 hours of pool entry. Items older than 24 hours at time of editorial approval are rejected from the live feed pipeline. (Manually curated "evergreen" items with historical or educational value are exempt from this rule but must be explicitly flagged as evergreen in the schema.)
- **Staleness sweep:** A nightly job reviews all active pool items. Real items whose publishedDate is older than 14 days are automatically retired from the active pool and moved to an archive. Archived items remain available for Free Play's extended pool but are excluded from Daily Challenge selection.
- **Freshness metadata:** Two new fields are added to the content schema in Epoch 2: `ingestedAt` (ISO timestamp, when the item entered the staging queue) and `reviewedAt` (ISO timestamp, when the item passed editorial review). These fields support freshness auditing and pipeline monitoring.
- **Fallback:** If the live feed pipeline produces fewer than 5 reviewed items in a 24-hour window, the Daily Challenge falls back to the most recent items from the curated pool. A monitoring alert fires when the pipeline produces fewer than 10 reviewed items per day for two consecutive days.

### Epoch 3 — Growth & Data (Weeks 9–20)

*Can this become a platform, not just a game?*

- **Z — AI-Powered:** Claude API (server-side only). Context-injected per call. Cached by item + outcome. Rate limited to 5 calls/session with static fallback.
- **Data Layer:** Verification corpus (append-only). Nightly aggregates. Corpus export API. Blockchain attestation (gated on legal review).
- **Token System:** Spendable Points (separate from Lifetime). Token conversion events. Optional wallet connection. Anti-farming measures. Hard-gated on legal review completion.
- **Social:** Clan system (max 50 members, weekly leaderboard). Duel mode (same item set, 24hr window, highest score wins).
- **B2B:** Organisation accounts, admin dashboard, API access to verified corpus, white-label mode.

---

## 10. Technical Architecture

### Epoch 1 Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript — strict mode on |
| Styling | Tailwind CSS — utility classes only, no custom CSS files except globals.css |
| State | React useState + useReducer. No Redux, no Zustand. |
| Content | Static JSON at /data/items.json — bundled at build time |
| Share Card | html2canvas or Canvas API |
| Persistence | localStorage for session streak, daily completion flag, daily best only |
| Deployment | Vercel — free tier sufficient |
| Analytics | Vercel Analytics (built-in) |

**Epoch 2 adds:** NextAuth.js, Postgres via Supabase, Prisma ORM, Upstash Redis, Vercel Cron Jobs, Resend for transactional email.

**Epoch 3 adds:** Anthropic Claude API (claude-sonnet-4-20250514, server-side only), Cloudflare R2, ethers.js (legal review required), Inngest for async jobs.

### File Structure

```
/bullshit
├── /app
│   ├── page.tsx              # Home screen / session entry
│   ├── /play/page.tsx        # Game screen (core loop)
│   ├── /results/page.tsx     # Session score screen + share card
│   ├── layout.tsx            # Root layout with fonts and metadata
│   └── globals.css           # CSS custom properties + fadeIn keyframe
├── /components
│   ├── /game
│   │   ├── ContentCard.tsx      # Headline display. Large serif. No source/date pre-vote.
│   │   ├── VoteButtons.tsx      # REAL / BULLSHIT buttons. Switchable before lock-in.
│   │   ├── ConfidenceSlider.tsx # 10-point snap increments, default 60%
│   │   ├── RevealPanel.tsx      # Post-vote: result, source, date, tell, source link
│   │   └── SessionHeader.tsx    # Round count, score, streak
│   ├── /results
│   │   ├── ScoreScreen.tsx
│   │   └── ShareCard.tsx
│   └── /ui
│       ├── Button.tsx
│       └── Slider.tsx
├── /data
│   └── items.json            # Content pool (60+ items)
├── /lib
│   ├── game.ts               # Scoring, calibration, streak logic
│   ├── challenge.ts          # Daily challenge seeding (date-based)
│   ├── storage.ts            # localStorage helpers
│   └── types.ts              # TypeScript interfaces
├── /hooks
│   └── useGameSession.ts     # Game state machine hook
└── /public
```

---

## 11. Data Schema (Canonical)

This section is the single source of truth for all TypeScript types and scoring logic. The Claude Code build guide (Section 12) references this section rather than restating it.

### Core Types

```typescript
// types.ts

export type Category = "politics" | "science-health" | "tech-ai";

export type Technique =
  | "anonymous-sourcing"
  | "emotional-amplification"
  | "headline-body-mismatch"
  | "false-precision"
  | "recycled-news"
  | "out-of-context"
  | "false-authority"
  | "ai-generated-text"
  | "ai-generated-image"
  | "satire-presented-as-real"
  | "missing-dateline"
  | "correlation-as-causation";

export interface ContentItem {
  id: string;
  type: "headline" | "image" | "mixed";
  content: string;
  isReal: boolean;
  source: string | null;
  sourceUrl?: string;
  publishedDate?: string;
  category: Category;
  difficulty: number; // 0.0–1.0
  tell: string;
  technique: Technique;
  techniqueName?: string;
  techniqueExplanation?: string;
  addedDate?: string;
  retiredAfterPlays?: number;
}

export interface RoundResult {
  itemId: string;
  vote: "real" | "bullshit";
  confidence: number; // 50 | 60 | 70 | 80 | 90 | 100
  correct: boolean;
  pointsEarned: number; // negative for wrong answers
  responseTimeMs: number;
}

export interface SessionResult {
  rounds: RoundResult[];
  totalPoints: number;
  accuracy: number; // 0–1
  averageConfidence: number;
  calibration: "overconfident" | "well-calibrated" | "underconfident"
    | "perfect" | "n/a";
  streakBonus: number;
  date: string; // ISO date
  mode: "daily" | "free-play";
}

// v2.1: "advancing" state removed. No auto-advance timer.
export type RoundState = "idle" | "voted" | "confirmed";

export interface GameState {
  items: ContentItem[];
  currentIndex: number;
  currentVote: "real" | "bullshit" | null;
  currentConfidence: number;
  roundState: RoundState;
  rounds: RoundResult[];
  sessionScore: number;
  streak: number;
}
```

### Scoring Function

```typescript
// game.ts

const POINT_TABLE: Record<number, { correct: number; wrong: number }> = {
  50: { correct: 50, wrong: -10 },
  60: { correct: 85, wrong: -40 },
  70: { correct: 120, wrong: -80 },
  80: { correct: 170, wrong: -140 },
  90: { correct: 240, wrong: -220 },
  100: { correct: 350, wrong: -400 },
};

export function calculatePoints(
  confidence: number, // must be 50 | 60 | 70 | 80 | 90 | 100
  correct: boolean,
  streakMultiplier: number = 1
): number {
  const base = correct
    ? POINT_TABLE[confidence].correct
    : POINT_TABLE[confidence].wrong;
  return correct ? Math.round(base * streakMultiplier) : base;
}
```

### Calibration Function

*Note: This function is retained in the codebase and called at session end. The result is stored in SessionResult but not displayed in Epoch 1.*

```typescript
export function calculateCalibration(
  rounds: RoundResult[]
): "overconfident" | "well-calibrated" | "underconfident" | "perfect" | "n/a" {
  const wrong = rounds.filter(r => !r.correct);
  const right = rounds.filter(r => r.correct);
  if (wrong.length === 0) return "perfect"; // 5/5
  if (right.length === 0) return "n/a"; // 0/5
  const avgWrong = wrong.reduce((s, r) => s + r.confidence, 0) / wrong.length;
  const avgRight = right.reduce((s, r) => s + r.confidence, 0) / right.length;
  const delta = avgWrong - avgRight;
  if (delta > 15) return "overconfident";
  if (delta < -15) return "underconfident";
  return "well-calibrated";
}
```

### Daily Challenge Seeding

```typescript
// challenge.ts

function getDailyChallenge(items: ContentItem[]): ContentItem[] {
  const today = new Date().toISOString().split("T")[0]; // "2026-03-02"
  // Use a deterministic hash of the date to seed selection
  // Same date → same 5 items for all players, everywhere
  // Do NOT use Math.random() — it will differ per player
  // Implement a seeded shuffle (e.g. mulberry32 PRNG)
  // Select 5 items: at least 1 from each category if pool allows
}
```

---

## 12. Claude Code Build Guide

This section is designed to be pasted directly into a Claude Code session. It references specifications in other sections rather than restating them. Read the full PRD before starting.

### Opening Prompt

*Paste the following as the first message in your Claude Code session.*

```
You are building "Bullshit" — a media literacy game.

Read the full PRD before writing any code.

══ WHAT WE ARE BUILDING (EPOCH 1) ══

A Next.js 14 web app. TypeScript strict mode. Tailwind CSS.
No backend. No database. No auth. Deploy to Vercel.

The game: player sees a headline, votes REAL or BULLSHIT
(switchable before lock-in), sets confidence (snaps to
50/60/70/80/90/100%), taps "Lock it in", sees the reveal +
explanation + source link, taps anywhere to continue,
repeat for 5 rounds, then score screen and share card.

══ BUILD ORDER ══

Step 1: Scaffold
- npx create-next-app@latest bullshit --typescript --tailwind --app
- Set up /lib/types.ts (types from PRD Section 11)
- Set up /lib/game.ts (scoring from PRD Section 11)
- Set up /lib/challenge.ts (seeding from PRD Section 11)
- Set up /lib/storage.ts (localStorage helpers)

Step 2: Content
- Create /data/items.json with 10 placeholder items
- 5 real, 5 fake. All required fields including tell + technique.
- All real items must have publishedDate and sourceUrl populated.

Step 3: Game State
- Create /hooks/useGameSession.ts
- State machine: idle → voted → confirmed → idle (next round)
- NO auto-advance. Player taps to continue after reveal.
- "voted" state allows vote switching (REAL↔BULLSHIT)
- Only "Lock it in" transitions to "confirmed"
- All scoring delegated to /lib/game.ts
- Session completes after 5 rounds, returns SessionResult

Step 4: Components (see PRD Sections 7 + 10 for specs)
- ContentCard.tsx — headline, serif, centre-aligned. No date/source.
- VoteButtons.tsx — REAL (#1A5C35) / BULLSHIT (#5C1A1A). Switchable.
  Selected = full opacity + border. Unselected = dimmed.
- ConfidenceSlider.tsx — snaps to 10-pt increments, default 60%
- RevealPanel.tsx — post-confirm: result + source + date (real only)
  + tell + "Read Source →" link (real items with sourceUrl)
- SessionHeader.tsx — round count, score, streak

Step 5: Screens
- /app/page.tsx — DAILY CHALLENGE (primary) + FREE PLAY
- /app/play/page.tsx — game screen, uses useGameSession
  After reveal: entire surface tappable to advance.
  "Tap anywhere to continue" hint (muted, 13px, fade-in).
  Clicks on <a> tags (source link) excluded from advance.
- /app/results/page.tsx — score screen + share card + play again
  Metrics: Total Points, Accuracy, Avg Confidence, Best Streak.
  NO calibration displayed.

Step 6: Share Card (see PRD Section 8)
- html2canvas, 1200×630px, dark bg, copy to clipboard
- Shows: game name, date, score, accuracy, round indicators
- NO calibration label on share card

══ DESIGN RULES (from PRD Section 7) ══

Background: #F7F5F0 | REAL btn: #1A5C35 | BS btn: #5C1A1A
Correct: #0D7A55 teal | Wrong: #A05C00 amber
Headlines: Georgia/serif | UI: system-ui/Inter
Animations: reveal only (500ms) + tap-to-continue hint (200ms fade)
NO confetti, NO mascots, NO celebration screens, NO auto-advance
Mobile-first: test at 375px

══ WHAT NOT TO BUILD ══

No auth, no API routes, no database, no Z narrator,
no leaderboards, no tokens, no image content, no admin UI.
No auto-advance timers. No calibration on results/share card.
If adding something not in this list, stop and ask.

══ QUALITY STANDARDS ══

- TypeScript strict: no `any`, no unjustified assertions
- Game logic in /lib/ only — components render only
- JSDoc on all public functions
- No console.log in committed code
- Each step testable before moving to next
- SSR: headline should render server-side

Begin with Step 1. Show project structure before writing components.
```

### Content Expansion Prompt

*Use this when adding items to the content pool:*

```
Add [N] content items to /data/items.json for Bullshit.

Each item must:
- Have a specific, verifiable tell (not vague)
- Include a real source for real items
- Real items MUST have publishedDate (within 2–4 weeks) and sourceUrl
- Be categorised: politics | science-health | tech-ai
- Difficulty: [easy 0.3–0.45 | medium 0.46–0.65 | hard 0.66–0.85]
- Use a technique slug from the approved taxonomy

Generate [N real] and [N fake]. Category: [X]. Difficulty: [Y].
Start IDs from [current highest + 1].
Return valid JSON only.
```

---

## 13. Definition of Done

### Application

1. Daily Challenge serves exactly 5 items, same for all players on the same day, resets midnight UTC.
2. Confidence slider snaps to 50/60/70/80/90/100 only. Default is 60%. Locks on confirm.
3. Points calculate correctly for all confidence levels and both outcomes (verified against Section 4 table).
4. Streak multiplier applies at 3 and 5 consecutive correct answers. Resets on wrong.
5. Calibration returns correct classification for test cases: **(a)** 100% wrong / 50% right = overconfident; **(b)** 60% wrong / 60% right = well-calibrated; **(c)** 50% wrong / 90% right = underconfident; **(d)** 5/5 = perfect; **(e)** 0/5 = n/a. (Calculation verified even though not displayed.)
6. Share card generates, displays correctly, and copies to clipboard. No calibration label.
7. App loads and is interactive on mobile Safari at 375px with no horizontal overflow.
8. No TypeScript errors in strict mode. No ESLint errors.
9. Deployed to Vercel with a working public URL.
10. Session completion under 5 minutes for 5 rounds (measured by a real player).
11. All error/empty states from Section 7 handled gracefully.
12. Player can switch between REAL and BULLSHIT before tapping "Lock it in."
13. After reveal, the screen stays until the player taps. No auto-advance.
14. "Read Source →" link appears for real items with a sourceUrl. Opens in new tab. Tapping the link does not advance the round.
15. Publication date shows on reveal for real items with publishedDate. No date shown pre-vote. No date for fabricated items.
16. Results screen shows Total Points, Accuracy, Avg Confidence, Best Streak. No calibration.

### Content

1. 60 items in /data/items.json, all passing schema validation.
2. Every item has a non-empty, specific tell (naming the exact technique, word, or structural feature).
3. At least 18 items per category (±3 acceptable).
4. Difficulty distribution: ~20 easy, ~25 medium, ~15 hard (±3 acceptable).
5. No two items use identical tells.
6. All real items have publishedDate populated.

---

## 14. Open Questions

Deferred, not unanswered. None block Epoch 1 development.

| Question | Current Position | Decision By |
|---|---|---|
| Domain name? | bullshit.game preferred. Fallback: bs.game, playbs.com. | Before Epoch 1 public launch |
| Free Play: infinite or capped? | Uncapped 5-round sessions. Revisit if players grind same items. | Epoch 1 observation |
| Dark mode? | Not in Epoch 1. Off-white is intentional. Add in Epoch 2 if requested. | Epoch 2 planning |
| Image items on slow connections? | No images in Epoch 1. Epoch 2 needs loading state + caption fallback. | Epoch 2 spec |
| Monetisation? | Season passes + optional premium features. Core gameplay never token-gated. | Before Epoch 3 |
| Blockchain for attestation? | Ethereum (credibility) vs Polygon (cost). Needs cost analysis. | Before Epoch 3 blockchain work |
| Does Z push back on the player? | Yes, in Epoch 3. Z can note confidence/accuracy inconsistencies. Requires player history. | Epoch 3 Z spec |
| Content moderation for bias? | Human editorial review before active pool. No automated moderation in Epochs 1–2. | Before live feed (Epoch 2) |

---

## 15. Change Log

### v2.1 — Post-Playtest Revision (March 4, 2026)

The following changes were applied based on playtest feedback:

#### Change 1: Publication Date on Reveal Screen Only

- Publication date displays below source name on reveal screen for real items only.
- Formatted as readable date (e.g. "March 15, 2026") using locale formatting with Safari-safe ISO parsing.
- Fabricated items show no date. Real items missing publishedDate silently omit the date line.
- No date or source information shown pre-vote.
- **Files changed:** RevealPanel.tsx

#### Change 2: Remove Auto-Advance, Add Tap to Continue and Source Link

- The "advancing" phase was removed entirely from GamePhase. State machine simplified to: idle → voted → confirmed → idle (next round) or → complete.
- All auto-advance timers deleted. Player taps to continue after reveal.
- "Tap anywhere to continue" text appears at bottom: 13px, #999999, centred, fades in over 200ms after 500ms delay.
- Entire game surface tappable to advance. Clicks on `<a>` tags (source link) excluded via `e.target.closest("a")`.
- "Read Source →" link shown for real items with sourceUrl. Opens in new tab. Does not trigger advance.
- **Files changed:** types.ts, useGameSession.ts, play/page.tsx, RevealPanel.tsx, globals.css

#### Change 3: Allow Vote Switching Before Lock-In (Bug Fix)

- Players can now switch between REAL and BULLSHIT any number of times before tapping "Lock it in."
- Confidence slider remains visible and retains its current value when switching votes.
- Only the "Lock it in" button press locks the vote and triggers the reveal.
- **Files changed:** useGameSession.ts

#### Change 4: Remove Calibration from Results Screen

- Calibration metric removed from results screen (grid changed from 4 to 3 columns).
- Results screen shows: Total Points, Accuracy, Average Confidence, Best Streak.
- Calibration label removed from share card.
- `calculateCalibration()` in lib/game.ts retained and still called. Result stored in SessionResult for future use.
- **Files changed:** results/page.tsx

### v2.0 — Initial Revised Draft

Consolidated duplicate specifications, resolved internal contradictions, established single source of truth for each element.

---

*End of Document · Bullshit PRD v2.1 · Post-Playtest Revision · Confidential*
