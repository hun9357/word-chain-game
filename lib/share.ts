import { modeLabel, type Mode } from './modes';

export interface Challenge {
  p: number; // puzzle number
  s: number; // challenger score
  n?: string; // challenger nickname (optional, max 16 chars)
  t?: number; // mode time in seconds (omitted when default 60)
  m?: number; // mode min word length (omitted when default 2)
}

function b64urlEncode(input: string): string {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeChallenge(c: Challenge): string {
  const clean: Challenge = { p: c.p, s: c.s };
  if (c.n) clean.n = c.n.slice(0, 16);
  if (typeof c.t === 'number' && c.t !== 60) clean.t = c.t;
  if (typeof c.m === 'number' && c.m !== 2) clean.m = c.m;
  return b64urlEncode(JSON.stringify(clean));
}

export function decodeChallenge(code: string): Challenge | null {
  if (!code) return null;
  try {
    const obj = JSON.parse(b64urlDecode(code));
    if (typeof obj?.p !== 'number' || typeof obj?.s !== 'number') return null;
    const result: Challenge = { p: obj.p, s: obj.s };
    if (typeof obj.n === 'string') result.n = obj.n.slice(0, 16);
    if (typeof obj.t === 'number') result.t = obj.t;
    if (typeof obj.m === 'number') result.m = obj.m;
    return result;
  } catch {
    return null;
  }
}

/**
 * Spoiler-free emoji rendering: one tile per letter, colored by word length.
 * 2-3 letters = 🟨, 4-6 = 🟩, 7+ = 🟦. Words separated by spaces.
 */
export function chainToEmoji(words: string[]): string {
  const tileFor = (len: number) => (len >= 7 ? '🟦' : len >= 4 ? '🟩' : '🟨');
  return words
    .map((w) => tileFor(w.length).repeat(w.length))
    .join(' ');
}

export function buildShareText(opts: {
  puzzleNo: number;
  words: string[];
  score: number;
  streak: number;
  url: string;
  mode?: Mode;
}): string {
  const { puzzleNo, words, score, streak, url, mode } = opts;
  const streakLine = streak > 1 ? ` · 🔥 ${streak}` : '';
  const modeText = mode ? ` · ${modeLabel(mode)}` : '';
  return `Word Chain #${puzzleNo}${modeText}
🔗 ${words.length} words · ${score} pts${streakLine}

${chainToEmoji(words)}

play → ${url}

#DailyWordChain`;
}
