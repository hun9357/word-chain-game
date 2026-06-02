import { describe, it, expect } from 'vitest';
import {
  getPuzzleNumber,
  getWordByPuzzleNumber,
  DAILY_WORDS,
  LAUNCH_EPOCH_UTC,
} from './words';

describe('getPuzzleNumber', () => {
  it('returns 1 on the launch day (UTC)', () => {
    const launchDay = new Date(LAUNCH_EPOCH_UTC);
    expect(getPuzzleNumber(launchDay)).toBe(1);
  });

  it('increments by 1 each UTC day', () => {
    const day = new Date(LAUNCH_EPOCH_UTC + 10 * 86400000);
    expect(getPuzzleNumber(day)).toBe(11);
  });

  it('is stable across times within the same UTC day', () => {
    const morning = new Date(LAUNCH_EPOCH_UTC + 5 * 86400000 + 1000);
    const evening = new Date(LAUNCH_EPOCH_UTC + 5 * 86400000 + 23 * 3600000);
    expect(getPuzzleNumber(morning)).toBe(getPuzzleNumber(evening));
  });
});

describe('getWordByPuzzleNumber', () => {
  it('returns the first word for puzzle #1', () => {
    expect(getWordByPuzzleNumber(1)).toBe(DAILY_WORDS[0]);
  });

  it('wraps around past the end of the list', () => {
    expect(getWordByPuzzleNumber(DAILY_WORDS.length + 1)).toBe(DAILY_WORDS[0]);
  });

  it('handles puzzle numbers below 1 without crashing', () => {
    expect(typeof getWordByPuzzleNumber(0)).toBe('string');
  });
});
