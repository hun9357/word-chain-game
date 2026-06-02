# Word Definitions + Play Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tap-to-see word definitions and selectable play modes (time 30/60/120s × difficulty min-letters 2/3/4), with mode-aware sharing/challenges, on the existing serverless word game.

**Architecture:** New pure-logic modules (`getDefinition` cache in `lib/dictionary.ts`, `lib/modes.ts`, mode fields in `lib/share.ts`/`lib/storage.ts`) are unit-tested with TDD. A reusable `DefinitionPopover` component is wired into the chain tiles (play) and results list. `WordChainGame` gains mode state, segmented controls, min-length validation, and passes the played mode through to results/sharing. Default mode is Easy/60s, which is also how legacy (no-mode) challenge links decode — preserving today's behavior.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind (editorial tokens `paper`/`ink`/`ink-muted`/`ink-faint`/`hairline`, `font-serif`), Vitest, dictionaryapi.dev.

**Spec:** [docs/superpowers/specs/2026-06-02-definitions-and-modes-design.md](../specs/2026-06-02-definitions-and-modes-design.md)

---

## Shared Types (defined in Task 2, used everywhere after)

```ts
// lib/modes.ts
export interface Mode { time: number; minLen: number; }
export const DEFAULT_MODE: Mode = { time: 60, minLen: 2 };
```
`modeLabel(mode)` → `"60s · 2+"`. Challenge gains optional `t?` (time) and `m?` (minLen); absent ⇒ default 60/2.

---

## File Structure

| File | Change | Task |
|---|---|---|
| `lib/dictionary.ts` | + `getDefinition` with cache | 1 |
| `lib/modes.ts` | new: `Mode`, `DEFAULT_MODE`, options, `modeLabel`, `isDefaultMode` | 2 |
| `lib/share.ts` | `Challenge` + `t?`/`m?`; encode/decode; `buildShareText` mode label | 3 |
| `lib/storage.ts` | `HistoryEntry` + `time?`/`minLen?`; `updateGameStats` optional mode | 4 |
| `components/DefinitionPopover.tsx` | new: tap-to-define popover | 5 |
| `components/WordChain.tsx` | tappable tiles → popover | 6 |
| `components/WordChainGame.tsx` | mode state, controls, validation, timer, pass-through | 7 |
| `components/Results.tsx` | tappable words, mode-aware banner, pass mode to share | 8 |
| `components/ShareButton.tsx` | accept `mode`, encode `t`/`m`, label in share text | 9 |
| (verify + TESTING.md) | build, test, manual checklist | 10 |

---

## Task 1: `getDefinition` with cache

**Files:**
- Modify: `lib/dictionary.ts`
- Test: `lib/dictionary.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/dictionary.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDefinition } from './dictionary';

beforeEach(() => {
  vi.restoreAllMocks();
});

const oceanResponse = [
  {
    word: 'ocean',
    meanings: [
      { partOfSpeech: 'noun', definitions: [{ definition: 'a large body of salt water' }] },
    ],
  },
];

describe('getDefinition', () => {
  it('formats partOfSpeech and first definition', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => oceanResponse })));
    expect(await getDefinition('ocean')).toBe('noun — a large body of salt water');
  });

  it('returns null on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await getDefinition('zzqqx')).toBeNull();
  });

  it('caches results (second call does not refetch)', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => oceanResponse }));
    vi.stubGlobal('fetch', fetchMock);
    await getDefinition('cachetest');
    await getDefinition('cachetest');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/dictionary.test.ts`
Expected: FAIL — `getDefinition` is not exported.

- [ ] **Step 3: Implement**

Append to `lib/dictionary.ts`:

