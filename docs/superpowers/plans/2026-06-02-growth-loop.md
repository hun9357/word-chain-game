# Growth Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a serverless viral loop (share → click → compete → return) on the existing Daily Word Chain game: deterministic puzzle numbers + richer stats storage, spoiler-free emoji sharing with dynamic OG cards, a stats/streak screen, and URL-encoded friend challenges.

**Architecture:** All new state lives client-side (localStorage) or in the URL (base64url-encoded challenges). The only server-side code is a Next.js edge OG-image route — no database, no standing backend. Pure logic (puzzle numbers, encode/decode, stats) is extracted into `lib/` modules and unit-tested; UI is verified manually.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vitest (added in Task 1), `next/og` for OG images.

**Spec:** [docs/superpowers/specs/2026-06-02-growth-loop-design.md](../specs/2026-06-02-growth-loop-design.md)

---

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `vitest.config.ts` | Test runner config (new) | 1 |
| `lib/words.ts` | `getPuzzleNumber`, `getWordByPuzzleNumber`, `getTodayWord` (modify) | 2 |
| `lib/storage.ts` | Extended `GameData` + migration + history (modify) | 3 |
| `lib/share.ts` | `encodeChallenge`/`decodeChallenge`, `chainToEmoji`, `buildShareText` (new) | 4, 5 |
| `lib/stats.ts` | `computeStats(data)` aggregation (new) | 8 |
| `components/ShareButton.tsx` | Emoji share + challenge link (modify) | 6 |
| `components/StatsModal.tsx` | Stats + histogram + 30-day heatmap (new) | 9 |
| `components/Results.tsx` | "View Stats" + "Challenge a friend" + nickname (modify) | 10, 13 |
| `components/WordChainGame.tsx` | Pass wordCount to stats; forced-puzzle mode (modify) | 3, 11 |
| `app/page.tsx` | 📊 stats entry point (modify) | 10 |
| `app/c/[code]/opengraph-image.tsx` | Dynamic OG card, edge runtime (new) | 7 |
| `app/c/[code]/page.tsx` | Challenge landing + compare + "Challenge back" (new) | 7, 12 |

**Execution note:** Phases are independent after Phase A. Each phase leaves the app working and shippable on its own.

---

## Phase A — Foundation (Spec Section 0)

### Task 1: Add Vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Test: `lib/__tests__/sanity.test.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2`
Expected: `vitest` added to devDependencies, no errors.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Write a sanity test**

Create `lib/__tests__/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the test to verify the runner works**

Run: `npm test`
Expected: PASS — 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/__tests__/sanity.test.ts
git commit -m "test: add Vitest test infrastructure"
```

---

### Task 2: Deterministic puzzle numbers

**Files:**
- Modify: `lib/words.ts:46-54` (replace `getTodayWord`, add two functions)
- Test: `lib/words.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/words.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getPuzzleNumber,
  getWordByPuzzleNumber,
  DAILY_WORDS,
  LAUNCH_EPOCH_UTC,
} from './words';

describe('getPuzzleNumber', () => {
  it('returns 1 on the launch day (UTC)', () => {
    const launchDay = new Date(LAUNCH_EPOCH_UTC);
    expect(getPuzzleNumber(launchDay)).toBe(1);
  });

  it('increments by 1 each UTC day', () => {
    const day = new Date(LAUNCH_EPOCH_UTC + 10 * 86400000);
    expect(getPuzzleNumber(day)).toBe(11);
  });

  it('is stable across times within the same UTC day', () => {
    const morning = new Date(LAUNCH_EPOCH_UTC + 5 * 86400000 + 1000);
    const evening = new Date(LAUNCH_EPOCH_UTC + 5 * 86400000 + 23 * 3600000);
    expect(getPuzzleNumber(morning)).toBe(getPuzzleNumber(evening));
  });
});

describe('getWordByPuzzleNumber', () => {
  it('returns the first word for puzzle #1', () => {
    expect(getWordByPuzzleNumber(1)).toBe(DAILY_WORDS[0]);
  });

  it('wraps around past the end of the list', () => {
    expect(getWordByPuzzleNumber(DAILY_WORDS.length + 1)).toBe(DAILY_WORDS[0]);
  });

  it('handles puzzle numbers below 1 without crashing', () => {
    expect(typeof getWordByPuzzleNumber(0)).toBe('string');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/words.test.ts`
