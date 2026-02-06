'use client';

import ShareButton from './ShareButton';

interface ResultsProps {
  words: string[];
  startWord: string;
  score: number;
  streak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
}

export default function Results({
  words,
  startWord,
  score,
  streak,
  isNewBest,
  onPlayAgain,
}: ResultsProps) {
  const totalWords = words.length;
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over!</h2>
        <p className="text-lg text-gray-600">
          {isNewBest && '🎉 New Personal Best! '}
          {score > 150 && 'Amazing chain!'}
          {score > 100 && score <= 150 && 'Great job!'}
          {score <= 100 && 'Nice try!'}
        </p>
      </div>

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

      {/* Streak */}
      {streak > 1 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-orange-900 font-semibold">
            🔥 {streak} Day Streak!
          </p>
        </div>
      )}

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

      {/* Actions */}
      <div className="space-y-3">
        <ShareButton wordCount={totalWords} startWord={startWord} score={score} />
        <button
          onClick={onPlayAgain}
          className="w-full bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Play Again
        </button>
      </div>

      {/* AdSense Placeholder - Results */}
      {/* TODO: Replace with actual AdSense code */}
      <div className="flex items-center justify-center h-[250px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">Ad Space 300x250</p>
      </div>
    </div>
  );
}
