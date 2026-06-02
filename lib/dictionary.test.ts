import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDefinition } from './dictionary';

beforeEach(() => {
  vi.restoreAllMocks();
});

const oceanResponse = [
  {
    word: 'ocean',
    meanings: [
      { partOfSpeech: 'noun', definitions: [{ definition: 'a large body of salt water' }] },
    ],
  },
];

describe('getDefinition', () => {
  it('formats partOfSpeech and first definition', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => oceanResponse })));
    expect(await getDefinition('ocean')).toBe('noun — a large body of salt water');
  });

  it('returns null on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await getDefinition('zzqqx')).toBeNull();
  });

  it('caches results (second call does not refetch)', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => oceanResponse }));
    vi.stubGlobal('fetch', fetchMock);
    await getDefinition('cachetest');
    await getDefinition('cachetest');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
