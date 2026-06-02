# Word Chain Game — Growth Loop Design

**Date:** 2026-06-02
**Goal:** Increase both retention (daily return) and acquisition (new traffic) by building a self-reinforcing viral loop: **share → click → compete → return**.
**Target audience:** Global English speakers (Wordle-style daily game).
**Constraint:** Serverless-first. Prefer client + localStorage + URL-encoded state. The only server-side code introduced is Next.js built-in OG image generation (edge runtime, no DB, no operational backend).

---

## Background

The current MVP already has the skeleton of a Wordle-style loop — daily word, 60-second timer, localStorage streak, native share — but the gears that make the loop spin are weak:

| Loop stage | Current | Gap |
|---|---|---|
| Play | Daily word + 60s timer | One session per visit; little reason to stay |
| Share | Plain-text native share | No visually distinctive, brag-worthy result → weak share motivation |
| Click (acquisition) | — | Shared links have no rich preview (OG) → low click-through |
| Compete | — | No friend comparison / head-to-head |
| Return (retention) | localStorage streak | Streak invisible, no stats or rewards → weak return motivation |

This design closes those gaps with three features on a shared serverless foundation.

### Known issue to fix as part of this work

[`getTodayWord()`](../../../lib/words.ts) claims to use UTC but actually uses local time (`new Date().getFullYear()`, etc.). For friend challenges to reference the same puzzle worldwide, the daily seed must be deterministic and UTC-based. This is corrected in Section 0.

---

## Section 0 — Shared Infrastructure (foundation for all three features)

### (a) Deterministic puzzle number

- Add `getPuzzleNumber(date?): number` — days elapsed since a fixed launch epoch (UTC). Yields a stable label like `Word Chain #123`.
- Add `getWordByPuzzleNumber(n): string` — returns the start word for an arbitrary puzzle number, not just today. Required because friend challenges can reference past puzzles.
- Refactor `getTodayWord()` to `getWordByPuzzleNumber(getPuzzleNumber())` and switch the day calculation to UTC so all users worldwide get the same puzzle on the same day.

### (b) Extended localStorage data model

Extend `GameData` in [`lib/storage.ts`](../../../lib/storage.ts):

```ts
interface GameData {
  // existing
  lastPlayedDate: string;
  streak: number;
  bestScore: number;
  gamesPlayed: number;
  // new
  maxStreak: number;                                        // longest streak ever
  history: { date: string; puzzleNo: number; score: number; wordCount: number }[];
}
```

- `updateGameStats(score, ...)` appends one entry per day to `history` (the existing once-per-day guard prevents duplicates) and updates `maxStreak = max(maxStreak, streak)`.
- A migration path: when reading an old `GameData` without the new fields, default `maxStreak = streak` and `history = []`.
- All client-side. No server.

**Interface summary:** Section 0 exposes `getPuzzleNumber`, `getWordByPuzzleNumber`, and the extended `GameData` + `getGameData()/updateGameStats()`. Sections 1–3 consume these and do not touch each other's internals.

---

## Section 1 — Emoji Result Share + Dynamic OG Preview (acquisition engine)

### (a) Spoiler-free emoji grid

