import { IconName } from "../../../shared/icons";

export interface AssessmentsHeroStats {
  activeSubjects: number;
  nextAvailableChapter: string;
  chapterQuizEntries: number;
  recordedAttempts: number;
}

export interface AssessmentsHeroData {
  title: string;
  subtitle: string;
  stats: AssessmentsHeroStats;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  iconName: IconName;
  actionType: "openSubjects" | "openNextQuiz" | "viewHistory";
}

export interface StatusSectionData {
  title: string;
  description?: string;
  emptyStateText: string;
  badgeText?: string;
  items?: any[];
}

export interface QuizEntryItem {
  id: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  subjectId: string;
  subjectName: string;
  subtitle?: string;
  availableCount?: number;
}

export interface AssessmentScopeData {
  enrolledGrade: string;
  activeSubjectsCount: number;
  curriculumChaptersCount: number;
  recordedAttemptsCount: number;
}

export interface AttemptItem {
  id: string;
  quizTitle: string;
  subjectName: string;
  chapterName: string;
  score?: number;
  totalQuestions?: number;
  completedAt?: string;
  status: "in_progress" | "awaiting_review" | "completed";
}

export interface QuizzesHomePayload {
  hero: AssessmentsHeroData;
  quickActions: QuickActionItem[];
  inProgress: StatusSectionData;
  awaitingReview: StatusSectionData;
  readyToStart: QuizEntryItem[];
  recentCompleted: StatusSectionData;
}

export interface AssessmentHistoryPayload {
  hero: {
    title: string;
    subtitle: string;
    stats: {
      activeSubjects: number;
      quizReadyChapters: number;
      recordedAttempts: number;
    };
  };
  scope: AssessmentScopeData;
  recentAttempts: StatusSectionData;
  inProgressAttempts: StatusSectionData;
  availableQuizEntries: QuizEntryItem[];
}

export interface QuizLandingPayload {
  chapterNumber: number;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface AssessmentHeroCardProps {
  title: string;
  subtitle: string;
  stats: {
    activeSubjects: number;
    nextAvailableChapter?: string;
    quizReadyChapters?: number;
    chapterQuizEntries?: number;
    recordedAttempts: number;
  };
  onOpenNextQuiz?: () => void;
  onViewHistory?: () => void;
  onOpenAvailableQuiz?: () => void;
  variant?: "quizzes" | "history";
}

export interface QuickActionCardProps {
  action: QuickActionItem;
  onPress: (actionType: QuickActionItem["actionType"]) => void;
}

export interface StatusCardProps {
  section: StatusSectionData;
  onOpenNextQuiz?: () => void;
  onViewHistory?: () => void;
  onOpenAvailableQuiz?: () => void;
  onOpenMySubjects?: () => void;
  buttons?: Array<"openNextQuiz" | "viewHistory" | "openAvailableQuiz" | "openMySubjects">;
}

export interface QuizEntryCardProps {
  entry: QuizEntryItem;
  onOpenQuiz: (entry: QuizEntryItem) => void;
}

export interface InformationCardProps {
  type: "continueLearning" | "currentScope";
  scope?: AssessmentScopeData;
  onOpenMySubjects?: () => void;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: IconName;
  iconColor?: string;
}
