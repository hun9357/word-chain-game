# UI Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic indigo-SaaS look with a monochrome-on-cream **editorial** visual language (Fraunces serif + Inter), without touching gameplay, data, or routing.

**Architecture:** Centralize design tokens in `tailwind.config.ts` + `next/font` in `app/layout.tsx`, then sweep each component to the new tokens. Pure restyle: every existing unit test must stay green and `npm run build` must pass at each step. Verification is build + regression tests + visual check against the approved mockups (cream `#faf7ef`, ink `#141414`, Fraunces headings, hairline borders).

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `next/font/google` (Fraunces, Inter).

**Spec:** [docs/superpowers/specs/2026-06-02-ui-editorial-redesign-design.md](../specs/2026-06-02-ui-editorial-redesign-design.md)

---

## Design Token Reference (use these exact classes everywhere)

| Purpose | Class | Value |
|---|---|---|
| Page/card background | `bg-paper` | `#faf7ef` |
| Primary text / buttons / rules | `text-ink` / `bg-ink` | `#141414` |
| Secondary text | `text-ink-muted` | `#5c5c5c` |
| Small labels / kicker / dates | `text-ink-faint` | `#8a8478` |
| Borders / dividers / ghost buttons | `border-hairline` | `#d8d2c4` |
| Display headings | `font-serif` | Fraunces |
| Body / UI / tiles | `font-sans` (default) | Inter |

**Reusable button recipes** (copy verbatim):
- Primary: `w-full bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:opacity-90 transition-opacity`
- Ghost: `w-full border border-hairline text-ink font-semibold py-3 px-6 rounded-md hover:bg-ink/5 transition-colors`

**Functional status colors** (keep, do not replace): error `text-red-700`/`bg-red-50`/`border-red-200`; win `green`; tie `blue`; loss `amber`; streak `orange`.

---

## File Structure

| File | Change | Task |
|---|---|---|
| `tailwind.config.ts` | Add color tokens + fontFamily | 1 |
| `app/layout.tsx` | Load Fraunces + Inter via next/font; body bg/text | 1 |
| `app/globals.css` | Base paper bg, antialiasing (drop old font stack) | 1 |
| `app/page.tsx` | Masthead, How-it-works cards, footer, page bg | 2 |
| `components/WordChainGame.tsx` | Outer card, pre-game, playing blocks | 3 |
| `components/Timer.tsx` | Ink/hairline restyle; low-time red | 4 |
| `components/WordChain.tsx` | Editorial chain tiles | 5 |
| `components/Results.tsx` | Game-over, score panel, chain, actions | 6 |
| `components/ShareButton.tsx` | Ink primary button | 7 |
| `components/StatsModal.tsx` | Paper modal, ink bars/heatmap | 7 |
| `app/c/[code]/opengraph-image.tsx` | Repaint to cream/ink | 8 |
| (sweep + verify) | grep + build + test + visual | 9 |

---

## Task 1: Design tokens + fonts (foundation)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#faf7ef",
        ink: {
          DEFAULT: "#141414",
          muted: "#5c5c5c",
          faint: "#8a8478",
        },
        hairline: "#d8d2c4",
        // Legacy alias: any missed `primary` reference renders ink, not indigo.
        primary: "#141414",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Replace `app/layout.tsx`** (keep all metadata/viewport exactly; only add fonts + body classes)

```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Word Chain - Free Online Word Puzzle Game with Timer",
  description: "Play Daily Word Chain, a free 60-second word association puzzle game. Chain words together, beat the timer, and share your score. New challenge every day!",
  keywords: ["word game", "word puzzle", "word chain", "daily puzzle", "word association", "brain game", "vocabulary game"],
  verification: {
    google: "KLUWmaJTvSkVldncIo2cPl6KQtr610FUWuZhywdYN5Y",
  },
  openGraph: {
    title: "Daily Word Chain - Free Online Word Puzzle Game",
    description: "Chain words together in 60 seconds. New challenge every day!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Word Chain - Free Online Word Puzzle Game",
    description: "Chain words together in 60 seconds. New challenge every day!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <body className="bg-paper text-ink font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: #faf7ef;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 4: Verify build and tests**

Run: `npm run build`
Expected: success; Next reports fonts. No type errors.
Run: `npm test`
Expected: 22 passed (logic untouched).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/layout.tsx app/globals.css
git commit -m "style: add editorial design tokens and fonts (Fraunces + Inter)"
```

