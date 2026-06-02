# Manual Testing Checklist

## Pre-Game State
- [ ] Today's starting word displays correctly
- [ ] "How to Play" instructions are clear
- [ ] "Start Game" button is visible and clickable

## During Gameplay
- [ ] Timer starts at 60 seconds and counts down
- [ ] Timer turns red and pulses at 10 seconds remaining
- [ ] Current score updates in real-time
- [ ] Word count displays correctly
- [ ] Starting word shows in indigo/primary color
- [ ] Input field auto-focuses when game starts
- [ ] Input field shows required starting letter

### Valid Word Submission
- [ ] Enter "table" after "cat" → should succeed
- [ ] Word appears in horizontal chain
- [ ] Input clears after successful submission
- [ ] Input focuses automatically for next word

### Invalid Word Rejection
- [ ] Enter word not starting with correct letter → error message
- [ ] Enter duplicate word → "Word already used!" error
- [ ] Enter nonsense word (e.g., "xyz") → "Not a valid English word" error

### Chain Display
- [ ] Words display horizontally with arrows between
- [ ] Horizontal scroll works on mobile
- [ ] Starting word stays highlighted in indigo

## End Game (Time Up)
- [ ] Game stops when timer reaches 0
- [ ] Results screen displays automatically
- [ ] Final score matches last displayed score
- [ ] Word count is accurate
- [ ] Total letters count is correct
- [ ] Full word chain displays correctly

## Results Screen
- [ ] Congratulatory message appears based on score
- [ ] Score breakdown shows (words + letters)
- [ ] Word chain is readable and complete
- [ ] "Share Results" button works (check both native share and clipboard)
- [ ] "Play Again" button resets to pre-game state
- [ ] Streak displays if > 1 day

## Share Functionality
Test on mobile:
- [ ] Native share sheet opens
- [ ] Share text includes date, word count, starting word

Test on desktop:
- [ ] Clipboard copy works
- [ ] Alert confirms "Results copied to clipboard!"

## Streak Tracking
Day 1:
- [ ] Play a game, verify streak = 1

Day 2 (or use browser DevTools to manipulate localStorage):
- [ ] Play again next day, verify streak = 2
- [ ] Streak badge shows "🔥 2 Day Streak!"

Skip a day:
- [ ] Streak resets to 1

## Mobile Responsiveness
- [ ] Layout looks good on iPhone SE (375px)
- [ ] Layout looks good on tablet (768px)
- [ ] Layout looks good on desktop (1280px)
- [ ] Input keyboard auto-shows on mobile
- [ ] Text is readable without zooming
- [ ] Buttons are easy to tap (large enough)

## Performance
- [ ] Word validation responds within 1-2 seconds
- [ ] No lag when typing in input field
- [ ] Smooth scrolling in word chain

## Edge Cases
- [ ] Play multiple rounds in same session
- [ ] Close and reopen browser (streak persists)
- [ ] Private browsing mode (graceful localStorage handling)
- [ ] Very long words (10+ letters)
- [ ] Rapid submissions (multiple words quickly)

## API Testing
Valid test words:
- cat → table → elephant → tiger → rabbit → tree → exit

Invalid test words:
- zxqwp (not a word)
- aaaaaa (not a word)

## AdSense Placeholders
- [ ] Top banner placeholder shows on desktop (728x90)
- [ ] Top banner hidden on mobile
- [ ] Results ad placeholder shows (300x250)

## SEO/Meta
- [ ] Page title correct in browser tab
- [ ] Meta description set (view source)
- [ ] Open Graph tags present (test with og debugger)

## Growth Loop Features

### Emoji Share
- [ ] "Share Results" copies/shares text with `Word Chain #N` header
- [ ] Output shows emoji tiles (🟨/🟩/🟦 by word length), score, and a `/c/<code>` link
- [ ] Output does NOT contain any actual words (spoiler-free)
- [ ] Streak flame (🔥) appears only when streak > 1

### Stats Modal
- [ ] "📊 View Stats" opens on both pre-game and Results screens
- [ ] Tiles show Played / Streak / Max / Best
- [ ] Score distribution bars render proportionally
- [ ] 30-day calendar heatmap colors played days; hover shows date + score
- [ ] Backdrop click and × button close the modal

### Friend Challenge
- [ ] Opening `/c/<code>` shows challenger header ("X scored N on #P")
- [ ] Challenge loads the SAME puzzle word as the challenger (even a past one)
- [ ] After finishing, banner shows "You beat … / Lost to …" with correct margin
- [ ] Sharing again generates a new link with your own score (challenge back)
- [ ] Malformed `/c/<garbage>` falls back to today's puzzle without crashing
- [ ] Optional nickname input (max 16 chars) appears on the challenger's name

### Dynamic OG Card
- [ ] `/c/<code>/opengraph-image` renders a 1200×630 PNG
- [ ] Shared link unfurls as a rich card (test with an OG/link debugger)
- [ ] `<title>`/`og` tags reflect the challenge (view source on `/c/<code>`)

## Unit Tests
- [ ] `npm test` passes (puzzle numbers, storage/history, challenge codec, emoji, stats)

## Deployment Readiness
- [ ] No console errors in production build
- [ ] All assets load correctly
- [ ] No TypeScript errors
- [ ] Build completes successfully (npm run build)
- [ ] `NEXT_PUBLIC_SITE_URL` set in Vercel env vars (for correct share links)

## Editorial UI (visual)
Check at 375px (mobile) and desktop widths:
- [ ] Page background is cream paper (#faf7ef), body font is Inter
- [ ] Masthead: `{date} · No. {n}` kicker, Fraunces serif "Word Chain", hairline rule
- [ ] Pre-game: "Today's word" kicker, outlined word tile, ink "Play" button, "View stats" link
- [ ] Playing: ink timer track (turns red under 10s), Fraunces score, ink input focus ring, ink "Add Word"
- [ ] Word chain: start tile solid ink, the rest hairline-bordered
- [ ] Results: Fraunces "Game Over", paper score panel, status banners still colored (green/blue/amber), ghost "Play Again"
- [ ] Stats modal: paper panel, Fraunces numbers, ink distribution bars, ink calendar heatmap
- [ ] Challenge page `/c/<code>`: editorial masthead inherits the look
- [ ] OG image `/c/<code>/opengraph-image`: cream card, ink text, rule
- [ ] No indigo/purple/gray remnants anywhere

## Definitions & Modes
- [ ] Tapping a chain tile (in play) opens a definition popover (loading → text / "No definition found.")
- [ ] Tapping a word on the Results screen opens the same popover
- [ ] Pre-game Time (30/60/120) and Difficulty (Easy/Normal/Hard) selectors work and highlight selection
- [ ] Pre-game hint text reflects the selected time (e.g. "in 30 seconds")
- [ ] Min-length rule rejects too-short words with "Use N+ letter words" (try Hard + a 3-letter word)
- [ ] Timer uses the selected duration (30 / 60 / 120)
- [ ] Share text header shows the mode (e.g. `Word Chain #N · 30s · 3+`)
- [ ] Challenge link locks the mode (no selectors on /c/<code>)
- [ ] Same-mode challenge shows beat/tie/loss; different mode shows the "not comparable" note
