# Daily Word Chain - MVP

A fast-paced word puzzle game built with Next.js where players chain words together in 60 seconds.

## Features

- **Daily Challenge**: New starting word every day (365 pre-configured)
- **60-Second Timer**: Fast-paced gameplay with countdown
- **Word Validation**: Uses Free Dictionary API for real-time validation
- **Smart Scoring**: Points for word count + letter bonuses
- **Streak Tracking**: localStorage-based daily streak system
- **Mobile-First**: Optimized for mobile keyboards and horizontal scrolling
- **Share Results**: Native share API with clipboard fallback

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Free Dictionary API (no auth required)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /layout.tsx       # SEO metadata, page layout
  /page.tsx         # Landing page + game container
  /globals.css      # Tailwind imports
/components
  /WordChainGame.tsx   # Main game logic & state
  /Timer.tsx           # Countdown timer component
  /WordChain.tsx       # Horizontal word display
  /Results.tsx         # End game screen
  /ShareButton.tsx     # Share/copy results
/lib
  /words.ts         # 365 daily starting words
  /dictionary.ts    # API validation & scoring
  /storage.ts       # localStorage utilities
```

## Game Rules

1. Start with the daily word (changes at midnight UTC)
2. Each new word must start with the last letter of the previous word
3. All words must be valid English words (validated via Dictionary API)
4. No repeating words
5. 60 seconds to build the longest chain possible

## Scoring

- Base: 10 points per word
- Bonus: +1 point per letter in each word
- Example: 5 words with 25 total letters = 50 + 25 = 75 points

## AdSense Integration

HTML comments mark ad placements:
- Top banner (728x90) - desktop only
- Results screen (300x250) - below final score

Replace placeholders in `/app/page.tsx` and `/components/Results.tsx` with actual AdSense code.

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

### Environment Variables

No environment variables required for MVP. Dictionary API is public.

Optional (for AdSense):
```
NEXT_PUBLIC_ADSENSE_ID=ca-pub-xxxxxxxxxxxxx
```

## Local Testing Checklist

- [ ] Game starts with correct daily word
- [ ] Timer counts down from 60 seconds
- [ ] Words are validated (try valid: "cat", invalid: "xyz")
- [ ] Chain rule enforced (next word must start with last letter)
- [ ] No duplicate words allowed
- [ ] Score calculates correctly
- [ ] Results screen shows chain and allows sharing
- [ ] Streak increments on consecutive daily plays
- [ ] Mobile responsive (test keyboard input)

## Future Enhancements

- [ ] Add PostHog analytics for user tracking
- [ ] Implement leaderboard (requires backend)
- [ ] Add word definitions on hover
- [ ] Offline mode with cached word list
- [ ] Difficulty levels (time variations)
- [ ] Multiplayer mode

## License

MIT
