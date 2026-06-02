import { describe, it, expect } from 'vitest';
import { encodeChallenge, decodeChallenge, chainToEmoji, buildShareText } from './share';

describe('challenge encode/decode', () => {
  it('round-trips a challenge', () => {
    const code = encodeChallenge({ p: 123, s: 142, n: 'James' });
    expect(decodeChallenge(code)).toEqual({ p: 123, s: 142, n: 'James' });
  });

  it('round-trips without a nickname', () => {
    const code = encodeChallenge({ p: 7, s: 50 });
    expect(decodeChallenge(code)).toEqual({ p: 7, s: 50 });
  });

  it('produces a URL-safe code (no +, /, =)', () => {
    const code = encodeChallenge({ p: 999, s: 9999, n: 'a/b+c=' });
    expect(code).not.toMatch(/[+/=]/);
  });

  it('returns null for malformed input', () => {
    expect(decodeChallenge('!!!not-base64!!!')).toBeNull();
    expect(decodeChallenge('')).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    const code = encodeChallenge({ p: 1, s: 1 });
    // tamper: decode something that is valid base64 but wrong shape
    expect(decodeChallenge(btoa('{"x":1}').replace(/=+$/, ''))).toBeNull();
  });
});

describe('chainToEmoji', () => {
  it('uses one tile per letter, grouped per word by space', () => {
    // 'CAT'(3) 'TABLE'(5) -> yellow x3, green x5
    expect(chainToEmoji(['CAT', 'TABLE'])).toBe('🟨🟨🟨 🟩🟩🟩🟩🟩');
  });

  it('uses blue for long words (7+)', () => {
    expect(chainToEmoji(['ELEPHANT'])).toBe('🟦🟦🟦🟦🟦🟦🟦🟦');
  });
});

describe('buildShareText', () => {
  it('includes puzzle number, counts, score and link but not the words', () => {
    const text = buildShareText({
      puzzleNo: 123, words: ['CAT', 'TABLE'], score: 142, streak: 5,
      url: 'https://dailywordchain.com/c/abc',
    });
    expect(text).toContain('Word Chain #123');
    expect(text).toContain('142');
    expect(text).toContain('https://dailywordchain.com/c/abc');
    expect(text).not.toContain('CAT');
    expect(text).not.toContain('TABLE');
  });
});
