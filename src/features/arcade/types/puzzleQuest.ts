export type PuzzleQuestionType =
  | "mcq"
  | "sequence"
  | "arrange"
  | "drag_drop"
  | "timeline"
  | "image";

export type PuzzleDifficulty = "Easy" | "Medium" | "Hard";

export interface PuzzleItem {
  id: string;
  category: string;
  questionType: PuzzleQuestionType;
  difficulty: PuzzleDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  imageUrl?: string;
}

export interface PuzzleQuestSessionResult {
  difficulty: PuzzleDifficulty;
  score: number;
  totalPuzzles: number;
  solvedCount: number;
  incorrectCount: number;
  accuracy: number;
  highestLogicStreak: number;
  averageSolveTimeSeconds: number;
  xpEarned: number;
  coinsEarned: number;
  victory: boolean;
}

export interface PuzzleCardProps {
  puzzle: PuzzleItem;
  puzzleNumber: number;
  totalPuzzles: number;
  showHint?: boolean;
  onToggleHint?: () => void;
}

export interface HintBadgeProps {
  hintText: string;
}
