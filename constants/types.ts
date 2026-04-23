export interface Riddle {
  id: string;
  question: string;
  answer: string;
  hints: string[];
  distractors: string[];
  category: Category;
  style: RiddleStyle;
  difficulty: Difficulty;
  emoji?: string;
}

export type Category =
  | 'animals' | 'food' | 'nature' | 'school' | 'science'
  | 'silly' | 'holidays' | 'sports' | 'space' | 'math' | 'words';

export type RiddleStyle =
  | 'what-am-i' | 'wordplay' | 'rhyming' | 'lateral' | 'math' | 'trivia';

export type Difficulty = 'easy' | 'medium' | 'tricky';
