export type LightningQuestionType = "mcq" | "true_false";
export type LightningDifficulty = "Easy" | "Medium" | "Hard";

export interface LightningQuestion {
  id: string;
  category: string;
  questionType: LightningQuestionType;
  difficulty: LightningDifficulty;
  question: string;
  options: string[]; // 4 for MCQ, 2 ("True", "False") for true_false
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface LightningTapSessionResult {
  difficulty: LightningDifficulty;
  score: number;
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  highestCombo: number;
  averageResponseTimeSeconds: number;
  xpEarned: number;
  coinsEarned: number;
  victory: boolean;
}

export interface LightningQuestionCardProps {
  question: LightningQuestion;
  questionNumber: number;
  totalAnswered: number;
  isUrgent?: boolean;
}

export interface ComboBadgeProps {
  combo: number;
}
