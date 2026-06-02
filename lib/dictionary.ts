/**
 * Validate word using Free Dictionary API
 * Returns true if word exists, false otherwise
 */
export async function validateWord(word: string): Promise<boolean> {
  if (!word || word.length < 2) return false;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
      { cache: 'force-cache' } // Cache successful validations
    );

    return response.ok;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return false;
  }
}

/**
 * Check if a word can chain with the previous word
 * Next word must start with the last letter of previous word
 */
export function canChain(previousWord: string, nextWord: string): boolean {
  if (!previousWord || !nextWord) return false;

  const lastLetter = previousWord[previousWord.length - 1].toLowerCase();
  const firstLetter = nextWord[0].toLowerCase();

  return lastLetter === firstLetter;
}

/**
 * Calculate score for a word chain
 * Score = number of words + total character count bonus
 */
export function calculateScore(words: string[]): number {
  const wordCount = words.length;
  const charBonus = words.reduce((sum, word) => sum + word.length, 0);

  return wordCount * 10 + charBonus;
}

/**
 * Fetch a human-readable definition for a word, cached in-memory.
 * Returns "{partOfSpeech} — {definition}" or null when unavailable.
 */
const definitionCache = new Map<string, string | null>();

export async function getDefinition(word: string): Promise<string | null> {
  const key = word.toLowerCase();
  if (definitionCache.has(key)) return definitionCache.get(key) ?? null;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${key}`,
      { cache: 'force-cache' }
    );
    if (!response.ok) {
      definitionCache.set(key, null);
      return null;
    }
    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const meaning = entry?.meanings?.[0];
    const definition = meaning?.definitions?.[0]?.definition;
    if (!definition) {
      definitionCache.set(key, null);
      return null;
    }
    const result = meaning?.partOfSpeech
      ? `${meaning.partOfSpeech} — ${definition}`
      : definition;
    definitionCache.set(key, result);
    return result;
  } catch (error) {
    console.error('Definition fetch error:', error);
    definitionCache.set(key, null);
    return null;
  }
}
