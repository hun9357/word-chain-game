const STORAGE_KEY = 'dailyWordChain';

export interface GameData {
  lastPlayedDate: string;
  streak: number;
  bestScore: number;
  gamesPlayed: number;
}

/**
 * Get game data from localStorage
 */
export function getGameData(): GameData {
  if (typeof window === 'undefined') {
    return { lastPlayedDate: '', streak: 0, bestScore: 0, gamesPlayed: 0 };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { lastPlayedDate: '', streak: 0, bestScore: 0, gamesPlayed: 0 };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return { lastPlayedDate: '', streak: 0, bestScore: 0, gamesPlayed: 0 };
  }
}

/**
 * Save game data to localStorage
 */
export function saveGameData(data: GameData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Update streak and best score after a game
 */
export function updateGameStats(score: number): { streak: number; isNewBest: boolean } {
  const today = new Date().toDateString();
  const data = getGameData();

  // Check if already played today
  if (data.lastPlayedDate === today) {
    return { streak: data.streak, isNewBest: false };
  }

  // Calculate streak
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
