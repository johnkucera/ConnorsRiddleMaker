import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import RiddleCard from '../../components/RiddleCard';
import { useRiddles } from '../../hooks/useRiddles';
import { useFavorites } from '../../hooks/useFavorites';
import { Category, Difficulty } from '../../constants/types';
import { categoryColors, categoryIcons } from '../../constants/Colors';

const DIFFICULTIES: (Difficulty | null)[] = [null, 'easy', 'medium', 'tricky'];
const DIFF_LABELS: Record<string, string> = {
  null: 'All',
  easy: 'Easy',
  medium: 'Medium',
  tricky: 'Tricky',
};
const DIFF_COLORS: Record<string, string> = {
  null: '#7C3AED',
  easy: '#22C55E',
  medium: '#F59E0B',
  tricky: '#EF4444',
};

export default function BrowseScreen() {
  const {
    riddles,
    categories,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
  } = useRiddles();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentRiddle = riddles[currentIndex];

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % riddles.length);
  }, [riddles.length]);

  const selectCategory = useCallback(
    (cat: Category | null) => {
      setCategoryFilter(cat);
      setCurrentIndex(0);
    },
    [setCategoryFilter]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Riddles</Text>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
      >
        <Pressable
          style={[
            styles.pill,
            !categoryFilter && styles.pillActive,
          ]}
          onPress={() => selectCategory(null)}
        >
          <Text style={[styles.pillText, !categoryFilter && styles.pillTextActive]}>
            All
          </Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat}
            style={[
              styles.pill,
              categoryFilter === cat && {
                backgroundColor: categoryColors[cat],
                borderColor: categoryColors[cat],
              },
            ]}
            onPress={() => selectCategory(cat)}
          >
            <Text
              style={[
                styles.pillText,
                categoryFilter === cat && styles.pillTextActive,
              ]}
            >
              {categoryIcons[cat]} {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Difficulty filter */}
      <View style={styles.diffRow}>
        {DIFFICULTIES.map(d => {
          const key = String(d);
          const active = difficultyFilter === d;
          return (
            <Pressable
              key={key}
              style={[
                styles.diffPill,
                active && { backgroundColor: DIFF_COLORS[key], borderColor: DIFF_COLORS[key] },
              ]}
              onPress={() => setDifficultyFilter(d)}
            >
              <Text style={[styles.diffText, active && { color: '#FFF' }]}>
                {DIFF_LABELS[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.countLabel}>{riddles.length} riddles</Text>

      {/* Riddle */}
      <ScrollView contentContainerStyle={styles.cardArea}>
        {currentRiddle && (
          <RiddleCard
            key={currentRiddle.id}
            riddle={currentRiddle}
            onFavorite={() => toggleFavorite(currentRiddle.id)}
            isFavorite={isFavorite(currentRiddle.id)}
          />
        )}

        <Pressable style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>Next ➡️</Text>
        </Pressable>
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
    marginBottom: 12,
  },
  pills: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  pill: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  pillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  pillTextActive: { color: '#FFF' },
  diffRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  diffPill: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF',
  },
  diffText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  countLabel: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginVertical: 4,
  },
  cardArea: { paddingBottom: 40, alignItems: 'center' },
  nextBtn: {
    backgroundColor: '#14B8A6',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 12,
  },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
