# Connor's Riddle Maker - Project Plan

## Overview

A fun, colorful iOS app for Connor (ages 6-12) built with React Native + Expo. Ships with 1,000 pre-generated riddles across categories and difficulty levels — no on-demand AI needed. The riddle pack is bulk-generated at build time using Claude, ensuring variety in style, topic, and difficulty without the repetition problem of live AI generation. Test on your phone instantly via Expo Go.

---

## Target Audience

- **Primary:** Kids ages 6-12 (Connor!)
- **Tone:** Playful, encouraging, colorful
- **Reading level:** Simple language, big text, visual hints

---

## Core Features

### Phase 1 - MVP

1. **1,000-Riddle Library**
   - Bulk-generated via Claude at build time using a generation script
   - Script generates in batches (~50 at a time) with explicit diversity constraints: vary style (rhyming, "what am I?", wordplay, lateral thinking), category, and difficulty
   - Each batch prompt includes previously generated riddles to avoid duplicates
   - Human review pass + de-duplication before shipping
   - Stored as a static JSON file bundled with the app — no network needed

2. **Riddle Card UI**
   - Swipeable riddle cards with fun emoji hints
   - Tap to reveal the answer (flip animation)
   - "Next Riddle" button — random or sequential mode

3. **Difficulty Levels**
   - Easy / Medium / Tricky
   - Each riddle tagged with difficulty so Connor can ramp up

4. **Categories**
   - Browse riddles by topic (animals, food, nature, school, holidays, silly, science, sports, space)
   - Category icons with bright, kid-friendly colors

5. **Favorites**
   - Heart button to save favorite riddles
   - Favorites screen to revisit saved riddles

6. **Daily Riddle**
   - One featured riddle per day on the home screen
   - Streak counter for consecutive days played

### Phase 2 - Quiz & Polish

7. **Riddle Quiz Mode**
   - Multiple-choice quiz: read the riddle, pick from 4 answers
   - Score tracking with fun animations (confetti, stars)

8. **Hint System**
   - Each riddle has 1-2 progressive hints (generated alongside the riddle)
   - Tap to reveal hints before seeing the answer

9. **Sound Effects & Animations**
   - Fun tap sounds, reveal animations
   - Celebration animations for correct quiz answers
   - Optional — can be toggled off

10. **Share a Riddle**
    - Share a riddle as text or image card to Messages, etc.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React Native + Expo (SDK 52+) | Fast iteration, Expo Go for instant phone testing |
| **Language** | TypeScript | Type safety, better DX |
| **Navigation** | Expo Router (file-based) | Simple, convention-based routing |
| **Local Storage** | AsyncStorage + JSON | Simple for a riddle collection, no server needed |
| **Riddle Generation** | Claude API via Node.js script | Bulk-generate 1,000 riddles at build time, not runtime |
| **Styling** | NativeWind (Tailwind for RN) or StyleSheet | Rapid UI development |
| **Animations** | React Native Reanimated + Lottie | Smooth card flips, celebrations |
| **Icons/Assets** | Expo Vector Icons + custom emoji art | Kid-friendly visuals |

---

## Project Structure

```
ConnorsRiddleMaker/
  app/                    # Expo Router screens
    (tabs)/
      index.tsx           # Home - Daily Riddle
      browse.tsx          # Browse by category
      favorites.tsx       # Saved riddles
      quiz.tsx            # Quiz mode (Phase 2)
    riddle/[id].tsx       # Individual riddle detail
    _layout.tsx           # Root layout with tab navigation
  assets/                 # Images, Lottie animations, fonts
  components/
    RiddleCard.tsx        # Flip card component
    CategoryPicker.tsx    # Category selection grid
    DifficultyBadge.tsx   # Easy/Medium/Tricky badge
    HintButton.tsx        # Progressive hint reveal
    StreakCounter.tsx      # Daily streak display
  data/
    riddles.json          # 1,000 pre-generated riddles (static, bundled)
    categories.ts         # Category definitions & icons
  hooks/
    useRiddles.ts         # Riddle fetching & filtering logic
    useFavorites.ts       # Favorites persistence
    useStreak.ts          # Daily streak tracking
    useQuiz.ts            # Quiz state management (Phase 2)
  lib/
    storage.ts            # AsyncStorage helpers
  scripts/
    generate-riddles.ts   # Claude API batch generation script
    dedupe-riddles.ts     # Post-generation de-duplication & QA
  constants/
    theme.ts              # Colors, fonts, spacing
```

---

## Riddle Data Schema

```typescript
interface Riddle {
  id: string;
  question: string;
  answer: string;
  hints: string[];          // 1-2 progressive hints
  distractors: string[];    // 3 wrong answers for quiz mode (generated alongside riddle)
  category: Category;
  difficulty: 'easy' | 'medium' | 'tricky';
  style: RiddleStyle;       // Variety tracking
  emoji?: string;           // Visual hint emoji
}

type RiddleStyle =
  | 'what-am-i'       // "I have hands but can't clap. What am I?"
  | 'wordplay'        // Puns, double meanings
  | 'rhyming'         // Riddle in verse
  | 'lateral'         // Thinking outside the box
  | 'math'            // Simple number puzzles
  | 'trivia';         // Fun fact riddles

type Category =
  | 'animals'
  | 'food'
  | 'nature'
  | 'school'
  | 'science'
  | 'silly'
  | 'holidays'
  | 'sports'
  | 'space'
  | 'math'
  | 'words';
```

---

## UI Design Direction

- **Color palette:** Bright primary colors - purple, teal, orange, yellow
- **Typography:** Large, rounded, kid-friendly font (e.g., Nunito or Baloo)
- **Cards:** Rounded corners, soft shadows, playful gradients
- **Interactions:** Bouncy animations, satisfying taps, confetti on success
- **Mascot idea:** A friendly owl or fox character that presents riddles

---

## Build & Deploy Plan

1. **Development:** `npx create-expo-app` with TypeScript template
2. **Testing on phone:** Expo Go app on iPhone - scan QR code to load instantly
3. **Later (optional):** EAS Build for standalone app / TestFlight distribution

---

## Build Steps

This is a Claude Code-assisted build — most of this is generated code and data. The steps below represent what we actually need to do together, not calendar days.

### Step 0: Generate the riddle pack
- Write the `scripts/generate-riddles.ts` batch generation script
- Run it against Claude API to produce 1,000 riddles as JSON
- De-duplicate, validate schema, spot-check quality
- Output: `data/riddles.json` ready to bundle

### Step 1: Scaffold the app
- `npx create-expo-app` with TypeScript + Expo Router
- Set up tab navigation (Home, Browse, Favorites)
- Define theme constants (colors, fonts, spacing)

### Step 2: Core riddle experience
- Load `riddles.json`, wire up `useRiddles` hook with filtering
- Build `RiddleCard` with flip animation (tap to reveal answer)
- Category browse screen with grid picker
- Difficulty filter

### Step 3: Favorites, daily riddle, streaks
- AsyncStorage-backed favorites with heart toggle
- Daily riddle selection (deterministic by date)
- Streak counter on home screen

### Step 4: Quiz mode + hints
- Multiple-choice quiz flow with generated distractors
- Hint reveal buttons
- Score tracking + celebration animations

### Step 5: Polish
- Sound effects, sharing, final UI pass
- Test on phone via Expo Go, fix any issues

---

## Open Questions

- [ ] Does Connor have a favorite animal/character for the app mascot?
- [ ] Any specific riddle categories Connor would love?
- [ ] Apple Developer account status? (Expo Go needs no account, but standalone install does)
