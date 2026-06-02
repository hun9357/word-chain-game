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

type GameState = 'pre-game' | 'playing' | 'finished';

export default function WordChainGame({ challenge }: { challenge?: Challenge }) {
  const [gameState, setGameState] = useState<GameState>('pre-game');
  const [startWord, setStartWord] = useState('');
  const [wordChain, setWordChain] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
      challenge ? challenge.p : getPuzzleNumber()
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-paper border border-hairline rounded-lg shadow-sm p-6 sm:p-8">
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

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Timer */}
            <Timer isActive={true} onTimeUp={handleTimeUp} />

            {/* Current Score */}
            <div className="text-center">
              <p className="text-xs tracking-[0.15em] uppercase text-ink-faint font-semibold">Score</p>
              <p className="font-serif text-5xl font-semibold text-ink">{currentScore}</p>
              <p className="text-sm text-ink-muted mt-1">
                {wordChain.length} {wordChain.length === 1 ? 'word' : 'words'} chained
              </p>
            </div>

            {/* Word Chain Display */}
            <WordChain words={wordChain} startWord={startWord} />

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
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
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isValidating || !currentInput.trim()}
                className="w-full bg-ink text-paper font-semibold py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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
          />
        )}
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      </div>
    </div>
  );
}
