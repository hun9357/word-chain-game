'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  isActive: boolean;
  onTimeUp: () => void;
  duration?: number; // seconds
}

export default function Timer({ isActive, onTimeUp, duration = 60 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, duration]);

  const percentage = (timeLeft / duration) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Time</span>
        <span
          className={`text-2xl font-bold ${
            isLowTime ? 'text-red-500 animate-pulse' : 'text-gray-900'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isLowTime ? 'bg-red-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
