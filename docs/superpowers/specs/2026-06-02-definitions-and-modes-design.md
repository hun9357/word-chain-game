# Word Definitions + Play Modes — Design

**Date:** 2026-06-02
**Goal:** Add two engagement features in one design: (1) tap-to-see **word definitions**, and (2) selectable **play modes** (time + difficulty). Both increase session value and replayability.
**Constraint:** Serverless (client + existing public dictionary API + URL-encoded challenges). No new backend.

---

## Feature 1 — Word Definitions

Tapping a played word reveals its dictionary definition. Educational stickiness; no cheating risk (words are already played).

### Data
- Add `getDefinition(word: string): Promise<string | null>` to `lib/dictionary.ts`.
  - Fetch `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (same endpoint already used by `validateWord`, `cache: 'force-cache'`).
  - Parse the first entry's first meaning: format as `"{partOfSpeech} — {definition}"` (e.g., `"noun — a large body of salt water"`).
  - On network error, non-OK response, or unexpected shape: return `null`.
  - **In-memory cache:** a module-level `Map<string, string | null>` keyed by lowercased word, so repeat taps and already-validated words don't refetch.

### UI — `components/DefinitionPopover.tsx` (new)
- Props: `{ word: string; onClose: () => void }`.
- On mount, calls `getDefinition(word)`; shows three states: loading (`…`), definition text, or `"No definition found."`.
- Editorial styling: paper background, hairline border, small rounded; the word in Fraunces, definition in Inter `text-ink-muted`. Dismiss on outside click / × (same pattern as `StatsModal`).
- Rendered as a lightweight popover/modal (reuse the StatsModal overlay pattern for simplicity and mobile-friendliness).

### Wiring
- **During play:** `WordChain.tsx` tiles become buttons; tapping sets the selected word and opens the popover.
- **Results:** `Results.tsx` "Your Chain" words become tappable; same popover.
- Tapping is the only new interaction; gameplay/timer is unaffected (the player chooses to tap).

---

## Feature 2 — Play Modes (time + difficulty)

A mode = **time** (30 / 60 / 120 s) × **difficulty** = minimum word length (Easy 2+, Normal 3+, Hard 4+). Applies to the daily puzzle too.

### Model
- Represent a mode as `{ time: number; minLen: number }` where `time ∈ {30,60,120}`, `minLen ∈ {2,3,4}`.
- **Default mode = Easy / 60s = `{ time: 60, minLen: 2 }`** — preserves today's exact behavior. This is also how legacy challenge links (no mode encoded) are interpreted.
- The **start word is unchanged across modes** — `getWordByPuzzleNumber(puzzleNo)`. Mode changes only the rules, never the word, so puzzle numbering and the daily identity stay intact.

### Pre-game UI (`WordChainGame.tsx`)
- Two editorial segmented controls on the pre-game screen: **Time** (30s · 60s · 120s) and **Difficulty** (Easy · Normal · Hard), defaulting to 60s / Easy.
- Selected mode is held in component state and passed to gameplay.

### Gameplay changes
- **Timer:** pass `duration={mode.time}` to the existing `Timer` (already supports `duration`).
- **Validation:** in `handleSubmit`, after the chain/duplicate checks and before/with dictionary validation, enforce `word.length >= mode.minLen`; on failure show `Use {minLen}+ letter words` (red error, existing style). Easy (minLen 2) matches the current `validateWord` floor, so Easy is a no-op rule change.

### Forced challenges
- When a challenge link carries a mode, the accepted game is locked to that mode (the segmented controls are hidden/disabled on the challenge page so both players use identical rules).

---

## Feature 2b — Mode-aware sharing & challenges

- Extend `Challenge` in `lib/share.ts` from `{ p, s, n? }` to `{ p, s, n?, t?, m? }` (`t` = time, `m` = minLen). `encodeChallenge` omits `t`/`m` when they equal the default (60/2) to keep URLs short; `decodeChallenge` fills missing `t`/`m` with the defaults (60/2) — this is the legacy-link compatibility path.
- **Comparison validity:** the Results challenge banner compares scores only when the player's mode matches the challenge's `{t, m}`. On mismatch, show a neutral note: `Played a different mode ({t}s · {m}+) — scores aren't directly comparable.` instead of beat/tie/loss.
- **Share text** (`buildShareText`): append the mode to the header line, e.g. `Word Chain #155 · 60s · 3+`. (`2+` shown for Easy too, for clarity.)
- **OG card:** unchanged (puzzle # + score headline already conveys the gist); mode is not added to the image to avoid edge-runtime churn.

---

## Feature 2c — Streak & stats interaction (minimal)

- **Streak:** unchanged — playing *any* mode counts for the day (the existing once-per-day guard in `updateGameStats` stands).
- **Stats:** remain global (not split by mode — YAGNI). `HistoryEntry` gains optional `time?` and `minLen?` fields, stored for possible future use; the StatsModal UI does **not** change. `updateGameStats(score, wordCount, mode?)` accepts an optional mode; when omitted it records nothing extra (back-compatible).

---

## Out of Scope

- Per-mode leaderboards or per-mode stat breakdowns.
- Practice/endless mode (separate future feature).
- Hint system.
- Changing the OG image to show mode.

---

## Verification

- Unit tests: `getDefinition` (parse success → formatted string; failure/shape → null; cache hit avoids second fetch via a mocked `fetch`); `encode/decodeChallenge` round-trips with and without mode, and legacy (no-mode) decode → `{t:60,m:2}`; `buildShareText` includes the mode label; min-length validation logic if extracted to a pure helper.
- `npm run build` passes; `npm test` green.
- Manual: tap definitions during play and on results (loading/empty/error states); play each time and difficulty; verify min-length rejection message; verify challenge link locks mode and the comparison/mismatch banner; verify share text shows the mode.