---

## Task 2: Homepage masthead, sections, footer

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the entire contents of `app/page.tsx`**

```tsx
import WordChainGame from '@/components/WordChainGame';
import { getTodayDateString, getPuzzleNumber } from '@/lib/words';

export default function Home() {
  const puzzleNo = getPuzzleNumber();

  return (
    <div className="min-h-screen bg-paper">
      {/* AdSense Placeholder - Top Banner (Desktop) */}
      {/* TODO: Replace with actual AdSense code */}
      <div className="hidden md:flex items-center justify-center h-[90px] bg-paper border-b border-hairline">
        <p className="text-ink-faint text-sm">Ad Space 728x90</p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Masthead */}
        <header className="text-center mb-8 sm:mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-faint font-semibold">
            {getTodayDateString()} · No. {puzzleNo}
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold text-ink mt-3">
            Word Chain
          </h1>
          <div className="w-9 h-[3px] bg-ink mx-auto my-5 rounded-full" />
          <p className="text-base sm:text-lg text-ink-muted">
            Connect words, beat the clock
          </p>
        </header>

        {/* Game Component */}
        <WordChainGame />

        {/* How It Works Section */}
        <section className="max-w-2xl mx-auto mt-12 sm:mt-16">
          <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-4">
              Create the longest word chain in 60 seconds
            </h2>
            <div className="space-y-4 text-ink-muted">
              <p>
                Daily Word Chain is a fast-paced word puzzle game that tests your vocabulary
                and quick thinking. Each day brings a new starting word and a fresh challenge.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="border border-hairline rounded-lg p-4">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="font-semibold text-ink mb-1">Chain Words</h3>
                  <p className="text-sm">
                    Each word must start with the last letter of the previous word
                  </p>
                </div>
                <div className="border border-hairline rounded-lg p-4">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-ink mb-1">Beat the Timer</h3>
                  <p className="text-sm">
                    You have 60 seconds to create the longest chain possible
                  </p>
                </div>
                <div className="border border-hairline rounded-lg p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-ink mb-1">Score Points</h3>
                  <p className="text-sm">
                    Earn points for each word plus bonuses for longer words
                  </p>
                </div>
                <div className="border border-hairline rounded-lg p-4">
                  <div className="text-3xl mb-2">🔥</div>
                  <h3 className="font-semibold text-ink mb-1">Build Streaks</h3>
                  <p className="text-sm">
                    Play daily to build your streak and track your progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-12 sm:mt-16 text-ink-faint text-sm">
          <p>
            New puzzle daily at midnight UTC | Share your score with friends
          </p>
          <p className="mt-2">
            Made with ❤️ for word game enthusiasts
          </p>
        </footer>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "style: editorial masthead, hairline cards, footer"
```

---

## Task 3: WordChainGame (outer card, pre-game, playing)

**Files:**
- Modify: `components/WordChainGame.tsx` (JSX in the `return`, lines ~127-222; do not change any logic/hooks)

- [ ] **Step 1: Replace the outer card opening tag**

Change:
```tsx
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
```
to:
```tsx
      <div className="bg-paper border border-hairline rounded-lg shadow-sm p-6 sm:p-8">
```

- [ ] **Step 2: Replace the entire `pre-game` block**

Replace the whole `{gameState === 'pre-game' && ( ... )}` block with:

