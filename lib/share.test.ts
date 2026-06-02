import { describe, it, expect } from 'vitest';
import { encodeChallenge, decodeChallenge } from './share';

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
