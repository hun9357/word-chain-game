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

## Deployment Readiness
- [ ] No console errors in production build
- [ ] All assets load correctly
- [ ] No TypeScript errors
- [ ] Build completes successfully (npm run build)
