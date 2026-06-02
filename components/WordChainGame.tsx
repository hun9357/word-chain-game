'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { getTodayWord, getWordByPuzzleNumber, getPuzzleNumber } from '@/lib/words';
import type { Challenge } from '@/lib/share';
import { validateWord, canChain, calculateScore } from '@/lib/dictionary';
import { updateGameStats, getGameData } from '@/lib/storage';
import Timer from './Timer';
import WordChain from './WordChain';
import Results from './Results';
import StatsModal from './StatsModal';
import { DEFAULT_MODE, TIME_OPTIONS, DIFFICULTY_OPTIONS, type Mode } from '@/lib/modes';

type GameState = 'pre-game' | 'playing' | 'finished';

export default function WordChainGame({ challenge }: { challenge?: Challenge }) {
  const [gameState, setGameState] = useState<GameState>('pre-game');
  const [startWord, setStartWord] = useState(() =>
    challenge ? getWordByPuzzleNumber(challenge.p) : getTodayWord()
  );
  const [wordChain, setWordChain] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selTime, setSelTime] = useState(DEFAULT_MODE.time);
  const [selMinLen, setSelMinLen] = useState(DEFAULT_MODE.minLen);

  // A challenge locks the mode to the challenger's; otherwise use the selection.
  const mode: Mode = challenge
    ? { time: challenge.t ?? DEFAULT_MODE.time, minLen: challenge.m ?? DEFAULT_MODE.minLen }
    : { time: selTime, minLen: selMinLen };

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize game on mount
  useEffect(() => {
    setStartWord(
      challenge ? getWordByPuzzleNumber(challenge.p) : getTodayWord()
    );
    const data = getGameData();
    setStreak(data.streak);
  }, [challenge]);

  const startGame = () => {
    setGameState('playing');
    setWordChain([]);
    setCurrentInput('');
    setError('');
    setScore(0);

    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleTimeUp = () => {
    finishGame();
  };

  const finishGame = () => {
    const finalScore = calculateScore([startWord, ...wordChain]);
    setScore(finalScore);

    const stats = updateGameStats(
      finalScore,
      wordChain.length,
      challenge ? challenge.p : getPuzzleNumber(),
      mode
    );
    setStreak(stats.streak);
    setIsNewBest(stats.isNewBest);

    setGameState('finished');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const word = currentInput.trim().toUpperCase();

    if (!word) return;

    // Clear previous error
    setError('');
    setIsValidating(true);

    // Check if word chains with previous
    const previousWord = wordChain.length > 0 ? wordChain[wordChain.length - 1] : startWord;

    if (!canChain(previousWord, word)) {
      setError(`Must start with "${previousWord[previousWord.length - 1]}"`);
      setIsValidating(false);
      return;
    }

    // Check if word was already used
    if ([startWord, ...wordChain].includes(word)) {
      setError('Word already used!');
      setIsValidating(false);
      return;
    }

    // Enforce difficulty (minimum word length)
    if (word.length < mode.minLen) {
      setError(`Use ${mode.minLen}+ letter words`);
      setIsValidating(false);
      return;
    }

    // Validate word with dictionary
    const isValid = await validateWord(word);

    if (!isValid) {
      setError('Not a valid English word');
      setIsValidating(false);
      return;
    }

    // Add word to chain
    setWordChain([...wordChain, word]);
    setCurrentInput('');
    setIsValidating(false);
    inputRef.current?.focus();
  };

  const resetGame = () => {
    setGameState('pre-game');
    setWordChain([]);
    setCurrentInput('');
    setError('');
    setScore(0);
  };

  // Calculate current score in real-time
  const currentScore = gameState === 'playing'
    ? calculateScore([startWord, ...wordChain])
    : score;

  return (
    <div className="w-full">
      <div className="rounded-lg border border-hairline bg-paper-soft/75 p-6 shadow-panel sm:p-8 lg:p-10">
        {gameState === 'pre-game' && (
          <div className="text-center">
            <div>
              <p className="mx-auto mb-5 flex max-w-md items-center justify-center gap-4 text-sm font-bold text-ink-muted sm:text-base">
                <span className="h-px flex-1 bg-clay/60" aria-hidden="true" />
                <span>{challenge ? `Challenge / No. ${challenge.p}` : `No. ${getPuzzleNumber()}`}</span>
                <span className="h-px flex-1 bg-clay/60" aria-hidden="true" />
              </p>
              <p className="text-lg font-bold text-ink-muted">Today's word</p>
              <div className="mt-3 flex justify-center">
                <div className="flex min-h-[78px] min-w-0 items-center justify-center border-b-4 border-ink px-4 text-5xl font-black leading-none text-ink sm:min-h-[98px] sm:min-w-[360px] sm:text-7xl">
                  {startWord}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
              <button
                onClick={startGame}
                className="min-h-14 rounded-md border border-olive bg-olive px-8 py-4 text-xl font-extrabold text-paper-soft shadow-inner transition-colors hover:bg-olive-dark"
              >
                Play
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="min-h-14 rounded-md border border-olive bg-transparent px-8 py-4 text-xl font-extrabold text-olive-dark transition-colors hover:bg-olive/10"
              >
                View stats
              </button>
            </div>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-2 px-2 text-center text-sm font-semibold text-ink-muted sm:text-base">
              <svg
                className="h-5 w-5 text-clay"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="min-w-0 max-w-full">
                Create the longest word chain in 60 seconds
              </span>
            </p>

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
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <Timer isActive={true} onTimeUp={handleTimeUp} duration={mode.time} />

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-faint">Score</p>
              <p className="font-serif text-6xl font-semibold text-clay">{currentScore}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {wordChain.length} {wordChain.length === 1 ? 'word' : 'words'} chained
              </p>
            </div>

            <WordChain words={wordChain} startWord={startWord} />

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="word-input" className="mb-2 block text-sm font-semibold text-ink-muted">
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
                  className="w-full rounded-md border-2 border-hairline bg-paper-soft px-4 py-4 text-2xl font-bold uppercase focus:border-olive focus:outline-none disabled:bg-ink/5"
                  placeholder="Type word..."
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isValidating || !currentInput.trim()}
                className="w-full rounded-md border border-olive bg-olive px-6 py-3 font-extrabold text-paper-soft transition-colors hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isValidating ? 'Checking...' : 'Add Word'}
              </button>
            </form>
          </div>
        )}

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
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      </div>
    </div>
  );
}