Replace the plain-text share in [`ShareButton.tsx`](../../../components/ShareButton.tsx) with a visual, instantly-recognizable result that does **not** reveal the actual words (so it's safe to post publicly):

```
Word Chain #123
🔗 7 words · 142 pts · 🔥 5

🟩🟩🟨 🟩🟨 🟩🟩🟩🟩 🟨🟨 ...
play → dailywordchain.com/c/<code>
```

- One tile = one letter; tiles grouped per word; longer words use a darker color (e.g. light → dark by word length bucket). No letters shown.
- `buildShareText()` produces this format. The included link is the player's own challenge URL (ties into Section 3).
- Keep the existing `navigator.share` → clipboard fallback behavior.

### (b) Dynamic OG image

- Use Next.js built-in `ImageResponse` (edge runtime — no DB, no standing backend).
- Route: `app/c/[code]/opengraph-image.tsx` decodes score + puzzle number from the URL code and renders a branded card: *"James scored 142 · Word Chain #123 · Can you beat it?"*
- `generateMetadata` in `app/c/[code]/page.tsx` sets the title/description dynamically so the unfurled link is compelling.
- Effect: a posted link unfurls as a rich card on KakaoTalk / X / Discord / iMessage, multiplying click-through versus a bare text link.

---

## Section 2 — Stats & Streak Screen (retention engine)

Make existing players feel invested, using the validated Wordle stats-modal pattern.

- **Stats modal** (`components/StatsModal.tsx`): games played · current streak · max streak · best score · average score · **score-distribution histogram**.
- **30-day calendar heatmap**: colors days played → triggers the "fill the empty squares" urge that reinforces streaks.
- Entry points: a 📊 icon in the header (in `app/page.tsx` / layout) and a "View Stats" action on the [Results](../../../components/Results.tsx) screen.
- All values computed client-side from Section 0's `history`. No server.
- **Out of scope (deferred):** streak-freeze (one free missed day). Noted as a future enhancement; not built in this iteration to keep scope focused.

---

## Section 3 — Friend Challenge via URL (acquisition + retention)

Asynchronous 1:1 competition with zero backend.

### Create a challenge

- On the Results screen, "Challenge a friend" encodes `{ p: puzzleNo, s: score, n: nickname? }` as base64url into `dailywordchain.com/c/<code>`.
- Nickname is optional; if omitted, the card reads "A friend scored …". (Nickname capture is a lightweight optional input on the Results screen — no account.)

### Accept a challenge

- Friend opens the link → landing at `app/c/[code]/page.tsx`: *"James scored 142 on #123. Beat it?"*
- Playing the challenge forces the **same puzzle** via `getWordByPuzzleNumber(p)` (even if it is a past day) — the game component gains a "forced puzzle" mode.
- On finish, compare: *"You beat James by 8! 🎉"* / *"Lost by 12 — try again"* → a **"Challenge back"** button keeps the viral chain going.
- The same `app/c/[code]` route carries the OG image from Section 1(b), so challenge links unfurl as rich cards.

### Encoding

- Compact JSON → base64url. Keep URLs short. Decoder is shared between the page and the OG image route.

---

## Architecture & Data Flow Summary

```
lib/words.ts      getPuzzleNumber(), getWordByPuzzleNumber()  ← Section 0a
lib/storage.ts    GameData{maxStreak,history}, updateGameStats ← Section 0b
lib/share.ts      buildShareText(), encodeChallenge()/decodeChallenge()  ← new, used by 1 & 3
components/
  ShareButton.tsx     emoji grid + challenge link             ← Section 1a
  StatsModal.tsx      stats + histogram + heatmap (new)        ← Section 2
  Results.tsx         + Challenge a friend, + View Stats       ← Sections 2,3
  WordChainGame.tsx   + forced-puzzle mode                     ← Section 3
app/
  page.tsx            + 📊 stats entry point                  ← Section 2
  c/[code]/page.tsx          challenge landing + compare (new) ← Section 3
  c/[code]/opengraph-image.tsx   dynamic OG card (new, edge)   ← Section 1b
```

**Error handling:** malformed/old challenge codes → fall back to today's normal puzzle with a gentle notice; missing/old `GameData` fields → migrate with safe defaults; OG image route → render a generic branded card if the code can't be decoded.

**Testing:** unit-test `getPuzzleNumber`/`getWordByPuzzleNumber` (determinism, UTC, wraparound past 365), `encode/decodeChallenge` (round-trip, malformed input), and `updateGameStats` (history append, once-per-day guard, maxStreak). Manually verify OG unfurl with a link debugger and the challenge compare flow.

---

## Recommended Implementation Order

1. **Section 0** — puzzle number + data model (prerequisite for the rest)
2. **Section 1** — emoji + OG (least effort, largest acquisition lift)
3. **Section 2** — stats & streak (plug the leaky bucket)
4. **Section 3** — friend challenge (depends on 0 and 1; accelerates the loop with competition)

All four ship serverless (client + Next.js edge OG function). Existing AdSense placements are preserved.

## Out of Scope / Future

- Streak-freeze mechanic.
- Global leaderboard (would require a DB / serverless KV).
- Push notifications / daily reminders (web push needs a send-side server).
- Word definitions on tap, difficulty modes, themes — separate enhancements.
