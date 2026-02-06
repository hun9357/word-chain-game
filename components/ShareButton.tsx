'use client';

import { getTodayDateString } from '@/lib/words';

interface ShareButtonProps {
  wordCount: number;
  startWord: string;
  score: number;
}

export default function ShareButton({ wordCount, startWord, score }: ShareButtonProps) {
  const handleShare = async () => {
    const dateStr = getTodayDateString();
    const emoji = score > 150 ? '⭐ Great job!' : score > 100 ? '💪 Nice work!' : '👍 Good try!';

    const text = `Daily Word Chain ${dateStr}

🔗 ${wordCount} words chained
⏱️ 60 seconds
🎯 Start: ${startWord}

${emoji}

Play: dailywordchain.com

#DailyWordChain #WordPuzzle`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Word Chain',
          text: text,
        });
      } catch (err) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
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
