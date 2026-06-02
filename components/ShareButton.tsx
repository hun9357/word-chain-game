'use client';

import { getPuzzleNumber } from '@/lib/words';
import { buildShareText, encodeChallenge } from '@/lib/share';
import type { Challenge } from '@/lib/share';

interface ShareButtonProps {
  words: string[]; // chained words (excluding the start word)
  startWord: string;
  score: number;
  streak: number;
  nickname?: string;
  challenge?: Challenge;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dailywordchain.com';

export default function ShareButton({
  words,
  startWord,
  score,
  streak,
  nickname,
  challenge,
}: ShareButtonProps) {
  const handleShare = async () => {
    const puzzleNo = challenge ? challenge.p : getPuzzleNumber();
    const code = encodeChallenge({ p: puzzleNo, s: score, n: nickname });
    const url = `${SITE_URL}/c/${code}`;

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