```tsx
        {gameState === 'pre-game' && (
          <div className="text-center space-y-6">
            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-ink-faint font-semibold mb-2">
                {challenge ? `Challenge · No. ${challenge.p}` : "Today's word"}
              </p>
              <div className="inline-block border-2 border-ink text-ink text-3xl sm:text-4xl font-bold tracking-[0.3em] pl-[0.3em] pr-2 py-3 rounded-md">
                {startWord}
              </div>
            </div>

            <div className="text-left border border-hairline rounded-lg p-6 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-ink">How to play</h3>
              <ul className="space-y-2 text-ink-muted text-sm">
                <li>· Create a word chain in 60 seconds</li>
                <li>· Each word must start with the last letter of the previous word</li>
                <li>· All words must be valid English words</li>
                <li>· Score points for each word + letter bonuses</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-ink text-paper font-semibold text-xl py-4 px-8 rounded-md hover:opacity-90 transition-opacity"
            >
              Play
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="block mx-auto text-ink-muted font-semibold underline-offset-4 hover:underline"
            >
              View stats
            </button>
          </div>
        )}
```

- [ ] **Step 3: Replace the `playing` block's Score readout and input/button**

In the `{gameState === 'playing' && ( ... )}` block, replace the "Current Score" div:
```tsx
            <div className="text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-4xl font-bold text-primary">{currentScore}</p>
              <p className="text-sm text-gray-500 mt-1">
                {wordChain.length} {wordChain.length === 1 ? 'word' : 'words'} chained
              </p>
            </div>
```
with:
```tsx
            <div className="text-center">
              <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold">Score</p>
              <p className="font-serif text-5xl font-semibold text-ink">{currentScore}</p>
              <p className="text-sm text-ink-muted mt-1">
                {wordChain.length} {wordChain.length === 1 ? 'word' : 'words'} chained
              </p>
            </div>
```

Then replace the input `<label>`, `<input>`, and submit `<button>` within the form:
```tsx
                <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Next word must start with:{' '}
                  <span className="text-2xl font-bold text-primary">
                    {(wordChain.length > 0
                      ? wordChain[wordChain.length - 1]
                      : startWord
                    ).slice(-1)}
                  </span>
                </label>
                <input
                  ref={inputRef}
                  id="word-input"
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  disabled={isValidating}
                  className="w-full px-4 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none disabled:bg-gray-100 uppercase"
                  placeholder="Type word..."
                  autoComplete="off"
                  autoFocus
                />
```
with:
```tsx
                <label htmlFor="word-input" className="block text-sm font-medium text-ink-muted mb-2">
                  Next word must start with:{' '}
                  <span className="font-serif text-2xl font-bold text-ink">
                    {(wordChain.length > 0
                      ? wordChain[wordChain.length - 1]
                      : startWord
                    ).slice(-1)}
                  </span>
                </label>
                <input
                  ref={inputRef}
                  id="word-input"
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  disabled={isValidating}
                  className="w-full px-4 py-4 text-2xl font-semibold border-2 border-hairline rounded-md focus:border-ink focus:outline-none disabled:bg-ink/5 uppercase"
                  placeholder="Type word..."
                  autoComplete="off"
                  autoFocus
                />
```
And the submit button:
```tsx
              <button
                type="submit"
                disabled={isValidating || !currentInput.trim()}
                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Checking...' : 'Add Word'}
              </button>
```
with:
```tsx
              <button
                type="submit"
                disabled={isValidating || !currentInput.trim()}
                className="w-full bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Checking...' : 'Add Word'}
              </button>
```

(The `error` block keeps its red status styling — leave it unchanged.)

- [ ] **Step 4: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 5: Commit**

```bash
git add components/WordChainGame.tsx
git commit -m "style: editorial pre-game and playing screens"
```

---

## Task 4: Timer

**Files:**
- Modify: `components/Timer.tsx` (only the returned JSX, lines ~37-58)

