import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import RiddleCard from '../../components/RiddleCard';
import { useRiddles } from '../../hooks/useRiddles';
import { useFavorites } from '../../hooks/useFavorites';

export default function FavoritesScreen() {
  const { getRiddleById } = useRiddles();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const favoriteRiddles = favorites
    .map(id => getRiddleById(id))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>
        {favorites.length === 0
          ? 'Tap the heart on any riddle to save it here!'
          : `${favorites.length} saved riddle${favorites.length === 1 ? '' : 's'}`}
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {favoriteRiddles.map(
          riddle =>
            riddle && (
              <RiddleCard
                key={riddle.id}
                riddle={riddle}
                onFavorite={() => toggleFavorite(riddle.id)}
                isFavorite={isFavorite(riddle.id)}
              />
            )
        )}

        {favorites.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyText}>
              No favorites yet!{'\n'}Go find some riddles you love.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF', paddingTop: 60 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B4B',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  list: { paddingBottom: 40 },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