Expected: FAIL — `getPuzzleNumber`/`LAUNCH_EPOCH_UTC` not exported.

- [ ] **Step 3: Implement the functions**

In `lib/words.ts`, replace the existing `getTodayWord` (lines ~42-54) with:

```ts
/**
 * Fixed launch epoch (UTC midnight). Puzzle #1 is this day.
 */
export const LAUNCH_EPOCH_UTC = Date.UTC(2024, 0, 1);

/**
 * Stable puzzle number for a given date, based on whole UTC days since launch.
 * All users worldwide share the same puzzle number on the same UTC day.
 */
export function getPuzzleNumber(date: Date = new Date()): number {
  const dayMs = 86400000;
  const dayUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((dayUTC - LAUNCH_EPOCH_UTC) / dayMs) + 1;
}

/**
 * Start word for an arbitrary puzzle number (wraps around the word list).
 * Supports past/future puzzles for friend challenges.
 */
export function getWordByPuzzleNumber(n: number): string {
  const len = DAILY_WORDS.length;
  const idx = (((n - 1) % len) + len) % len;
  return DAILY_WORDS[idx];
}

/**
 * Today's starting word (UTC-based, deterministic worldwide).
 */
export function getTodayWord(): string {
  return getWordByPuzzleNumber(getPuzzleNumber());
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/words.test.ts`
Expected: PASS — 6 passed.

- [ ] **Step 5: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/words.ts lib/words.test.ts
git commit -m "feat: add deterministic UTC puzzle numbers"
```

---

### Task 3: Extend game data with history and max streak

**Files:**
- Modify: `lib/storage.ts` (extend `GameData`, `getGameData` migration, `updateGameStats` signature)
- Modify: `components/WordChainGame.tsx:50-59` (pass word count to `updateGameStats`)
- Test: `lib/storage.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory localStorage stub
const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  });
});

import { getGameData, saveGameData, updateGameStats } from './storage';

describe('getGameData migration', () => {
  it('fills new fields when reading legacy data', () => {
    store['dailyWordChain'] = JSON.stringify({
      lastPlayedDate: 'x', streak: 3, bestScore: 90, gamesPlayed: 4,
    });
    const data = getGameData();
    expect(data.maxStreak).toBe(3);
    expect(data.history).toEqual([]);
  });
});

