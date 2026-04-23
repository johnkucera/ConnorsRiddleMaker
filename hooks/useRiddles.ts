import { useMemo, useState, useCallback } from 'react';
import riddlesData from '../data/riddles.json';
import { Riddle, Category, Difficulty } from '../constants/types';

const allRiddles = riddlesData as Riddle[];

export function useRiddles() {
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(null);

  const filtered = useMemo(() => {
    let result = allRiddles;
    if (categoryFilter) result = result.filter(r => r.category === categoryFilter);
    if (difficultyFilter) result = result.filter(r => r.difficulty === difficultyFilter);
    return result;
  }, [categoryFilter, difficultyFilter]);

  const getRandomRiddle = useCallback(
    (exclude?: string[]) => {
      const pool = exclude
        ? filtered.filter(r => !exclude.includes(r.id))
        : filtered;
      if (pool.length === 0) return filtered[0] ?? allRiddles[0];
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [filtered]
  );

  const getDailyRiddle = useCallback(() => {
    const today = new Date();
    const dayIndex =
      (today.getFullYear() * 1000 + today.getMonth() * 32 + today.getDate()) %
      allRiddles.length;
    return allRiddles[dayIndex];
  }, []);

  const getRiddleById = useCallback((id: string) => {
    return allRiddles.find(r => r.id === id) ?? null;
  }, []);

  const categories = useMemo(
    () => [...new Set(allRiddles.map(r => r.category))].sort() as Category[],
    []
  );

  return {
    riddles: filtered,
    allRiddles,
    categories,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    getRandomRiddle,
    getDailyRiddle,
    getRiddleById,
    totalCount: allRiddles.length,
  };
}
