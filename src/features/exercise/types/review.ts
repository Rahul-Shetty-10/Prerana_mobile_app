import { TrackType } from "./exercise";

export type ReviewStatus = "correct" | "incorrect" | "skipped";

export interface ReviewQuestionItem {
  id: string;
  number: number;
  prompt: string;
  typeLabel: string;
  status: ReviewStatus;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface ReviewPayload {
  subjectName: string;
  trackName: string;
  trackType: TrackType;
  title: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercent: number;
  questions: ReviewQuestionItem[];
}

export interface ReviewQuestionCardProps {
  question: ReviewQuestionItem;
  currentNumber: number;
  totalQuestions: number;
}

export interface AnswerComparisonCardProps {
  studentAnswer: string;
  correctAnswer: string;
  status: ReviewStatus;
}

export interface ExplanationCardProps {
  explanation: string;
}

export interface ReviewNavigatorProps {
  questions: ReviewQuestionItem[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
}

export interface ReviewSummaryCardProps {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercent: number;
}

export interface ReviewActionButtonsProps {
  onRetryExercise: () => void;
  onBackToResult: () => void;
  onBackToSubject: () => void;
}
