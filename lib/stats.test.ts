import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';
import type { GameData } from './storage';

const data: GameData = {
  lastPlayedDate: 'x',
  streak: 2,
  bestScore: 142,
  gamesPlayed: 3,
  maxStreak: 5,
  history: [
    { date: 'a', puzzleNo: 1, score: 50, wordCount: 4 },
    { date: 'b', puzzleNo: 2, score: 100, wordCount: 8 },
    { date: 'c', puzzleNo: 3, score: 142, wordCount: 11 },
  ],
};

describe('computeStats', () => {
  it('reports core aggregates', () => {
    const s = computeStats(data);
    expect(s.gamesPlayed).toBe(3);
    expect(s.currentStreak).toBe(2);
    expect(s.maxStreak).toBe(5);
    expect(s.bestScore).toBe(142);
    expect(s.averageScore).toBe(97); // round((50+100+142)/3)
  });

  it('buckets scores into a distribution that sums to games played', () => {
    const s = computeStats(data);
    const total = s.distribution.reduce((n, b) => n + b.count, 0);
    expect(total).toBe(3);
  });

  it('returns a 30-entry calendar window', () => {
    const s = computeStats(data);
    expect(s.last30.length).toBe(30);
  });

  it('handles empty history without dividing by zero', () => {
    const empty: GameData = { ...data, gamesPlayed: 0, history: [] };
    const s = computeStats(empty);
    expect(s.averageScore).toBe(0);
  });
});
