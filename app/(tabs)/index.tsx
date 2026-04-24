import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import RiddleCard from '../../components/RiddleCard';
import { useRiddles } from '../../hooks/useRiddles';
import { useFavorites } from '../../hooks/useFavorites';
import { useStreak } from '../../hooks/useStreak';
import { Riddle } from '../../constants/types';

export default function HomeScreen() {
  const { getDailyRiddle, getRandomRiddle, totalCount } = useRiddles();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { streak, recordToday } = useStreak();

  const dailyRiddle = getDailyRiddle();
  const [history, setHistory] = useState<Riddle[]>([dailyRiddle]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentRiddle = history[historyIndex];
  const canGoBack = historyIndex > 0;

  const nextRiddle = useCallback(() => {
    recordToday();
    const seenIds = history.map(r => r.id);
    const next = getRandomRiddle(seenIds);

    // If we're in the middle of history, truncate forward and add new
    const newHistory = [...history.slice(0, historyIndex + 1), next];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [getRandomRiddle, history, historyIndex, recordToday]);

  const prevRiddle = useCallback(() => {
    if (canGoBack) setHistoryIndex(i => i - 1);
  }, [canGoBack]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Connor's{'\n'}Riddle Maker</Text>
        <View style={styles.streakBox}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <RiddleCard
        key={currentRiddle.id}
        riddle={currentRiddle}
        onFavorite={() => toggleFavorite(currentRiddle.id)}
        isFavorite={isFavorite(currentRiddle.id)}
      />

      {/* Next button */}
      <Pressable style={styles.nextBtn} onPress={nextRiddle}>
        <Text style={styles.nextBtnText}>Next Riddle 🎲</Text>
      </Pressable>

      {/* Previous button — always rendered to prevent layout jump */}
      <Pressable
        style={[styles.prevBtn, !canGoBack && styles.prevBtnHidden]}
        onPress={prevRiddle}
        disabled={!canGoBack}
      >
        <Text style={styles.prevBtnText}>← Previous Riddle</Text>
      </Pressable>

      <Text style={styles.counter}>{totalCount} riddles loaded</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1E1B4B', lineHeight: 34 },
  streakBox: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 12,
    minWidth: 70,
  },
  streakEmoji: { fontSize: 24 },
  streakNum: { fontSize: 24, fontWeight: '800', color: '#92400E' },
  streakLabel: { fontSize: 10, color: '#92400E', fontWeight: '600' },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  prevBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 14,
  },
  prevBtnHidden: {
    opacity: 0,
  },
  prevBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  counter: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 16 },
});
