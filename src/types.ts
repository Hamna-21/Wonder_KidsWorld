/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Story {
  id: string;
  title: string;
  category: string; // Fairy Tales, Adventure Stories, Bedtime Stories, Science Stories, etc.
  ageGroup: string; // "3-5 years" | "6-8 years" | "9-12 years"
  coverUrl: string; // fallback illustration emoji/svg or visual
  summary: string;
  pages: StoryPage[];
  audioNarrations?: string[]; // TTS base64 or prebaked text for narration helper
  author: string;
  isCustom?: boolean;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustration: string; // SVG description, emoji, or icon
}

export interface AudioBook {
  id: string;
  title: string;
  category: string;
  duration: string;
  narrator: string;
  coverEmoji: string;
  coverBg: string;
  summary: string;
  chapters: { title: string; text: string }[];
}

export interface CartoonVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl: string; // Safe mock player or inline animation stream
  rating: string;
  views: string;
  category: string;
  thumbnailEmoji: string;
  thumbnailBg: string;
  description: string;
  ageGroup?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

export interface Poem {
  id: string;
  title: string;
  category: string;
  lyrics: string[];
  audioTimerMs: number; // Duration per line for high-contrast karaoke highlighting
  emoji: string;
  colorBg: string;
}

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface PuzzleTheme {
  id: string;
  name: string;
  emoji: string;
  color: string;
  pieces: string[]; // Grid items to click/tap in sorted order or shuffle match
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  dateEarned?: string;
}

export interface ParentConfig {
  parentPin: string;
  screenTimeLimitMinutes: number;
  enableBedtimeMode: boolean;
  bedtimeStartHour: number; // 24h
  bedtimeStartMinute: number;
  blockCategoryList: string[];
  childName: string;
  childAge: number;
}

export interface DailyChallenge {
  wordOfTheDay: { word: string; meaning: string; sentence: string };
  funFact: string;
  riddle: { question: string; answer: string; hint: string };
}
