'use client';

import { useState } from 'react';
import ShareButton from './ShareButton';
import StatsModal from './StatsModal';
import type { Challenge } from '@/lib/share';
import DefinitionPopover from './DefinitionPopover';
import { modeLabel, type Mode } from '@/lib/modes';

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

export default function Results({
  words,
  startWord,
  score,
  streak,
  isNewBest,
  onPlayAgain,
  challenge,
  mode,
}: ResultsProps) {
  const [showStats, setShowStats] = useState(false);
  const [nickname, setNickname] = useState('');
  const [defWord, setDefWord] = useState<string | null>(null);

  const totalWords = words.length;
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);

  const challengeMode = challenge
    ? { time: challenge.t ?? 60, minLen: challenge.m ?? 2 }
    : null;
  const sameMode =
    !!challengeMode && mode.time === challengeMode.time && mode.minLen === challengeMode.minLen;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">
          Final result
        </p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-ink">Game Over</h2>
        <p className="mt-2 text-lg font-semibold text-ink-muted">
          {isNewBest && 'New personal best. '}
          {score > 150 && 'Amazing chain.'}
          {score > 100 && score <= 150 && 'Great job.'}
          {score <= 100 && 'Nice try.'}
        </p>
      </div>

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
              ? `You beat ${challenge.n ?? 'them'} by ${score - challenge.s}.`
              : score === challenge.s
              ? `You tied ${challenge.n ?? 'them'} at ${score}.`
              : `You were ${challenge.s - score} points behind ${challenge.n ?? 'them'}. Try again.`}
          </div>
        ) : (
          <div className="rounded-lg p-4 text-center font-semibold bg-ink/5 border border-hairline text-ink-muted">
            Played a different mode ({modeLabel(challengeMode!)}) - scores aren&apos;t directly comparable.
          </div>
        ))}

      <div className="rounded-lg border border-hairline bg-paper-soft/80 p-6">
        <div className="text-center mb-4">
          <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-bold">Your Score</p>
          <p className="font-serif text-7xl font-semibold text-clay">{score}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline">
          <div className="text-center">
            <p className="font-serif text-3xl font-semibold text-ink">{totalWords}</p>
            <p className="text-sm text-ink-muted">Words Chained</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl font-semibold text-ink">{totalChars}</p>
            <p className="text-sm text-ink-muted">Total Letters</p>
          </div>
        </div>
      </div>

      {streak > 1 && (
        <div className="rounded-lg border border-clay/30 bg-clay/10 p-4 text-center">
          <p className="font-bold text-ink">
            {streak} day streak
          </p>
        </div>
      )}

      <div>
        <h3 className="text-xs tracking-[0.15em] uppercase text-ink-faint font-bold mb-2">Your Chain</h3>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-hairline bg-paper-soft/70 p-4">
          <p className="text-ink leading-relaxed">
            <button type="button" onClick={() => setDefWord(startWord)} className="font-bold underline-offset-2 hover:underline">
              {startWord}
            </button>
            {words.map((word, idx) => (
              <span key={idx}>
                {' -> '}
                <button type="button" onClick={() => setDefWord(word)} className="font-semibold underline-offset-2 hover:underline">
                  {word}
                </button>
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="sr-only" htmlFor="share-name">
          Your name for challenge sharing
        </label>
        <input
          id="share-name"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 16))}
          placeholder="Your name (optional)"
          maxLength={16}
          className="w-full px-4 py-3 border border-hairline bg-paper-soft rounded-md text-center focus:border-olive focus:outline-none"
        />
        <ShareButton
          words={words}
          startWord={startWord}
          score={score}
          streak={streak}
          nickname={nickname || undefined}
          challenge={challenge}
          mode={mode}
        />
        <button
          onClick={onPlayAgain}
          className="w-full border border-hairline text-ink font-extrabold py-3 px-6 rounded-md hover:bg-olive/10 transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={() => setShowStats(true)}
          className="w-full text-ink-muted font-bold py-2 underline-offset-4 hover:underline"
        >
          View stats
        </button>
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      </div>

      {/* AdSense Placeholder - Results */}
      {/* TODO: Replace with actual AdSense code */}
      <div className="flex items-center justify-center h-[250px] rounded-lg border-2 border-dashed border-hairline">
        <p className="text-ink-faint text-sm">Ad Space 300x250</p>
      </div>
      {defWord && <DefinitionPopover word={defWord} onClose={() => setDefWord(null)} />}
    </div>
  );
}