- [ ] **Step 1: Replace the `return (...)` JSX**

```tsx
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold">Time</span>
        <span
          className={`font-serif text-2xl font-semibold ${
            isLowTime ? 'text-red-600 animate-pulse' : 'text-ink'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isLowTime ? 'bg-red-600' : 'bg-ink'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
```

- [ ] **Step 2: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 3: Commit**

```bash
git add components/Timer.tsx
git commit -m "style: editorial timer (ink track, red urgent state)"
```

---

## Task 5: WordChain tiles

**Files:**
- Modify: `components/WordChain.tsx` (the `return (...)` JSX)

- [ ] **Step 1: Replace the `return (...)` JSX**

```tsx
  return (
    <div className="w-full">
      <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Word Chain</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {allWords.map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`px-4 py-2 rounded-md font-semibold text-lg border ${
                  index === 0
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink border-hairline'
                }`}
              >
                {word}
              </div>
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
    </div>
  );
```

- [ ] **Step 2: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 3: Commit**

```bash
git add components/WordChain.tsx
git commit -m "style: editorial word-chain tiles"
```

---

## Task 6: Results screen

**Files:**
- Modify: `components/Results.tsx` (only JSX inside the `return`; keep all hooks/logic and the challenge banner status colors)

- [ ] **Step 1: Replace the "Game Over!" header block**

```tsx
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over!</h2>
        <p className="text-lg text-gray-600">
```
with:
```tsx
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Game Over</h2>
        <p className="text-lg text-ink-muted">
```

(Leave the `{challenge && (...)}` status banner block exactly as-is — its green/blue/amber colors are intentional functional signals.)

- [ ] **Step 2: Replace the score-breakdown panel**

Replace:
```tsx
      {/* Score breakdown */}
      <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-xl p-6 text-white">
        <div className="text-center mb-4">
          <p className="text-sm opacity-80">Your Score</p>
          <p className="text-5xl font-bold">{score}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-400">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalWords}</p>
            <p className="text-sm opacity-80">Words Chained</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalChars}</p>
            <p className="text-sm opacity-80">Total Letters</p>
          </div>
        </div>
      </div>
```
with:
```tsx
      {/* Score breakdown */}
      <div className="bg-paper border border-hairline rounded-lg p-6">
        <div className="text-center mb-4">
          <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold">Your Score</p>
          <p className="font-serif text-6xl font-semibold text-ink">{score}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline">
          <div className="text-center">
            <p className="font-serif text-2xl font-semibold text-ink">{totalWords}</p>
            <p className="text-sm text-ink-muted">Words Chained</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-2xl font-semibold text-ink">{totalChars}</p>
            <p className="text-sm text-ink-muted">Total Letters</p>
          </div>
        </div>
      </div>
```

- [ ] **Step 3: Replace the "Your Chain" block**

Replace:
```tsx
      {/* Word chain display */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Your Chain</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <p className="text-gray-900 leading-relaxed">
            <span className="font-bold text-primary">{startWord}</span>
            {words.map((word, idx) => (
              <span key={idx}>
                {' → '}
                <span className="font-semibold">{word}</span>
              </span>
            ))}
          </p>
        </div>
      </div>
```
with:
```tsx
      {/* Word chain display */}
      <div>
        <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Your Chain</h3>
        <div className="border border-hairline rounded-lg p-4 max-h-40 overflow-y-auto">
          <p className="text-ink leading-relaxed">
            <span className="font-bold">{startWord}</span>
            {words.map((word, idx) => (
              <span key={idx}>
                {' → '}
                <span className="font-semibold">{word}</span>
              </span>
            ))}
          </p>
        </div>
      </div>
```

- [ ] **Step 4: Replace the actions block (nickname input, Play Again, View Stats) and the ad placeholder**

Replace:
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
with:
```tsx
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 16))}
          placeholder="Your name (optional)"
          maxLength={16}
          className="w-full px-4 py-2 border border-hairline rounded-md text-center focus:border-ink focus:outline-none"
        />