describe('updateGameStats', () => {
  it('appends one history entry and updates maxStreak', () => {
    const before = getGameData();
    expect(before.history.length).toBe(0);
    updateGameStats(75, 6);
    const after = getGameData();
    expect(after.history.length).toBe(1);
    expect(after.history[0].score).toBe(75);
    expect(after.history[0].wordCount).toBe(6);
    expect(after.maxStreak).toBe(1);
  });

  it('does not double-record when played twice the same day', () => {
    updateGameStats(50, 4);
    updateGameStats(80, 7);
    expect(getGameData().history.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/storage.test.ts`
Expected: FAIL — `maxStreak`/`history` undefined, `updateGameStats` arity mismatch.

- [ ] **Step 3: Extend the `GameData` interface**

In `lib/storage.ts`, replace the `GameData` interface (lines 3-8) with:

```ts
export interface HistoryEntry {
  date: string;
  puzzleNo: number;
  score: number;
  wordCount: number;
}

export interface GameData {
  lastPlayedDate: string;
  streak: number;
  bestScore: number;
  gamesPlayed: number;
  maxStreak: number;
  history: HistoryEntry[];
}

const EMPTY_DATA: GameData = {
  lastPlayedDate: '', streak: 0, bestScore: 0, gamesPlayed: 0, maxStreak: 0, history: [],
};
```

- [ ] **Step 4: Update `getGameData` with migration**

Replace the body of `getGameData` so both the no-data and parsed branches fill defaults:

```ts
export function getGameData(): GameData {
  if (typeof window === 'undefined') {
    return { ...EMPTY_DATA };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...EMPTY_DATA };
    const parsed = JSON.parse(data) as Partial<GameData>;
    return {
      ...EMPTY_DATA,
      ...parsed,
      maxStreak: parsed.maxStreak ?? parsed.streak ?? 0,
      history: parsed.history ?? [],
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return { ...EMPTY_DATA };
  }
}
```

- [ ] **Step 5: Update `updateGameStats` to record history**

Replace `updateGameStats` (add `wordCount` param, import puzzle number, append history, track maxStreak):

At the top of `lib/storage.ts`, add the import:

```ts
import { getPuzzleNumber } from './words';
```

Then replace the function:

```ts
export function updateGameStats(
  score: number,
  wordCount: number
): { streak: number; isNewBest: boolean } {
  const today = new Date().toDateString();
  const data = getGameData();

  if (data.lastPlayedDate === today) {
    return { streak: data.streak, isNewBest: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = data.lastPlayedDate === yesterday.toDateString();

  const newStreak = wasYesterday ? data.streak + 1 : 1;
  const isNewBest = score > data.bestScore;

  saveGameData({
    lastPlayedDate: today,
    streak: newStreak,
    bestScore: isNewBest ? score : data.bestScore,
    gamesPlayed: data.gamesPlayed + 1,
    maxStreak: Math.max(data.maxStreak, newStreak),
    history: [
      ...data.history,
      { date: today, puzzleNo: getPuzzleNumber(), score, wordCount },
    ],
  });

  return { streak: newStreak, isNewBest };
}
```

- [ ] **Step 6: Update the caller in `WordChainGame.tsx`**

In `components/WordChainGame.tsx`, in `finishGame` (line ~54), change:

```ts
    const stats = updateGameStats(finalScore);
```

to:

```ts
    const stats = updateGameStats(finalScore, wordChain.length);
```

- [ ] **Step 7: Run tests and build**

Run: `npx vitest run lib/storage.test.ts && npm run build`
Expected: tests PASS (3 passed), build succeeds.

- [ ] **Step 8: Commit**

```bash
git add lib/storage.ts lib/storage.test.ts components/WordChainGame.tsx
git commit -m "feat: record game history and max streak in localStorage"
```

---

## Phase B — Emoji Share + OG Preview (Spec Section 1)

### Task 4: Challenge encode/decode

**Files:**
- Create: `lib/share.ts`
- Test: `lib/share.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/share.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { encodeChallenge, decodeChallenge } from './share';

describe('challenge encode/decode', () => {
  it('round-trips a challenge', () => {
    const code = encodeChallenge({ p: 123, s: 142, n: 'James' });
    expect(decodeChallenge(code)).toEqual({ p: 123, s: 142, n: 'James' });
  });

  it('round-trips without a nickname', () => {
    const code = encodeChallenge({ p: 7, s: 50 });
    expect(decodeChallenge(code)).toEqual({ p: 7, s: 50 });
  });

  it('produces a URL-safe code (no +, /, =)', () => {
    const code = encodeChallenge({ p: 999, s: 9999, n: 'a/b+c=' });
    expect(code).not.toMatch(/[+/=]/);
  });

  it('returns null for malformed input', () => {
    expect(decodeChallenge('!!!not-base64!!!')).toBeNull();
    expect(decodeChallenge('')).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    const code = encodeChallenge({ p: 1, s: 1 });
    // tamper: decode something that is valid base64 but wrong shape
    expect(decodeChallenge(btoa('{"x":1}').replace(/=+$/, ''))).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/share.test.ts`
Expected: FAIL — module `./share` not found.

- [ ] **Step 3: Implement encode/decode**

Create `lib/share.ts`:

```ts
export interface Challenge {
  p: number; // puzzle number
  s: number; // challenger score
  n?: string; // challenger nickname (optional, max 16 chars)
}

function b64urlEncode(input: string): string {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeChallenge(c: Challenge): string {
  const clean: Challenge = { p: c.p, s: c.s };
  if (c.n) clean.n = c.n.slice(0, 16);
  return b64urlEncode(JSON.stringify(clean));
}

export function decodeChallenge(code: string): Challenge | null {
  if (!code) return null;
  try {
    const obj = JSON.parse(b64urlDecode(code));
    if (typeof obj?.p !== 'number' || typeof obj?.s !== 'number') return null;
    const result: Challenge = { p: obj.p, s: obj.s };
    if (typeof obj.n === 'string') result.n = obj.n.slice(0, 16);
    return result;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/share.test.ts`
Expected: PASS — 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/share.ts lib/share.test.ts
git commit -m "feat: add URL-safe challenge encode/decode"
```

---

### Task 5: Emoji grid + share text

**Files:**
- Modify: `lib/share.ts` (add `chainToEmoji`, `buildShareText`)
- Modify: `lib/share.test.ts` (add cases)

- [ ] **Step 1: Add the failing tests**

Append to `lib/share.test.ts`:

```ts
import { chainToEmoji, buildShareText } from './share';

describe('chainToEmoji', () => {
  it('uses one tile per letter, grouped per word by space', () => {
    // 'CAT'(3) 'TABLE'(5) -> yellow x3, green x5
    expect(chainToEmoji(['CAT', 'TABLE'])).toBe('🟨🟨🟨 🟩🟩🟩🟩🟩');
  });

  it('uses blue for long words (7+)', () => {
    expect(chainToEmoji(['ELEPHANT'])).toBe('🟦🟦🟦🟦🟦🟦🟦🟦');
  });
});

describe('buildShareText', () => {
  it('includes puzzle number, counts, score and link but not the words', () => {
    const text = buildShareText({
      puzzleNo: 123, words: ['CAT', 'TABLE'], score: 142, streak: 5,
      url: 'https://dailywordchain.com/c/abc',
    });
    expect(text).toContain('Word Chain #123');
    expect(text).toContain('142');
    expect(text).toContain('https://dailywordchain.com/c/abc');
    expect(text).not.toContain('CAT');
    expect(text).not.toContain('TABLE');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/share.test.ts`
Expected: FAIL — `chainToEmoji`/`buildShareText` not exported.

- [ ] **Step 3: Implement the helpers**

Append to `lib/share.ts`:

```ts
/**
 * Spoiler-free emoji rendering: one tile per letter, colored by word length.
 * 2-3 letters = 🟨, 4-6 = 🟩, 7+ = 🟦. Words separated by spaces.
 */
export function chainToEmoji(words: string[]): string {
  const tileFor = (len: number) => (len >= 7 ? '🟦' : len >= 4 ? '🟩' : '🟨');
  return words
    .map((w) => tileFor(w.length).repeat(w.length))
    .join(' ');
}

export function buildShareText(opts: {
  puzzleNo: number;
  words: string[];
  score: number;
  streak: number;
  url: string;
}): string {
  const { puzzleNo, words, score, streak, url } = opts;
  const streakLine = streak > 1 ? ` · 🔥 ${streak}` : '';
  return `Word Chain #${puzzleNo}
🔗 ${words.length} words · ${score} pts${streakLine}

${chainToEmoji(words)}

play → ${url}

#DailyWordChain`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/share.test.ts`
Expected: PASS — 7 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/share.ts lib/share.test.ts
git commit -m "feat: add spoiler-free emoji grid and share text"
```

---

### Task 6: Wire emoji share into ShareButton

**Files:**
- Modify: `components/ShareButton.tsx` (full rewrite)

This task is UI; verify manually (no unit test).

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `components/ShareButton.tsx`:

```tsx
'use client';

import { getPuzzleNumber } from '@/lib/words';
import { buildShareText, encodeChallenge } from '@/lib/share';

interface ShareButtonProps {
  words: string[]; // chained words (excluding the start word)
  startWord: string;
  score: number;
  streak: number;
  nickname?: string;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dailywordchain.com';

export default function ShareButton({
  words,
  startWord,
  score,
  streak,
  nickname,
}: ShareButtonProps) {
  const handleShare = async () => {
    const puzzleNo = getPuzzleNumber();
    const code = encodeChallenge({ p: puzzleNo, s: score, n: nickname });
    const url = `${SITE_URL}/c/${code}`;

    // Render the full chain (start word + chained words) as spoiler-free tiles.
    const text = buildShareText({
      puzzleNo,
      words: [startWord, ...words],
      score,
      streak,
      url,
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Daily Word Chain', text });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Results copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Share Results
    </button>
  );
}
```

- [ ] **Step 2: Update the caller in `Results.tsx`**

In `components/Results.tsx`, replace the `<ShareButton .../>` line (~82):

```tsx
        <ShareButton words={words} startWord={startWord} score={score} streak={streak} />
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build && npm run dev`
Manual: play a game, tap "Share Results", confirm the copied/shared text shows `Word Chain #N`, emoji tiles, score, and a `/c/<code>` link — and does NOT contain any actual words.

- [ ] **Step 4: Commit**

```bash
git add components/ShareButton.tsx components/Results.tsx
git commit -m "feat: spoiler-free emoji share with challenge link"
```

---

### Task 7: Challenge route + dynamic OG image

**Files:**
- Create: `app/c/[code]/opengraph-image.tsx`
- Create: `app/c/[code]/page.tsx` (minimal landing; compare logic added in Task 12)

This task is server/edge UI; verify manually.

- [ ] **Step 1: Create the OG image route**

Create `app/c/[code]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { decodeChallenge } from '@/lib/share';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);
  const headline = c
    ? `${c.n ?? 'A friend'} scored ${c.s}`
    : 'Daily Word Chain';
  const sub = c ? `Word Chain #${c.p} · Can you beat it?` : 'Play the daily word puzzle';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#4f46e5,#4338ca)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800 }}>🔗 {headline}</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9 }}>{sub}</div>
        <div style={{ fontSize: 28, marginTop: 48, opacity: 0.7 }}>dailywordchain.com</div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Create the minimal challenge landing page**

Create `app/c/[code]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { decodeChallenge } from '@/lib/share';

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const c = decodeChallenge(params.code);
  const title = c ? `${c.n ?? 'A friend'} scored ${c.s} — can you beat it?` : 'Daily Word Chain';
  return {
    title,
    description: c ? `Word Chain #${c.p}. Beat ${c.s} points!` : 'Play the daily word puzzle.',
  };
}

export default function ChallengePage({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          {c ? `${c.n ?? 'A friend'} scored ${c.s}` : 'Daily Word Chain'}
        </h1>
        <p className="text-gray-600 mb-6">
          {c ? `Word Chain #${c.p}. Can you beat it?` : 'Play the daily puzzle.'}
        </p>
        <a href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl">
          Play
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build && npm run dev`
Manual:
- Open `http://localhost:3000/c/<code>` (use a code copied from a share) — landing page shows the challenger score.
- Open `http://localhost:3000/c/<code>/opengraph-image` — a 1200×630 PNG card renders.
- View page source: `<title>` and `og:` tags reflect the challenge.

- [ ] **Step 4: Commit**

```bash
git add app/c
git commit -m "feat: challenge landing page and dynamic OG card"
```

---

## Phase C — Stats & Streak Screen (Spec Section 2)

### Task 8: Stats aggregation logic

**Files:**
- Create: `lib/stats.ts`
- Test: `lib/stats.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/stats.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';
import type { GameData } from './storage';

const data: GameData = {
  lastPlayedDate: 'x',
  streak: 2,
  bestScore: 142,
  gamesPlayed: 3,
  maxStreak: 5,
  history: [
    { date: 'a', puzzleNo: 1, score: 50, wordCount: 4 },
    { date: 'b', puzzleNo: 2, score: 100, wordCount: 8 },
    { date: 'c', puzzleNo: 3, score: 142, wordCount: 11 },
  ],
};

describe('computeStats', () => {
  it('reports core aggregates', () => {
    const s = computeStats(data);
    expect(s.gamesPlayed).toBe(3);
    expect(s.currentStreak).toBe(2);
    expect(s.maxStreak).toBe(5);
    expect(s.bestScore).toBe(142);
    expect(s.averageScore).toBe(97); // round((50+100+142)/3)
  });

  it('buckets scores into a distribution that sums to games played', () => {
    const s = computeStats(data);
    const total = s.distribution.reduce((n, b) => n + b.count, 0);
    expect(total).toBe(3);
  });

  it('returns a 30-entry calendar window', () => {
    const s = computeStats(data);
    expect(s.last30.length).toBe(30);
  });

  it('handles empty history without dividing by zero', () => {
    const empty: GameData = { ...data, gamesPlayed: 0, history: [] };
    const s = computeStats(empty);
    expect(s.averageScore).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/stats.test.ts`
Expected: FAIL — module `./stats` not found.

- [ ] **Step 3: Implement `computeStats`**

Create `lib/stats.ts`:

```ts
import type { GameData } from './storage';

export interface DistributionBucket {
  label: string;
  count: number;
}

export interface CalendarDay {
  date: string; // toDateString()
  played: boolean;
  score: number;
}

export interface StatsSummary {
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number;
  averageScore: number;
  distribution: DistributionBucket[];
  last30: CalendarDay[];
}

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '0-49', min: 0, max: 49 },
  { label: '50-99', min: 50, max: 99 },
  { label: '100-149', min: 100, max: 149 },
  { label: '150+', min: 150, max: Infinity },
];

export function computeStats(data: GameData): StatsSummary {
  const scores = data.history.map((h) => h.score);
  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const distribution = BUCKETS.map((b) => ({
    label: b.label,
    count: scores.filter((s) => s >= b.min && s <= b.max).length,
  }));

  const byDate = new Map(data.history.map((h) => [h.date, h.score]));
  const last30: CalendarDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    last30.push({
      date: key,
      played: byDate.has(key),
      score: byDate.get(key) ?? 0,
    });
  }

  return {
    gamesPlayed: data.gamesPlayed,
    currentStreak: data.streak,
    maxStreak: data.maxStreak,
    bestScore: data.bestScore,
    averageScore,
    distribution,
    last30,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/stats.test.ts`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/stats.ts lib/stats.test.ts
git commit -m "feat: add stats aggregation (averages, distribution, calendar)"
```

---

### Task 9: Stats modal component

**Files:**
- Create: `components/StatsModal.tsx`

UI task; verify manually.

- [ ] **Step 1: Create the component**

Create `components/StatsModal.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getGameData } from '@/lib/storage';
import { computeStats, type StatsSummary } from '@/lib/stats';

interface StatsModalProps {
  onClose: () => void;
}

export default function StatsModal({ onClose }: StatsModalProps) {
  const [stats, setStats] = useState<StatsSummary | null>(null);

  useEffect(() => {
    setStats(computeStats(getGameData()));
  }, []);

  if (!stats) return null;

  const maxBucket = Math.max(1, ...stats.distribution.map((b) => b.count));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Stats</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          {[
            ['Played', stats.gamesPlayed],
            ['Streak', stats.currentStreak],
            ['Max', stats.maxStreak],
            ['Best', stats.bestScore],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-gray-600 mb-2">Score Distribution</h3>
        <div className="space-y-1 mb-6">
          {stats.distribution.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-500">{b.label}</span>
              <div
                className="bg-primary text-white text-xs text-right px-2 rounded"
                style={{ width: `${(b.count / maxBucket) * 100}%`, minWidth: '1.5rem' }}
              >
                {b.count}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-gray-600 mb-2">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1">
          {stats.last30.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.played ? ` · ${d.score}` : ''}`}
              className={`aspect-square rounded ${d.played ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build to confirm it type-checks**

Run: `npm run build`
Expected: build succeeds (component not yet rendered anywhere — verified visually in Task 10).

- [ ] **Step 3: Commit**

```bash
git add components/StatsModal.tsx
git commit -m "feat: add stats modal with distribution and calendar heatmap"
```

---

### Task 10: Wire stats entry points

**Files:**
- Modify: `components/Results.tsx` (add "View Stats" button + modal state)
- Modify: `components/WordChainGame.tsx` (add 📊 button on pre-game screen + modal state)

UI task; verify manually.

- [ ] **Step 1: Add a "View Stats" button to Results**

In `components/Results.tsx`, add at the top of the component body (after the existing imports add the stats import):

```tsx
import { useState } from 'react';
import StatsModal from './StatsModal';
```

Inside the component, add state:

```tsx
  const [showStats, setShowStats] = useState(false);
```

In the actions block, add a button after "Play Again":

```tsx
        <button
          onClick={() => setShowStats(true)}
          className="w-full text-primary font-semibold py-2"
        >
          📊 View Stats
        </button>
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
```

- [ ] **Step 2: Add a 📊 button to the pre-game screen**

In `components/WordChainGame.tsx`, add the import:

```tsx
import StatsModal from './StatsModal';
```

Add state near the other `useState` calls:

```tsx
  const [showStats, setShowStats] = useState(false);
```

In the `pre-game` block, add below the "Start Game" button (inside the `text-center space-y-6` div):

```tsx
            <button
              onClick={() => setShowStats(true)}
              className="text-primary font-semibold"
            >
              📊 View Stats
            </button>
```

And add the modal once, right before the final closing `</div>` of the outer card (after the game-state blocks):

```tsx
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build && npm run dev`
Manual: on the pre-game screen, click "📊 View Stats" → modal opens with stats, distribution bars, and a 30-day grid. Close it. Finish a game → "View Stats" on Results also works.

- [ ] **Step 4: Commit**

```bash
git add components/Results.tsx components/WordChainGame.tsx
git commit -m "feat: add stats modal entry points"
```

---

## Phase D — Friend Challenge (Spec Section 3)

### Task 11: Forced-puzzle mode in the game

**Files:**
- Modify: `components/WordChainGame.tsx` (accept optional `challenge` prop, compare on finish)

UI task; verify manually.

- [ ] **Step 1: Add the prop and use it for the start word**

In `components/WordChainGame.tsx`, import the helpers and challenge type at the top:

```tsx
import { getTodayWord, getWordByPuzzleNumber } from '@/lib/words';
import type { Challenge } from '@/lib/share';
```

(The existing `import { getTodayWord } from '@/lib/words';` line is replaced by the line above.)

Change the component signature:

```tsx
export default function WordChainGame({ challenge }: { challenge?: Challenge }) {
```

Replace the init `useEffect` (lines ~27-31) so a challenge forces its puzzle:

```tsx
  useEffect(() => {
    setStartWord(
      challenge ? getWordByPuzzleNumber(challenge.p) : getTodayWord()
    );
    const data = getGameData();
    setStreak(data.streak);
  }, [challenge]);
```

- [ ] **Step 2: Pass the comparison to Results**

In `finishGame`, after computing `finalScore`, the existing code stays; just pass challenge info to `Results`. Update the `finished` block render:

```tsx
        {gameState === 'finished' && (
          <Results
            words={wordChain}
            startWord={startWord}
            score={score}
            streak={streak}
            isNewBest={isNewBest}
            onPlayAgain={resetGame}
            challenge={challenge}
          />
        )}
```

- [ ] **Step 3: Build to confirm type-checks (Results prop added next task)**

Run: `npm run build`
Expected: a type error on the new `challenge` prop on `Results` — this is fixed in Task 12. (If executing strictly task-by-task, do Task 12 before building. Otherwise proceed.)

- [ ] **Step 4: Commit**

```bash
git add components/WordChainGame.tsx
git commit -m "feat: support forced-puzzle (challenge) mode in game"
```

---

### Task 12: Challenge comparison + landing wiring

**Files:**
- Modify: `components/Results.tsx` (accept `challenge`, show beat/lost banner + "Challenge back")
- Modify: `app/c/[code]/page.tsx` (render the game in challenge mode)

UI task; verify manually.

- [ ] **Step 1: Add challenge comparison to Results**

In `components/Results.tsx`, extend the props interface:

```tsx
import type { Challenge } from '@/lib/share';

interface ResultsProps {
  words: string[];
  startWord: string;
  score: number;
  streak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  challenge?: Challenge;
}
```

Add `challenge` to the destructured params. Then add a comparison banner just below the "Game Over!" header block:

```tsx
      {challenge && (
        <div
          className={`rounded-lg p-4 text-center font-semibold ${
            score >= challenge.s
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          {score >= challenge.s
            ? `🎉 You beat ${challenge.n ?? 'them'} by ${score - challenge.s}!`
            : `Lost to ${challenge.n ?? 'them'} by ${challenge.s - score}. Try again!`}
        </div>
      )}
```

The existing `<ShareButton .../>` already generates a fresh challenge link from the player's own score, which serves as "Challenge back" — no extra button needed. Update the share button label is optional; leave as "Share Results".

- [ ] **Step 2: Render the game in challenge mode on the landing page**

Replace the `<a href="/">Play</a>` section of `app/c/[code]/page.tsx` with a client component that mounts the game. First make the page pass the decoded challenge to the game. Since `WordChainGame` is a client component, render it directly:

Replace the body of `ChallengePage` (keep `generateMetadata` as is):

```tsx
import WordChainGame from '@/components/WordChainGame';

export default function ChallengePage({ params }: { params: { code: string } }) {
  const c = decodeChallenge(params.code);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-gray-50">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Word Chain</h1>
        {c && (
          <p className="text-gray-600 mt-1">
            {(c.n ?? 'A friend')} scored {c.s} on #{c.p}. Beat it!
          </p>
        )}
      </header>
      <WordChainGame challenge={c ?? undefined} />
    </main>
  );
}
```

(If `c` is null — malformed code — the game falls back to today's puzzle, satisfying the spec's error-handling requirement.)

- [ ] **Step 3: Build and manually verify the full flow**

Run: `npm run build && npm run dev`
Manual:
1. Play today's game on `/`, tap Share, copy the `/c/<code>` link.
2. Open that link → header shows the challenger score; the game loads the SAME puzzle word.
3. Finish the game → Results shows "You beat … / Lost to …" banner.
4. Tap Share again → a new challenge link is generated with your score (challenge-back).

- [ ] **Step 4: Commit**

```bash
git add components/Results.tsx app/c/[code]/page.tsx
git commit -m "feat: friend-challenge comparison and challenge-back flow"
```

---

### Task 13: Optional nickname capture

**Files:**
- Modify: `components/Results.tsx` (nickname input feeding ShareButton)

UI task; verify manually.

- [ ] **Step 1: Add a nickname input wired to ShareButton**

In `components/Results.tsx`, add state (reuse the `useState` import from Task 10):

```tsx
  const [nickname, setNickname] = useState('');
```

Add an input just above the `<ShareButton ... />`:

```tsx
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 16))}
          placeholder="Your name (optional)"
          maxLength={16}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center"
        />
```

Pass it to ShareButton:

```tsx
        <ShareButton
          words={words}
          startWord={startWord}
          score={score}
          streak={streak}
          nickname={nickname || undefined}
        />
```

- [ ] **Step 2: Build and manually verify**

Run: `npm run build && npm run dev`
Manual: finish a game, type a name, Share → open the resulting `/c/<code>` link and confirm the name appears in the header and OG card (`/c/<code>/opengraph-image`).

- [ ] **Step 3: Commit**

```bash
git add components/Results.tsx
git commit -m "feat: optional nickname on shared challenges"
```

---

## Final Verification

- [ ] Run the full test suite: `npm test` — all unit tests pass.
- [ ] Run `npm run build` — no type errors, build succeeds.
- [ ] Manually walk the loop end-to-end: play → share (emoji + link) → open link in another browser/profile → rich OG card unfurls (test with a link debugger) → play same puzzle → beat/lost banner → stats modal shows updated history.
- [ ] Update [TESTING.md](../../../TESTING.md) with manual checks for: emoji share format, stats modal, calendar heatmap, challenge link flow, OG card.

## Notes on `NEXT_PUBLIC_SITE_URL`

`ShareButton` reads `NEXT_PUBLIC_SITE_URL` and falls back to `https://dailywordchain.com`. Add it to `.env.example` and Vercel env vars so share links use the correct deployed origin.
```
NEXT_PUBLIC_SITE_URL=https://dailywordchain.com
```
