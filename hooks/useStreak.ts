import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './storage';

const STORAGE_KEY = 'streak';

interface StreakData {
  current: number;
  lastDate: string; // YYYY-MM-DD
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, lastDate: '' });

  useEffect(() => {
    getItem(STORAGE_KEY).then(data => {
      if (data) setStreak(JSON.parse(data));
    });
  }, []);

  const recordToday = useCallback(() => {
    const today = todayStr();
    if (streak.lastDate === today) return streak.current;

    const yesterday = yesterdayStr();
    const next: StreakData =
      streak.lastDate === yesterday
        ? { current: streak.current + 1, lastDate: today }
        : { current: 1, lastDate: today };

    setStreak(next);
    setItem(STORAGE_KEY, JSON.stringify(next));
    return next.current;
  }, [streak]);

  const playedToday = streak.lastDate === todayStr();

  return { streak: streak.current, playedToday, recordToday };
}
