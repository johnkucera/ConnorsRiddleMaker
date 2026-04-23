import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import RiddleCard from '../../components/RiddleCard';
import { useRiddles } from '../../hooks/useRiddles';
import { useFavorites } from '../../hooks/useFavorites';
import { useStreak } from '../../hooks/useStreak';

export default function HomeScreen() {
  const { getDailyRiddle, getRandomRiddle, totalCount } = useRiddles();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { streak, recordToday } = useStreak();

  const dailyRiddle = getDailyRiddle();
  const [randomRiddle, setRandomRiddle] = useState(() => getRandomRiddle([dailyRiddle.id]));
  const [showDaily, setShowDaily] = useState(true);
  const [seenIds, setSeenIds] = useState<string[]>([dailyRiddle.id]);

  const currentRiddle = showDaily ? dailyRiddle : randomRiddle;

  const nextRiddle = useCallback(() => {
    recordToday();
    const next = getRandomRiddle(seenIds);
    setSeenIds(prev => [...prev, next.id]);
    setRandomRiddle(next);
    setShowDaily(false);
  }, [getRandomRiddle, seenIds, recordToday]);

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

      {showDaily && (
        <View style={styles.dailyBadge}>
          <Text style={styles.dailyText}>⭐ Today's Riddle</Text>
        </View>
      )}

      <RiddleCard
        key={currentRiddle.id}
        riddle={currentRiddle}
        onFavorite={() => toggleFavorite(currentRiddle.id)}
        isFavorite={isFavorite(currentRiddle.id)}
      />

      <Pressable style={styles.nextBtn} onPress={nextRiddle}>
        <Text style={styles.nextBtnText}>Next Riddle 🎲</Text>
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
  dailyBadge: {
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 8,
  },
  dailyText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  counter: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 12 },
});