```
Replace the "Play Again" button:
```tsx
        <button
          onClick={onPlayAgain}
          className="w-full bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={() => setShowStats(true)}
          className="w-full text-primary font-semibold py-2"
        >
          📊 View Stats
        </button>
```
with:
```tsx
        <button
          onClick={onPlayAgain}
          className="w-full border border-hairline text-ink font-semibold py-3 px-6 rounded-md hover:bg-ink/5 transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={() => setShowStats(true)}
          className="w-full text-ink-muted font-semibold py-2 underline-offset-4 hover:underline"
        >
          View stats
        </button>
```
Replace the ad placeholder:
```tsx
      <div className="flex items-center justify-center h-[250px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">Ad Space 300x250</p>
      </div>
```
with:
```tsx
      <div className="flex items-center justify-center h-[250px] rounded-lg border-2 border-dashed border-hairline">
        <p className="text-ink-faint text-sm">Ad Space 300x250</p>
      </div>
```

(Leave the streak `bg-orange-50` block as-is — functional signal. `ShareButton` is restyled in Task 7.)

- [ ] **Step 5: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 6: Commit**

```bash
git add components/Results.tsx
git commit -m "style: editorial results screen"
```

---

## Task 7: ShareButton + StatsModal

**Files:**
- Modify: `components/ShareButton.tsx` (button className only)
- Modify: `components/StatsModal.tsx` (JSX classes only; keep logic)

- [ ] **Step 1: ShareButton — replace the button className**

Change:
```tsx
      className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
```
to:
```tsx
      className="w-full bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:opacity-90 transition-opacity"
```

- [ ] **Step 2: StatsModal — replace the inner panel + headings + bars + heatmap classes**

Replace the modal panel wrapper:
```tsx
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Stats</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>
```
with:
```tsx
      <div
        className="bg-paper border border-hairline rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-semibold text-ink">Your Stats</h2>
          <button onClick={onClose} className="text-ink-faint text-2xl leading-none hover:text-ink">×</button>
        </div>
```
Replace the stat tiles map (the value/label paragraphs):
```tsx
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
```
with:
```tsx
            <div key={label}>
              <p className="font-serif text-2xl font-semibold text-ink">{value}</p>
              <p className="text-xs text-ink-faint">{label}</p>
            </div>
```
Replace the two section headings (Score Distribution, Last 30 Days), both currently:
```tsx
        <h3 className="text-sm font-medium text-gray-600 mb-2">Score Distribution</h3>
```
and
```tsx
        <h3 className="text-sm font-medium text-gray-600 mb-2">Last 30 Days</h3>
```
with (respectively):
```tsx
        <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Score Distribution</h3>
```
```tsx
        <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold mb-2">Last 30 Days</h3>
```
Replace the distribution row label + bar:
```tsx
            <div key={b.label} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-500">{b.label}</span>
              <div
                className="bg-primary text-white text-xs text-right px-2 rounded"
                style={{ width: `${(b.count / maxBucket) * 100}%`, minWidth: '1.5rem' }}
              >
                {b.count}
              </div>
            </div>
```
with:
```tsx
            <div key={b.label} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-ink-muted">{b.label}</span>
              <div
                className="bg-ink text-paper text-xs text-right px-2 rounded"
                style={{ width: `${(b.count / maxBucket) * 100}%`, minWidth: '1.5rem' }}
              >
                {b.count}
              </div>
            </div>
```
Replace the heatmap cell:
```tsx
              className={`aspect-square rounded ${d.played ? 'bg-primary' : 'bg-gray-200'}`}
```
with:
```tsx
              className={`aspect-square rounded ${d.played ? 'bg-ink' : 'bg-ink/10'}`}
