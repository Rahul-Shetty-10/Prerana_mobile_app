export type QuizCategory =
  | "Mathematics"
  | "Science"
  | "English"
  | "Social Studies"
  | "General Knowledge";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export interface BrainBlitzQuestion {
  id: string;
  category: QuizCategory;
  difficulty: QuestionDifficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface BrainBlitzSessionResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  highestCombo: number;
  bestCategory: QuizCategory;
  victory: boolean;
}
