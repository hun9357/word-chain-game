'use client';

import { useEffect, useState } from 'react';
import { getGameData } from '@/lib/storage';
import { computeStats, type StatsSummary } from '@/lib/stats';

interface StatsModalProps {
  onClose: () => void;
}

export default function StatsModal({ onClose }: StatsModalProps) {
  const [stats, setStats] = useState<StatsSummary | null>(null);

  useEffect(() => {
    setStats(computeStats(getGameData()));
  }, []);

  if (!stats) return null;

  const maxBucket = Math.max(1, ...stats.distribution.map((b) => b.count));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Stats</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          {[
            ['Played', stats.gamesPlayed],
            ['Streak', stats.currentStreak],
            ['Max', stats.maxStreak],
            ['Best', stats.bestScore],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-gray-600 mb-2">Score Distribution</h3>
        <div className="space-y-1 mb-6">
          {stats.distribution.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-500">{b.label}</span>
              <div
                className="bg-primary text-white text-xs text-right px-2 rounded"
                style={{ width: `${(b.count / maxBucket) * 100}%`, minWidth: '1.5rem' }}
              >
                {b.count}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-gray-600 mb-2">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1">
          {stats.last30.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.played ? ` · ${d.score}` : ''}`}
              className={`aspect-square rounded ${d.played ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
