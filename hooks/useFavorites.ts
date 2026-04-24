import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from './storage';

const STORAGE_KEY = 'favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getItem(STORAGE_KEY).then(data => {
      if (data) setFavorites(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = favorites.includes(id)
        ? favorites.filter(f => f !== id)
        : [...favorites, id];
      persist(next);
    },
    [favorites, persist]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, loaded };
}
