import type { GameData } from './storage';

export interface DistributionBucket {
  label: string;
  count: number;
}

export interface CalendarDay {
  date: string; // toDateString()
  played: boolean;
  score: number;
}

export interface StatsSummary {
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number;
  averageScore: number;
  distribution: DistributionBucket[];
  last30: CalendarDay[];
}

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '0-49', min: 0, max: 49 },
  { label: '50-99', min: 50, max: 99 },
  { label: '100-149', min: 100, max: 149 },
  { label: '150+', min: 150, max: Infinity },
];

export function computeStats(data: GameData): StatsSummary {
  const scores = data.history.map((h) => h.score);
  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const distribution = BUCKETS.map((b) => ({
    label: b.label,
    count: scores.filter((s) => s >= b.min && s <= b.max).length,
  }));

  const byDate = new Map(data.history.map((h) => [h.date, h.score]));
  const last30: CalendarDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    last30.push({
      date: key,
      played: byDate.has(key),
      score: byDate.get(key) ?? 0,
    });
  }

  return {
    gamesPlayed: data.gamesPlayed,
    currentStreak: data.streak,
    maxStreak: data.maxStreak,
    bestScore: data.bestScore,
    averageScore,
    distribution,
    last30,
  };
}
