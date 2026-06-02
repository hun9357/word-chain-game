export interface Challenge {
  p: number; // puzzle number
  s: number; // challenger score
  n?: string; // challenger nickname (optional, max 16 chars)
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
  return b64urlEncode(JSON.stringify(clean));
}

export function decodeChallenge(code: string): Challenge | null {
  if (!code) return null;
  try {
    const obj = JSON.parse(b64urlDecode(code));
    if (typeof obj?.p !== 'number' || typeof obj?.s !== 'number') return null;
    const result: Challenge = { p: obj.p, s: obj.s };
    if (typeof obj.n === 'string') result.n = obj.n.slice(0, 16);
    return result;
  } catch {
    return null;
  }
}
