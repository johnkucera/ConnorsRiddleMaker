// Connor's Riddle Maker — bright, kid-friendly palette
const purple = '#7C3AED';
const teal = '#14B8A6';
const orange = '#F97316';
const yellow = '#FACC15';
const pink = '#EC4899';

export default {
  light: {
    text: '#1E1B4B',
    textSecondary: '#6B7280',
    background: '#F8F7FF',
    card: '#FFFFFF',
    tint: purple,
    tabIconDefault: '#D1D5DB',
    tabIconSelected: purple,
    purple,
    teal,
    orange,
    yellow,
    pink,
    easy: '#22C55E',
    medium: '#F59E0B',
    tricky: '#EF4444',
  },
  dark: {
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    background: '#0F0D1A',
    card: '#1E1B4B',
    tint: '#A78BFA',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#A78BFA',
    purple: '#A78BFA',
    teal: '#2DD4BF',
    orange: '#FB923C',
    yellow: '#FDE047',
    pink: '#F472B6',
    easy: '#4ADE80',
    medium: '#FBBF24',
    tricky: '#F87171',
  },
};

export const categoryColors: Record<string, string> = {
  animals: '#F97316',
  food: '#EF4444',
  nature: '#22C55E',
  school: '#3B82F6',
  science: '#8B5CF6',
  silly: '#EC4899',
  holidays: '#F59E0B',
  sports: '#14B8A6',
  space: '#6366F1',
  math: '#06B6D4',
  words: '#A855F7',
};

export const categoryIcons: Record<string, string> = {
  animals: '🐾',
  food: '🍕',
  nature: '🌿',
  school: '📚',
  science: '🔬',
  silly: '😜',
  holidays: '🎉',
  sports: '⚽',
  space: '🚀',
  math: '🔢',
  words: '📝',
};
