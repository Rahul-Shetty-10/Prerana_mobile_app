import { IconName } from "../../../shared/icons";

export interface HeaderProps {
  userName?: string;
  greeting?: string;
  notificationCount?: number;
  avatarUrl?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export interface WelcomeCardProps {
  badgeText?: string;
  title?: string;
  description?: string;
  subjects?: string[];
  selectedSubject?: string;
  onSubjectSelect?: (subject: string) => void;
  onContinueLearning?: () => void;
  onStudyResources?: () => void;
}

export type StatCardVariant = "coral" | "amber" | "blue" | "emerald" | "purple";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  variant?: StatCardVariant;
  changeText?: string;
  changeType?: "positive" | "negative" | "neutral";
  onPress?: () => void;
}

export interface StatsSectionProps {
  sectionTitle?: string;
  stats: StatCardProps[];
}

// 1. Focus Now Section Types
export interface FocusNowProps {
  nextChapter?: {
    subjectName: string;
    chapterTitle: string;
    progressPercentage: number;
    estimatedMinutes: number;
  };
  libraryStatus?: {
    savedResourcesCount: number;
    activeLabsCount: number;
  };
  onStartChapter?: () => void;
  onOpenLibrary?: () => void;
}

// 2. Performance Overview Types
export interface SubjectPerformanceItem {
  subject: string;
  scorePercentage: number;
  questionsSolved: number;
  colorVariant?: StatCardVariant;
}

export interface PerformanceOverviewProps {
  overallAccuracy?: number;
  masteryLevel?: string;
  subjectsPerformance?: SubjectPerformanceItem[];
}

// 3. Latest Signals Types
export type SignalCategory = "assessments" | "requests" | "library";

export interface SignalItem {
  id: string;
  category: SignalCategory;
  title: string;
  subtitle: string;
  timestamp: string;
  statusText?: string;
  statusVariant?: "success" | "warning" | "info";
  iconName: IconName;
}

export interface LatestSignalsProps {
  signals?: SignalItem[];
  isLoading?: boolean;
  onSignalPress?: (signal: SignalItem) => void;
}

// 4. Resume Quickly Types
export interface QuickRouteItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  badgeText?: string;
  variant?: StatCardVariant;
  onPress?: () => void;
}

export interface ResumeQuicklyProps {
  routes?: QuickRouteItem[];
}
