import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Riddle } from '../constants/types';
import { categoryColors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 400;

interface Props {
  riddle: Riddle;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export default function RiddleCard({ riddle, onFavorite, isFavorite }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const flip = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360], Extrapolation.CLAMP)}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const handlePress = useCallback(() => {
    if (!revealed) {
      flip.value = withSpring(1, { damping: 15, stiffness: 100 });
      setRevealed(true);
    } else {
      flip.value = withSpring(0, { damping: 15, stiffness: 100 });
      setRevealed(false);
      setHintsShown(0);
    }
  }, [revealed, flip]);

  const showHint = useCallback(() => {
    if (hintsShown < riddle.hints.length) {
      setHintsShown(h => h + 1);
    }
  }, [hintsShown, riddle.hints.length]);

  const accentColor = categoryColors[riddle.category] ?? '#7C3AED';
  const diffColor =
    riddle.difficulty === 'easy' ? '#22C55E' :
    riddle.difficulty === 'medium' ? '#F59E0B' : '#EF4444';

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress}>
        {/* Front — Question */}
        <Animated.View style={[styles.card, { borderColor: accentColor }, frontStyle]}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{riddle.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: diffColor }]}>
              <Text style={styles.badgeText}>{riddle.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.questionMark}>❓</Text>
          <Text style={styles.question}>{riddle.question}</Text>

          {/* Hints */}
          {hintsShown > 0 && (
            <View style={styles.hintsBox}>
              {riddle.hints.slice(0, hintsShown).map((h, i) => (
                <Text key={i} style={styles.hintText}>
                  💡 {h}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.bottomRow}>
            {hintsShown < riddle.hints.length && (
              <Pressable
                style={[styles.hintBtn, { borderColor: accentColor }]}
                onPress={(e) => { e.stopPropagation(); showHint(); }}
              >
                <Text style={[styles.hintBtnText, { color: accentColor }]}>
                  Show Hint {hintsShown + 1}
                </Text>
              </Pressable>
            )}
            <Text style={styles.tapHint}>Tap to reveal answer</Text>
          </View>
        </Animated.View>

        {/* Back — Answer */}
        <Animated.View style={[styles.card, styles.cardBack, { borderColor: accentColor, backgroundColor: accentColor }, backStyle]}>
          <Text style={styles.answerLabel}>Answer</Text>
          <Text style={styles.answerEmoji}>{riddle.emoji}</Text>
          <Text style={styles.answer}>{riddle.answer}</Text>
          <Text style={styles.tapHintBack}>Tap to flip back</Text>
        </Animated.View>
      </Pressable>

      {onFavorite && (
        <Pressable style={styles.heartBtn} onPress={onFavorite}>
          <Text style={styles.heart}>{isFavorite ? '❤️' : '🤍'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 10 },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  questionMark: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 8,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E1B4B',
    textAlign: 'center',
    lineHeight: 28,
    flex: 1,
  },
  hintsBox: {
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  bottomRow: {
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  hintBtn: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hintBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  tapHint: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  answerEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  answer: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  tapHintBack: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 20,
  },
  heartBtn: {
    position: 'absolute',
    top: 16,
    right: 32,
    zIndex: 10,
  },
  heart: {
    fontSize: 28,
  },
});
