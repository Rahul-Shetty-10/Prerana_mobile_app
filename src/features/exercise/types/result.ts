import { TrackType } from "./exercise";

export type PerformanceLevel = "excellent" | "good" | "average" | "needs_improvement";

export interface ExerciseResultData {
  subjectName: string;
  trackName: string;
  trackType: TrackType;
  title: string;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  accuracyPercent: number;
  completionPercent: number;
  timeTakenFormatted: string;
  performanceLevel: PerformanceLevel;
  performanceMessage: string;
}

export interface ScoreCardProps {
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeTakenFormatted: string;
}

export interface PerformanceBadgeProps {
  performanceLevel: PerformanceLevel;
  performanceMessage: string;
  accuracyPercent: number;
}

export interface StatisticsCardProps {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  completionPercent: number;
}

export interface ResultActionButtonsProps {
  onReviewAnswers: () => void;
  onRetryExercise: () => void;
  onBackToSubject: () => void;
}
