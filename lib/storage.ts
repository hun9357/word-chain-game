import { getPuzzleNumber } from './words';

const STORAGE_KEY = 'dailyWordChain';

export interface HistoryEntry {
  date: string;
  puzzleNo: number;
  score: number;
  wordCount: number;
}

export interface GameData {
  lastPlayedDate: string;
  streak: number;
  bestScore: number;
  gamesPlayed: number;
  maxStreak: number;
  history: HistoryEntry[];
}

const EMPTY_DATA: GameData = {
  lastPlayedDate: '', streak: 0, bestScore: 0, gamesPlayed: 0, maxStreak: 0, history: [],
};

/**
 * Get game data from localStorage
 */
export function getGameData(): GameData {
  if (typeof localStorage === 'undefined') {
    return { ...EMPTY_DATA };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...EMPTY_DATA };
    const parsed = JSON.parse(data) as Partial<GameData>;
    return {
      ...EMPTY_DATA,
      ...parsed,
      maxStreak: parsed.maxStreak ?? parsed.streak ?? 0,
      history: parsed.history ?? [],
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return { ...EMPTY_DATA };
  }
}

/**
 * Save game data to localStorage
 */
export function saveGameData(data: GameData): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Update streak and best score after a game
 */
export function updateGameStats(
  score: number,
  wordCount: number,
  puzzleNo: number = getPuzzleNumber()
): { streak: number; isNewBest: boolean } {
  const today = new Date().toDateString();
  const data = getGameData();

  if (data.lastPlayedDate === today) {
    return { streak: data.streak, isNewBest: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = data.lastPlayedDate === yesterday.toDateString();

  const newStreak = wasYesterday ? data.streak + 1 : 1;
  const isNewBest = score > data.bestScore;

  saveGameData({
    lastPlayedDate: today,
    streak: newStreak,
    bestScore: isNewBest ? score : data.bestScore,
    gamesPlayed: data.gamesPlayed + 1,
    maxStreak: Math.max(data.maxStreak, newStreak),
    history: [
      ...data.history,
      { date: today, puzzleNo, score, wordCount },
    ],
  });

  return { streak: newStreak, isNewBest };
}

/**
 * Check if user has already played today
 */
export function hasPlayedToday(): boolean {
  const today = new Date().toDateString();
  const data = getGameData();
  return data.lastPlayedDate === today;
}
