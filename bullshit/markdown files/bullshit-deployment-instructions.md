# BULLSHIT — Deployment & Launch Instructions

## Claude Code Task: Deploy Epoch 1 to playbullshit.com

These instructions prepare the completed Epoch 1 build for public deployment. Apply all changes before deploying. The domain `playbullshit.com` has been purchased and is ready for DNS configuration.

---

## Step 1: Update Domain References

Search the entire codebase for any placeholder domain references and replace them with `playbullshit.com`. Known locations:

- **Share card copy text** (ShareCard.tsx or results page): The auto-populated share text should read:
  `'I scored [SCORE] on today's Bullshit challenge. [ACCURACY] correct. Can you do better? playbullshit.com'`
- **Share card canvas** (ShareCard.tsx): The URL rendered on the 1200×630 share card image should display `playbullshit.com`.
- **Any hardcoded URL strings** in components or lib files.

Run a project-wide search for any of: `bullshit.game`, `bs.game`, `playbs.com`, `placeholder`, `[URL]`, `example.com` — and replace with `playbullshit.com`.

---

## Step 2: Set Open Graph Metadata

In `/app/layout.tsx`, ensure the following `<meta>` tags are present in the `metadata` export (Next.js App Router metadata API):

```typescript
export const metadata: Metadata = {
  title: "Bullshit — Can You Spot It?",
  description: "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
  metadataBase: new URL("https://playbullshit.com"),
  openGraph: {
    title: "Bullshit — Can You Spot It?",
    description: "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
    url: "https://playbullshit.com",
    siteName: "Bullshit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bullshit — A daily media literacy game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bullshit — Can You Spot It?",
    description: "A daily media literacy game. 5 headlines. 3 minutes. How confident are you?",
    images: ["/og-image.png"],
  },
};
```

---

## Step 3: Create Static OG Image

Generate a static Open Graph fallback image at `/public/og-image.png` (1200×630px). This is what appears when someone shares the base URL (not a score share card).

Design spec:
- Background: `#0D0D0D` (dark, matching share card)
- "BULLSHIT" in gold (`#A07820`), large, top-center
- Tagline below in white (`#FFFFFF`): "Can You Spot It?"
- Subtitle in muted text (`#999999`): "A daily media literacy game"
- `playbullshit.com` at the bottom in muted text

Use Canvas API or a simple Node script to generate this as a PNG. Place in `/public/og-image.png`.

---

## Step 4: Verify Content Freshness

Review `/data/items.json` before deploying:

1. Confirm there are 60 items total, passing schema validation.
2. All real items (`isReal: true`) must have `publishedDate` populated.
3. Check that real item dates are within 2–4 weeks of today's date. If any are stale, flag them — they need replacement with current headlines before public sharing.
4. All real items should have `sourceUrl` populated (enables "Read Source →" link).
5. Confirm category distribution: ~20 politics, ~20 science-health, ~20 tech-ai (±3 acceptable).
6. Confirm difficulty distribution: ~20 easy, ~25 medium, ~15 hard (±3 acceptable).

---

## Step 5: Add Favicon

If not already present, add a favicon to `/app/layout.tsx` or place files in `/public/`:

- `/public/favicon.ico` — standard favicon
- `/public/apple-touch-icon.png` — 180×180px for iOS home screen

Keep it simple: the letters "BS" on a dark background (`#0D0D0D`) with gold text (`#A07820`), or similar minimal mark.

---

## Step 6: Production Build Check

Run the following and fix any issues before deploying:

```bash
# TypeScript strict mode — must pass with zero errors
npx tsc --noEmit

# Lint — must pass with zero errors
npx next lint

# Production build — must succeed
npm run build
```

Verify there are no `console.log` statements in the codebase (per PRD quality standards):

```bash
grep -r "console.log" --include="*.ts" --include="*.tsx" src/ app/ components/ lib/ hooks/
```

Remove any found.

---

## Step 7: Deploy to Vercel

1. Ensure the repo is pushed to GitHub.
2. Import the project into Vercel (https://vercel.com/import).
3. Vercel auto-detects Next.js — accept defaults.
4. After initial deploy succeeds on the `.vercel.app` URL, go to **Settings → Domains**.
5. Add `playbullshit.com` and `www.playbullshit.com`.
6. Vercel will provide DNS records. Configure these at the domain registrar:
   - `A` record: `76.76.21.21` (Vercel's IP)
   - `CNAME` for `www`: `cname.vercel-dns.com`
7. SSL is provisioned automatically by Vercel.
8. Wait for DNS propagation (usually minutes, can take up to 48 hours).

---

## Step 8: Post-Deploy Smoke Test

Run through this checklist on the live `playbullshit.com` URL:

### Functionality
- [ ] Daily Challenge loads and serves 5 rounds
- [ ] Can switch between REAL and BULLSHIT before locking in
- [ ] Confidence slider snaps to 50/60/70/80/90/100, defaults to 60%
- [ ] "Lock it in" triggers reveal animation (~500ms)
- [ ] Reveal screen stays until player taps — no auto-advance
- [ ] "Tap anywhere to continue" hint fades in after reveal
- [ ] "Read Source →" link appears for real items with sourceUrl, opens in new tab
- [ ] Tapping source link does NOT advance the round
- [ ] Publication date shows on reveal for real items only
- [ ] Results screen shows: Total Points, Accuracy, Avg Confidence, Best Streak (no calibration)
- [ ] Free Play mode works with "Play Again" option
- [ ] Daily Challenge blocks replay after completion, offers Free Play

### Share Card
- [ ] Share card generates at 1200×630px
- [ ] Shows: BULLSHIT, date, score, accuracy, 5 round indicators
- [ ] Does NOT show calibration label
- [ ] Copy to clipboard works
- [ ] URL on share card reads `playbullshit.com`

### Cross-Browser / Mobile
- [ ] Mobile Safari (iOS) — no horizontal overflow at 375px
- [ ] Chrome mobile (Android) — functional, no layout breaks
- [ ] Chrome desktop — functional
- [ ] No JavaScript errors in console on any browser

### Meta / Social
- [ ] Paste `playbullshit.com` into Twitter/X compose — OG image and description appear
- [ ] Paste into iMessage / Slack — link preview looks correct
- [ ] `https://playbullshit.com` resolves with valid SSL

### Error States
- [ ] Refresh mid-session — session state preserved in React memory
- [ ] Complete Daily Challenge, revisit — shows today's score, offers Free Play
- [ ] Free Play after exhausting pool — shows appropriate message

---

## Notes

- The `.vercel.app` URL works immediately and can be shared while DNS propagates for the custom domain.
- Vercel Analytics (built-in) is sufficient for Epoch 1. No additional analytics setup needed.
- No environment variables are required for Epoch 1 (no API keys, no database).
