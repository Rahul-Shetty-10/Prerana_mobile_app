/**
 * wordGames.ts
 *
 * TypeScript types for the `puzzle` resource returned by:
 *   GET /api/mobile/v1/student/chapter-resources?subjectId={id}&chapterId={id}
 *
 * Resource shape inside the resources[] array:
 *   { "title": "Chapter Word Games", "type": "puzzle", "payload": { ... } }
 *
 * ALL field names and shapes are confirmed from the live backend response
 * (General Science → Chapter 1: Chemical Reactions and Equations).
 * No fields have been invented or guessed.
 */

// ─── Crossword ───────────────────────────────────────────────────────────────

/** A single filled cell in the crossword grid. */
export interface CrosswordCell {
  row: number;
  col: number;
  letter: string;
  /** Set when this cell is the numbered start of an across or down clue. */
  number?: number;
}

/** A single answer/clue entry in the crossword. */
export interface CrosswordWord {
  answer: string;
  clue: string;
  /** Starting row (0-indexed). */
  row: number;
  /** Starting column (0-indexed). */
  col: number;
  direction: "across" | "down";
  /** Displayed clue number. */
  number: number;
}

/** Grid dimensions for a crossword puzzle. */
export interface CrosswordGridSize {
  rows: number;
  cols: number;
}

/** One complete crossword puzzle (one difficulty level). */
export interface CrosswordPuzzle {
  cells: CrosswordCell[];
  gridSize: CrosswordGridSize;
  difficulty: string;
  words: CrosswordWord[];
}

// ─── Hangman ─────────────────────────────────────────────────────────────────

/** A single word entry inside a hangman puzzle. */
export interface HangmanWord {
  answer: string;
  clue: string;
}

/** One complete hangman puzzle (one difficulty level). */
export interface HangmanPuzzle {
  difficulty: string;
  words: HangmanWord[];
}

// ─── Memory Battle ───────────────────────────────────────────────────────────

/** A single card pair inside a memory battle puzzle. */
export interface MemoryBattlePair {
  id: string;
  term: string;
  matchText: string;
}

/** One complete memory battle puzzle (one difficulty level). */
export interface MemoryBattlePuzzle {
  difficulty: string;
  gridCols: number;
  gridRows: number;
  pairs: MemoryBattlePair[];
}

// ─── Speed Sniper ────────────────────────────────────────────────────────────

/** A single question inside a speed sniper puzzle. */
export interface SpeedSniperQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
}

/** One complete speed sniper puzzle (one difficulty level). */
export interface SpeedSniperPuzzle {
  difficulty: string;
  choiceCount: number;
  questions: SpeedSniperQuestion[];
  targetSize: string;
  targetSpeed: string;
  timerSeconds: number;
}

// ─── Combined payload ────────────────────────────────────────────────────────

/**
 * The complete parsed payload from a `type === "puzzle"` resource.
 * Key names match the backend JSON exactly:
 *   payload.crosswords
 *   payload.hangman
 *   payload.memoryBattle
 *   payload.speedSniper
 */
export interface ChapterWordGames {
  crosswords: CrosswordPuzzle[];
  hangman: HangmanPuzzle[];
  memoryBattle: MemoryBattlePuzzle[];
  speedSniper: SpeedSniperPuzzle[];
}
