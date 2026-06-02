# UI Editorial Redesign — Design

**Date:** 2026-06-02
**Goal:** Make the UI more user-friendly *and* professional by replacing the generic "indigo SaaS starter" look with a restrained **editorial / newspaper-games** visual language (NYT Games feel).
**Constraint:** Visual/CSS refactor only — no gameplay, data, or feature changes. No new dependencies beyond Google Fonts via `next/font`. Dark mode is out of scope.

---

## Background

The current UI (`tailwind.config.ts` `primary: #6366F1`, system font stack, indigo→purple gradient background, `rounded-2xl` white cards with `shadow-xl`, indigo-50 filled tiles) reads as a default Tailwind template. The growth-loop features shipped; now the look needs to feel premium and trustworthy while staying approachable.

Decisions reached through visual brainstorming (mockups reviewed in-browser):
1. **Direction:** Editorial / NYT Games (serif headings, hairline rules, minimal).
2. **Display typeface:** **Fraunces** (warm modern serif).
3. **Palette:** **Monochrome on cream paper** — black ink, no decorative accent color.
4. **Status colors retained** as functional signals only (error / win / tie / loss), not a color theme.

---

## Design Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| `paper` | `#faf7ef` | page + card background |
| `ink` | `#141414` | primary text, buttons, rules, tile borders |
| `ink-muted` | `#5c5c5c` | body/secondary text |
| `ink-faint` | `#8a8478` | small labels, kicker, dates |
| `hairline` | `#d8d2c4` | 1px borders, ghost-button borders, dividers |

**Functional status colors (minimal, not themeable surfaces):**

| Token | Hex | Use |
|---|---|---|
| `error` | `#be123c` | invalid-word message |
| `win` | `#15803d` | challenge "you beat" banner |
| `tie` | `#1d4ed8` | challenge "tied" banner |
| `loss` | `#b45309` | challenge "lost" banner |

These keep their existing soft-tinted backgrounds (e.g. `bg-green-50`) but are reframed as the only color in the product. The `primary` token (`#6366F1`) is **replaced** by `ink`; all `indigo-*` / `purple-*` hardcoded classes are swept out.

### Typography

- Load via `next/font/google`: **Fraunces** (display) and **Inter** (UI/body). Expose as CSS variables `--font-display`, `--font-ui`; map Tailwind `fontFamily.serif → Fraunces`, `fontFamily.sans → Inter`. Body defaults to Inter.
- **Headings / masthead title:** Fraunces, weight 600.
- **Body, UI, buttons, word tiles:** Inter. Word tiles use uppercase + wide letter-spacing.

### Shape & depth

- **Radius:** small — buttons `rounded-md` (~6px), cards/modals `rounded-lg` (~8px). Remove `rounded-2xl`.
- **Depth:** replace heavy `shadow-xl` with **1px `hairline` borders**; at most a very soft shadow on the modal overlay. The cream paper + rules carry the structure.
- **Buttons:** primary = solid `ink` bg, white text; secondary/ghost = transparent bg with `hairline` border, `ink` text.

---

## Component-by-Component

Each component keeps its current structure/behavior; only classes and a few small markup additions (kicker/rule) change.

- **`tailwind.config.ts`** — add the color tokens above; set `fontFamily` to the CSS variables. Keep `primary` as an alias of `ink` so any missed reference still renders ink (belt-and-suspenders), but prefer explicit `ink` classes.
- **`app/layout.tsx`** — initialize Fraunces + Inter with `next/font/google`, attach the font-variable classes to `<html>`/`<body>`; set body background to `paper`.
- **`app/globals.css`** — set base `body` background `paper`, default text `ink`, font to Inter var; remove the old hardcoded system-font stack in favor of the Inter variable; base heading rule → Fraunces.
- **`app/page.tsx`** — convert the header into a **masthead**: small kicker line `"{Mon D} · No. {puzzleNumber}"` (use `getPuzzleNumber()` + `getTodayDateString()`), Fraunces title, a centered hairline rule, subtitle in `ink-muted`. Restyle the "How it works" grid: hairline-bordered cards on paper (drop `bg-indigo-50`), keep the emoji icons. Restyle footer in `ink-faint`. Keep the AdSense placeholder slots.
- **`components/WordChainGame.tsx`** — pre-game: kicker + `No.`/challenge label (reuse the existing challenge-aware heading), Fraunces section title, bordered word tile, ink primary "Play", ghost "How to play"/"View Stats". Playing: restyle score readout (Fraunces number), input (hairline border, `focus` ring in ink), ink submit button. Replace all `bg-primary`/`hover:bg-indigo-700`.
- **`components/Timer.tsx`** — restyle countdown to ink; the ≤10s urgent state uses `error` red instead of the current color.
- **`components/WordChain.tsx`** — chain tiles: bordered/underlined editorial tiles, ink text, remove indigo highlight (start word distinguished by a filled ink tile or bold rule).
- **`components/Results.tsx`** — "Game Over!" in Fraunces; score panel uses ink on paper with a hairline frame instead of the indigo gradient; the challenge win/tie/loss banners keep their status colors; nickname input + buttons restyled (ink primary, ghost secondary).
- **`components/ShareButton.tsx`** — ink primary button styling (behavior unchanged).
- **`components/StatsModal.tsx`** — paper modal with hairline border; stat numbers in Fraunces; distribution bars in `ink`; calendar heatmap played-days in `ink`, empty days in `hairline`. Replace `bg-primary`/`text-primary`.
- **`app/c/[code]/opengraph-image.tsx`** — repaint the OG card to the monochrome paper palette (cream bg, ink text, Fraunces-like serif if available in edge `ImageResponse`, otherwise a serif fallback) so shared cards match the site.

---

## Out of Scope

- Dark mode / theme toggle.
- Any gameplay, scoring, storage, or routing change.
- New animations beyond simple existing transitions.
- Logo/illustration work (emoji icons stay).

---

## Verification

- `npm run build` passes with no type errors; fonts load via `next/font` (self-hosted, no layout shift).
- `npm test` still green (no logic touched).
- Manual visual pass against the approved mockups on mobile (375px) and desktop: masthead, pre-game, playing, results, stats modal, challenge page, OG card.
- Grep check: no remaining `indigo-`, `purple-`, or `#6366F1` references in components/app (except the intentional `primary→ink` alias).
