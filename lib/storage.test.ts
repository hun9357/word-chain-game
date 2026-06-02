import { describe, it, expect, beforeEach, vi } from 'vitest';

const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  });
});

import { getGameData, saveGameData, updateGameStats } from './storage';

describe('getGameData migration', () => {
  it('fills new fields when reading legacy data', () => {
    store['dailyWordChain'] = JSON.stringify({
      lastPlayedDate: 'x', streak: 3, bestScore: 90, gamesPlayed: 4,
    });
    const data = getGameData();
    expect(data.maxStreak).toBe(3);
    expect(data.history).toEqual([]);
  });
});

describe('updateGameStats', () => {
  it('appends one history entry and updates maxStreak', () => {
    const before = getGameData();
    expect(before.history.length).toBe(0);
    updateGameStats(75, 6);
    const after = getGameData();
    expect(after.history.length).toBe(1);
    expect(after.history[0].score).toBe(75);
    expect(after.history[0].wordCount).toBe(6);
    expect(after.maxStreak).toBe(1);
  });

  it('does not double-record when played twice the same day', () => {
    updateGameStats(50, 4);
    updateGameStats(80, 7);
    expect(getGameData().history.length).toBe(1);
  });
});