```

- [ ] **Step 3: Verify**

Run: `npm run build` (expect success) and `npm test` (expect 22 passed).

- [ ] **Step 4: Commit**

```bash
git add components/ShareButton.tsx components/StatsModal.tsx
git commit -m "style: editorial share button and stats modal"
```

---

## Task 8: OG image repaint

**Files:**
- Modify: `app/c/[code]/opengraph-image.tsx`

Note: edge `ImageResponse` (Satori) renders only fonts whose data is provided; embedding Fraunces is out of scope. Keep the default font, repaint colors to the cream/ink palette and drop the indigo gradient.

- [ ] **Step 1: Replace the `<div>` style background and text colors in the `ImageResponse`**

Replace:
```tsx
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
```
with:
```tsx
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf7ef',
          color: '#141414',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>🔗 {headline}</div>
        <div
          style={{ width: 60, height: 4, background: '#141414', margin: '28px 0', borderRadius: 2 }}
        />
        <div style={{ fontSize: 36, color: '#5c5c5c' }}>{sub}</div>
        <div style={{ fontSize: 26, marginTop: 48, color: '#8a8478' }}>dailywordchain.com</div>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: success; `/c/[code]/opengraph-image` route still builds.
Run: `npm test` (expect 22 passed).

- [ ] **Step 3: Commit**

```bash
git add app/c/[code]/opengraph-image.tsx
git commit -m "style: repaint OG card to editorial palette"
```

---

## Task 9: Sweep + final verification

**Files:** none (verification + any stragglers found)

- [ ] **Step 1: Grep for leftover indigo/purple/old-color references**

Run (PowerShell-safe; use the repo grep tool or):
`git grep -nE "indigo-|purple-|#6366F1|bg-white|text-gray-|bg-gray-|from-primary|hover:bg-indigo" -- "components" "app" ":!app/globals.css"`

Expected: no matches in `components/` or `app/` except:
- intentional `primary` token alias in `tailwind.config.ts` (not matched by the pattern),
- nothing else.

If any straggler appears, convert it to the nearest token (`text-gray-*` → `text-ink-muted`/`text-ink-faint`, `bg-gray-*` → `bg-paper` or `bg-ink/5`, `bg-white` → `bg-paper`) and note it. Commit any fixes:
```bash
git add -A
git commit -m "style: sweep remaining legacy color classes"
```

- [ ] **Step 2: Full build + test**

Run: `npm run build` (expect success, no type errors) and `npm test` (expect 22 passed).

- [ ] **Step 3: Manual visual check (record results, do not auto-pass)**

Run `npm run dev` and verify against the approved mockups at 375px and desktop widths:
- Homepage masthead: `{date} · No. {n}`, Fraunces "Word Chain", hairline rule, cream background.
- Pre-game: kicker + bordered word tile + ink "Play" + ghost "View stats".
- Playing: ink timer (red under 10s), Fraunces score, hairline input focusing to ink, ink "Add Word".
- Results: Fraunces "Game Over", paper score panel, status banners still colored, ghost "Play Again".
- Stats modal: paper panel, Fraunces numbers, ink bars, ink heatmap.
- Challenge page `/c/<code>`: inherits the new look.
- OG image `/c/<code>/opengraph-image`: cream card, ink text, rule.

- [ ] **Step 4: Update TESTING.md visual section**

Add a short "Editorial UI" manual-check list mirroring Step 3 to `TESTING.md`, then commit:
```bash
git add TESTING.md
git commit -m "docs: add editorial UI visual checklist"
```

---

## Self-Review Notes

- Every task ends with `npm run build` + `npm test` (must stay 22 passed — no logic touched).
- All `primary`/`indigo`/`purple`/`gray`/`white` usages in `components/` and `app/` are converted; `primary` survives only as a config alias mapped to ink.
- Fonts load via `next/font` (self-hosted, no CLS). Word tiles stay Inter; only headings/score/section titles use `font-serif` (Fraunces).
- Status colors (red/green/blue/amber/orange) are intentionally preserved as functional signals.
