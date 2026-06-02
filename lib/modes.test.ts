import { describe, it, expect } from 'vitest';
import { DEFAULT_MODE, modeLabel, isDefaultMode, TIME_OPTIONS, DIFFICULTY_OPTIONS } from './modes';

describe('modes', () => {
  it('default mode is 60s / 2+', () => {
    expect(DEFAULT_MODE).toEqual({ time: 60, minLen: 2 });
  });
  it('modeLabel formats time and min length', () => {
    expect(modeLabel({ time: 30, minLen: 4 })).toBe('30s · 4+');
  });
  it('isDefaultMode true only for the default', () => {
    expect(isDefaultMode({ time: 60, minLen: 2 })).toBe(true);
    expect(isDefaultMode({ time: 30, minLen: 2 })).toBe(false);
  });
  it('exposes selectable options', () => {
    expect(TIME_OPTIONS).toEqual([30, 60, 120]);
    expect(DIFFICULTY_OPTIONS.map((d) => d.minLen)).toEqual([2, 3, 4]);
  });
});
