import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

export type QuestionType = "mcq" | "match" | "true_false" | "fill_blank" | "reorder";
export type TrackType = "explorer" | "investigator" | "innovator" | "scientist";

export interface MCQOption {
  id: string;
  label: string; // e.g. "A", "B", "C", "D"
  text: string;
  isCorrect?: boolean;
}

export interface MatchPair {
  id: string;
  rightId: string;
  leftText: string;
  rightText: string;
}

export interface QuestionItem {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  instructions?: string;
  mcqOptions?: MCQOption[];
  matchPairs?: MatchPair[];
  fillBlankPlaceholder?: string;
  reorderItems?: Array<{ id: string; text: string }>;
  correctAnswer?: any;
  explanation?: string;
  isLoaded?: boolean;
  _rawBackendPayload?: any;
}

export interface ExerciseSessionPayload {
  id: string;
  subjectName: string;
  trackName: string;
  trackType: TrackType;
  title: string;
  totalQuestions: number;
  questions: QuestionItem[];
}

export interface ExerciseHeaderProps {
  subjectName: string;
  trackName: string;
  trackType?: TrackType;
  title: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onBackPress?: () => void;
}

export interface ProgressCardProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onQuestionNavPress?: () => void;
}

export interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: number[];
  flaggedIndices: number[];
  onSelectQuestion: (index: number) => void;
}