```ts
/**
 * Fetch a human-readable definition for a word, cached in-memory.
 * Returns "{partOfSpeech} — {definition}" or null when unavailable.
 */
const definitionCache = new Map<string, string | null>();

export async function getDefinition(word: string): Promise<string | null> {
  const key = word.toLowerCase();
  if (definitionCache.has(key)) return definitionCache.get(key) ?? null;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${key}`,
      { cache: 'force-cache' }
    );
    if (!response.ok) {
      definitionCache.set(key, null);
      return null;
    }
    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const meaning = entry?.meanings?.[0];
    const definition = meaning?.definitions?.[0]?.definition;
    if (!definition) {
      definitionCache.set(key, null);
      return null;
    }
    const result = meaning?.partOfSpeech
      ? `${meaning.partOfSpeech} — ${definition}`
      : definition;
    definitionCache.set(key, result);
    return result;
  } catch (error) {
    console.error('Definition fetch error:', error);
    definitionCache.set(key, null);
    return null;
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/dictionary.test.ts`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/dictionary.ts lib/dictionary.test.ts
git commit -m "feat: add cached getDefinition lookup"
```

---

## Task 2: `lib/modes.ts`

**Files:**
- Create: `lib/modes.ts`
- Test: `lib/modes.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/modes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_MODE, modeLabel, isDefaultMode, TIME_OPTIONS, DIFFICULTY_OPTIONS } from './modes';

describe('modes', () => {
  it('default mode is 60s / 2+', () => {
    expect(DEFAULT_MODE).toEqual({ time: 60, minLen: 2 });
  });

  it('modeLabel formats time and min length', () => {
    expect(modeLabel({ time: 30, minLen: 4 })).toBe('30s · 4+');
  });

  it('isDefaultMode true only for the default', () => {
    expect(isDefaultMode({ time: 60, minLen: 2 })).toBe(true);
    expect(isDefaultMode({ time: 30, minLen: 2 })).toBe(false);
  });

  it('exposes selectable options', () => {
    expect(TIME_OPTIONS).toEqual([30, 60, 120]);
    expect(DIFFICULTY_OPTIONS.map((d) => d.minLen)).toEqual([2, 3, 4]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/modes.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `lib/modes.ts`:

```ts
export interface Mode {
  time: number; // seconds
  minLen: number; // minimum allowed word length
}

export const DEFAULT_MODE: Mode = { time: 60, minLen: 2 };

export const TIME_OPTIONS: number[] = [30, 60, 120];

export const DIFFICULTY_OPTIONS: { label: string; minLen: number }[] = [
  { label: 'Easy', minLen: 2 },
  { label: 'Normal', minLen: 3 },
  { label: 'Hard', minLen: 4 },
];

export function modeLabel(mode: Mode): string {
  return `${mode.time}s · ${mode.minLen}+`;
}

export function isDefaultMode(mode: Mode): boolean {
  return mode.time === DEFAULT_MODE.time && mode.minLen === DEFAULT_MODE.minLen;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/modes.test.ts`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/modes.ts lib/modes.test.ts
git commit -m "feat: add play-mode types and helpers"
```

---

## Task 3: Mode-aware challenge encoding + share text

**Files:**
- Modify: `lib/share.ts`
- Modify: `lib/share.test.ts` (append)

- [ ] **Step 1: Append failing tests** to `lib/share.test.ts`

```ts
describe('challenge mode encoding', () => {
  it('round-trips a non-default mode', () => {
    const code = encodeChallenge({ p: 5, s: 80, t: 30, m: 4 });
    expect(decodeChallenge(code)).toEqual({ p: 5, s: 80, t: 30, m: 4 });
  });

  it('omits default mode fields from the payload', () => {
    const code = encodeChallenge({ p: 5, s: 80, t: 60, m: 2 });
    expect(decodeChallenge(code)).toEqual({ p: 5, s: 80 });
  });

  it('legacy code without mode decodes without t/m', () => {
    const code = encodeChallenge({ p: 9, s: 10 });
    const decoded = decodeChallenge(code);
    expect(decoded).toEqual({ p: 9, s: 10 });
    expect(decoded?.t).toBeUndefined();
  });
});

describe('buildShareText mode label', () => {
  it('appends the mode label to the header when a mode is given', () => {
    const text = buildShareText({
      puzzleNo: 12, words: ['CAT'], score: 20, streak: 1,
      url: 'https://x/c/abc', mode: { time: 30, minLen: 3 },
    });
    expect(text).toContain('Word Chain #12 · 30s · 3+');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/share.test.ts`
Expected: FAIL — `t`/`m` not preserved; `mode` not in `buildShareText`.

- [ ] **Step 3: Update `lib/share.ts`**

Replace the `Challenge` interface:

```ts
export interface Challenge {
  p: number; // puzzle number
  s: number; // challenger score
  n?: string; // challenger nickname (optional, max 16 chars)
  t?: number; // mode time in seconds (omitted when default 60)
  m?: number; // mode min word length (omitted when default 2)
}
```

Replace `encodeChallenge`:

```ts
export function encodeChallenge(c: Challenge): string {
  const clean: Challenge = { p: c.p, s: c.s };
  if (c.n) clean.n = c.n.slice(0, 16);
  if (typeof c.t === 'number' && c.t !== 60) clean.t = c.t;
  if (typeof c.m === 'number' && c.m !== 2) clean.m = c.m;
  return b64urlEncode(JSON.stringify(clean));
}
```

Replace `decodeChallenge`:

```ts
export function decodeChallenge(code: string): Challenge | null {
  if (!code) return null;
  try {
    const obj = JSON.parse(b64urlDecode(code));
    if (typeof obj?.p !== 'number' || typeof obj?.s !== 'number') return null;
    const result: Challenge = { p: obj.p, s: obj.s };
    if (typeof obj.n === 'string') result.n = obj.n.slice(0, 16);
    if (typeof obj.t === 'number') result.t = obj.t;
    if (typeof obj.m === 'number') result.m = obj.m;
    return result;
  } catch {
    return null;
  }
}
```

Add the import at the top of `lib/share.ts`:

```ts
import { modeLabel, type Mode } from './modes';
```

Replace `buildShareText` (add optional `mode` and append its label):

```ts
export function buildShareText(opts: {
  puzzleNo: number;
  words: string[];
  score: number;
  streak: number;
  url: string;
  mode?: Mode;
}): string {
  const { puzzleNo, words, score, streak, url, mode } = opts;
  const streakLine = streak > 1 ? ` · 🔥 ${streak}` : '';
  const modeText = mode ? ` · ${modeLabel(mode)}` : '';
  return `Word Chain #${puzzleNo}${modeText}
🔗 ${words.length} words · ${score} pts${streakLine}

${chainToEmoji(words)}

play → ${url}

#DailyWordChain`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/share.test.ts`
Expected: PASS — all share tests pass (existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add lib/share.ts lib/share.test.ts
git commit -m "feat: mode-aware challenge encoding and share text"
```

---

## Task 4: Store mode in history

**Files:**
- Modify: `lib/storage.ts`
- Modify: `lib/storage.test.ts` (append)

- [ ] **Step 1: Append failing tests** to `lib/storage.test.ts`

```ts
describe('updateGameStats mode', () => {
  it('stores time/minLen when a mode is provided', () => {
    updateGameStats(40, 3, 1, { time: 30, minLen: 4 });
    const h = getGameData().history[0];
    expect(h.time).toBe(30);
    expect(h.minLen).toBe(4);
  });

  it('omits mode fields when no mode is provided', () => {
    updateGameStats(40, 3, 1);
    const h = getGameData().history[0];
    expect(h.time).toBeUndefined();
    expect(h.minLen).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/storage.test.ts`
Expected: FAIL — `updateGameStats` takes no mode; `time`/`minLen` undefined on the type.

- [ ] **Step 3: Update `lib/storage.ts`**

Extend `HistoryEntry`:

```ts
export interface HistoryEntry {
  date: string;
  puzzleNo: number;
  score: number;
  wordCount: number;
  time?: number;
  minLen?: number;
}
```

Add the import at the top:

```ts
import type { Mode } from './modes';
```

Replace `updateGameStats`'s signature and the history-push so it records mode when given:

```ts
export function updateGameStats(
  score: number,
  wordCount: number,
  puzzleNo: number = getPuzzleNumber(),
  mode?: Mode
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

  const entry: HistoryEntry = { date: today, puzzleNo, score, wordCount };
  if (mode) {
    entry.time = mode.time;
    entry.minLen = mode.minLen;
  }

  saveGameData({
    lastPlayedDate: today,
    streak: newStreak,
    bestScore: isNewBest ? score : data.bestScore,
    gamesPlayed: data.gamesPlayed + 1,
    maxStreak: Math.max(data.maxStreak, newStreak),
    history: [...data.history, entry],
  });

  return { streak: newStreak, isNewBest };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/storage.test.ts`
Expected: PASS — existing + 2 new pass.

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts lib/storage.test.ts
git commit -m "feat: record play mode in game history"
```

---

## Task 5: DefinitionPopover component

**Files:**
- Create: `components/DefinitionPopover.tsx`

UI task; verify via build.

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getDefinition } from '@/lib/dictionary';

interface DefinitionPopoverProps {
  word: string;
  onClose: () => void;
}

export default function DefinitionPopover({ word, onClose }: DefinitionPopoverProps) {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDefinition(word).then((d) => {
      if (active) {
        setText(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [word]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-hairline rounded-lg shadow-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-semibold text-ink">{word}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint text-2xl leading-none hover:text-ink"
          >
            ×
          </button>
        </div>
        <p className="text-ink-muted leading-relaxed">
          {loading ? '…' : text ?? 'No definition found.'}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build` (expect success) and `npm test` (expect all pass).

- [ ] **Step 3: Commit**

```bash
git add components/DefinitionPopover.tsx
git commit -m "feat: add tap-to-define popover"
```

---

## Task 6: Tappable chain tiles (in-play definitions)

**Files:**
- Modify: `components/WordChain.tsx`

UI task; verify via build.

- [ ] **Step 1: Replace the entire contents of `components/WordChain.tsx`**

```tsx
'use client';

import { useState } from 'react';
import DefinitionPopover from './DefinitionPopover';

interface WordChainProps {
  words: string[];
  startWord: string;
}

export default function WordChain({ words, startWord }: WordChainProps) {
  const allWords = [startWord, ...words];
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full">
      <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Word Chain</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {allWords.map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(word)}
                className={`px-4 py-2 rounded-md font-semibold text-lg border ${
                  index === 0
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink border-hairline'
                }`}
              >
                {word}
              </button>
              {index < allWords.length - 1 && (
                <svg
                  className="w-5 h-5 text-ink-faint flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
      {selected && <DefinitionPopover word={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build` (expect success) and `npm test` (expect all pass).

- [ ] **Step 3: Commit**

```bash
git add components/WordChain.tsx
git commit -m "feat: tap chain tiles to see definitions"
```

---

## Task 7: Modes in WordChainGame (controls, validation, timer, pass-through)

**Files:**
- Modify: `components/WordChainGame.tsx`

UI task; verify via build.

- [ ] **Step 1: Add imports**

After the existing imports, add:

```tsx
import { DEFAULT_MODE, TIME_OPTIONS, DIFFICULTY_OPTIONS, type Mode } from '@/lib/modes';
```

- [ ] **Step 2: Add mode state and derive the active mode**

Inside the component, after the `const [showStats, setShowStats] = useState(false);` line, add:

```tsx
  const [selTime, setSelTime] = useState(DEFAULT_MODE.time);
  const [selMinLen, setSelMinLen] = useState(DEFAULT_MODE.minLen);

  // A challenge locks the mode to the challenger's; otherwise use the selection.
  const mode: Mode = challenge
    ? { time: challenge.t ?? DEFAULT_MODE.time, minLen: challenge.m ?? DEFAULT_MODE.minLen }
    : { time: selTime, minLen: selMinLen };
```

- [ ] **Step 3: Enforce min length in `handleSubmit`**

In `handleSubmit`, immediately after the "Word already used!" check block (before `// Validate word with dictionary`), insert:

```tsx
    // Enforce difficulty (minimum word length)
    if (word.length < mode.minLen) {
      setError(`Use ${mode.minLen}+ letter words`);
      setIsValidating(false);
      return;
    }
```

- [ ] **Step 4: Pass the mode to stats in `finishGame`**

Replace the `updateGameStats(...)` call:

```tsx
    const stats = updateGameStats(
      finalScore,
      wordChain.length,
      challenge ? challenge.p : getPuzzleNumber()
    );
```
with:
```tsx
    const stats = updateGameStats(
      finalScore,
      wordChain.length,
      challenge ? challenge.p : getPuzzleNumber(),
      mode
    );
```

- [ ] **Step 5: Pass the selected duration to the Timer**

In the `playing` block, replace:
```tsx
            <Timer isActive={true} onTimeUp={handleTimeUp} />
```
with:
```tsx
            <Timer isActive={true} onTimeUp={handleTimeUp} duration={mode.time} />
```

- [ ] **Step 6: Add the mode selectors to the pre-game screen**

In the `pre-game` block, insert the following BETWEEN the "How to play" `<div>` and the "Play" `<button>` (render only when not a locked challenge):

```tsx
            {!challenge && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Time</p>
                  <div className="flex gap-2">
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelTime(t)}
                        className={`flex-1 py-2 rounded-md border font-semibold ${
                          selTime === t ? 'bg-ink text-paper border-ink' : 'border-hairline text-ink'
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Difficulty</p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setSelMinLen(d.minLen)}
                        className={`flex-1 py-2 rounded-md border font-semibold ${
                          selMinLen === d.minLen ? 'bg-ink text-paper border-ink' : 'border-hairline text-ink'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
```

- [ ] **Step 7: Pass the mode to Results**

In the `finished` block, add the `mode` prop:

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
            mode={mode}
          />
        )}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: a type error on the `mode` prop of `Results` (added in Task 8). If executing strictly task-by-task, do Task 8 next, then build. Otherwise proceed.
Run: `npm test` (expect all pass).

- [ ] **Step 9: Commit**

```bash
git add components/WordChainGame.tsx
git commit -m "feat: play-mode selection, min-length rule, timed modes"
```

---

## Task 8: Results — tappable words + mode-aware comparison

**Files:**
- Modify: `components/Results.tsx`

UI task; verify via build.

- [ ] **Step 1: Add imports**

At the top, add:

```tsx
import DefinitionPopover from './DefinitionPopover';
import { modeLabel, type Mode } from '@/lib/modes';
```

- [ ] **Step 2: Extend props and add state**

Replace the `ResultsProps` interface to add `mode`:

```tsx
interface ResultsProps {
  words: string[];
  startWord: string;
  score: number;
  streak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  challenge?: Challenge;
  mode: Mode;
}
```
Add `mode` to the destructured params, and add definition state next to the existing `useState` calls:

```tsx
  const [defWord, setDefWord] = useState<string | null>(null);
```
Also compute the comparison flags (place just before the `return`):

```tsx
  const challengeMode = challenge
    ? { time: challenge.t ?? 60, minLen: challenge.m ?? 2 }
    : null;
  const sameMode =
    !!challengeMode && mode.time === challengeMode.time && mode.minLen === challengeMode.minLen;
```

- [ ] **Step 3: Replace the challenge banner block** to branch on `sameMode`

Replace the whole `{challenge && ( ... )}` banner block with:

```tsx
      {challenge &&
        (sameMode ? (
          <div
            className={`rounded-lg p-4 text-center font-semibold ${
              score > challenge.s
                ? 'bg-green-50 border border-green-200 text-green-800'
                : score === challenge.s
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}
          >
            {score > challenge.s
              ? `🎉 You beat ${challenge.n ?? 'them'} by ${score - challenge.s}!`
              : score === challenge.s
              ? `🤝 Tied with ${challenge.n ?? 'them'} at ${score}!`
              : `Lost to ${challenge.n ?? 'them'} by ${challenge.s - score}. Try again!`}
          </div>
        ) : (
          <div className="rounded-lg p-4 text-center font-semibold bg-ink/5 border border-hairline text-ink-muted">
            Played a different mode ({modeLabel(challengeMode!)}) — scores aren&apos;t directly comparable.
          </div>
        ))}
```

- [ ] **Step 4: Make the "Your Chain" words tappable**

Replace the chain paragraph:

```tsx
          <p className="text-ink leading-relaxed">
            <span className="font-bold">{startWord}</span>
            {words.map((word, idx) => (
              <span key={idx}>
                {' → '}
                <span className="font-semibold">{word}</span>
              </span>
            ))}
          </p>
```
with:

```tsx
          <p className="text-ink leading-relaxed">
            <button type="button" onClick={() => setDefWord(startWord)} className="font-bold underline-offset-2 hover:underline">
              {startWord}
            </button>
            {words.map((word, idx) => (
              <span key={idx}>
                {' → '}
                <button type="button" onClick={() => setDefWord(word)} className="font-semibold underline-offset-2 hover:underline">
                  {word}
                </button>
              </span>
            ))}
          </p>
```

- [ ] **Step 5: Pass `mode` to ShareButton and render the popover**

Replace the `<ShareButton .../>` usage:

```tsx
        <ShareButton
          words={words}
          startWord={startWord}
          score={score}
          streak={streak}
          nickname={nickname || undefined}
          challenge={challenge}
        />
```
with:
```tsx
        <ShareButton
          words={words}
          startWord={startWord}
          score={score}
          streak={streak}
          nickname={nickname || undefined}
          challenge={challenge}
          mode={mode}
        />
```
Then, just before the final closing `</div>` of the component, add:

```tsx
      {defWord && <DefinitionPopover word={defWord} onClose={() => setDefWord(null)} />}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: type error on `ShareButton`'s `mode` prop (added in Task 9). Proceed to Task 9, then build clean.
Run: `npm test` (expect all pass).

- [ ] **Step 7: Commit**

```bash
git add components/Results.tsx
git commit -m "feat: tappable result words and mode-aware comparison"
```

---

## Task 9: ShareButton — mode in link + share text

**Files:**
- Modify: `components/ShareButton.tsx`

UI task; verify via build.

- [ ] **Step 1: Add the import and `mode` prop**

Add to the imports:

```tsx
import type { Mode } from '@/lib/modes';
```
Extend `ShareButtonProps`:

```tsx
interface ShareButtonProps {
  words: string[];
  startWord: string;
  score: number;
  streak: number;
  nickname?: string;
  challenge?: Challenge;
  mode: Mode;
}
```
Add `mode` to the destructured params.

- [ ] **Step 2: Encode the mode and include it in the share text**

Replace the body of `handleShare` up to the `text` assignment:

```tsx
  const handleShare = async () => {
    const puzzleNo = challenge ? challenge.p : getPuzzleNumber();
    const code = encodeChallenge({
      p: puzzleNo,
      s: score,
      n: nickname,
      t: mode.time,
      m: mode.minLen,
    });
    const url = `${SITE_URL}/c/${code}`;

    const text = buildShareText({
      puzzleNo,
      words: [startWord, ...words],
      score,
      streak,
      url,
      mode,
    });
```

(The rest of `handleShare` — the `navigator.share`/clipboard branch — stays unchanged.)

- [ ] **Step 3: Verify build + tests**

Run: `npm run build` (expect success now — Tasks 7/8/9 resolve each other's prop types) and `npm test` (expect all pass).

- [ ] **Step 4: Commit**

```bash
git add components/ShareButton.tsx
git commit -m "feat: encode mode in challenge link and share text"
```

---

## Task 10: Verification + docs

**Files:**
- Modify: `TESTING.md`

- [ ] **Step 1: Full build + test**

Run: `npm run build` (expect success, no type errors) and `npm test` (expect all pass — existing 22 + new dictionary/modes/share/storage tests).

- [ ] **Step 2: Manual check (record results)**

Run `npm run dev` and verify:
- Tap a tile during play → popover shows loading then a definition (try a real word) and "No definition found." for an obscure one.
- Tap a word on the Results "Your Chain" → same popover.
- Pre-game shows Time (30/60/120) and Difficulty (Easy/Normal/Hard) selectors; selection highlights in ink.
- Choose Hard, start, submit a 3-letter word → rejected with "Use 4+ letter words"; a 4+ word is accepted.
- Choose 30s → timer starts at 30 and ends the game at 0.
- Finish a game, Share → copied text header reads `Word Chain #N · {t}s · {m}+`; link is `/c/<code>`.
- Open a shared `/c/<code>` from a non-default mode → game is locked to that mode (no selectors), and after finishing the banner compares; play the daily in a different mode and confirm the "different mode … not directly comparable" banner appears when the challenge mode differs.

- [ ] **Step 3: Update `TESTING.md`**

Append a section:

```markdown
## Definitions & Modes
- [ ] Tapping a chain tile (in play) opens a definition popover (loading → text / "No definition found.")
- [ ] Tapping a word on the Results screen opens the same popover
- [ ] Pre-game Time (30/60/120) and Difficulty (Easy/Normal/Hard) selectors work and highlight selection
- [ ] Min-length rule rejects too-short words with "Use N+ letter words"
- [ ] Timer uses the selected duration
- [ ] Share text header shows the mode (e.g. `Word Chain #N · 30s · 3+`)
- [ ] Challenge link locks the mode (no selectors on /c/<code>)
- [ ] Same-mode challenge shows beat/tie/loss; different mode shows the "not comparable" note
```

- [ ] **Step 4: Commit**

```bash
git add TESTING.md
git commit -m "docs: add definitions and modes manual checklist"
```

---

## Self-Review Notes

- **Spec coverage:** getDefinition+cache (T1), popover & wiring (T5/T6/T8), modes type (T2), pre-game selectors + min-length + timed (T7), default Easy/60 = DEFAULT_MODE (T2/T7), mode in challenge encode/decode + legacy default (T3), share text label (T3/T9), mode-locked challenge (T7), mode-aware comparison (T8), streak unchanged + history mode fields (T4). All covered.
- **Type consistency:** `Mode {time,minLen}` and `DEFAULT_MODE` from `lib/modes.ts` used by share, storage, ShareButton, Results, WordChainGame; `Challenge` gains `t?`/`m?`; `updateGameStats(score, wordCount, puzzleNo?, mode?)`; `buildShareText({..., mode?})`; `Results` and `ShareButton` both gain required `mode` prop, supplied by `WordChainGame`.
- **Cross-task build dependency:** Tasks 7→8→9 add matching props; the suite builds clean after Task 9 (noted inline).
- Status colors (green/blue/amber/red) preserved; new "not comparable" note uses neutral ink tokens.
