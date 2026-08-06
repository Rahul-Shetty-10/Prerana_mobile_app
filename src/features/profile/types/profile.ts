import { IconName } from "../../../shared/icons";

export interface StudentInfo {
  name: string;
  email: string;
  enrollmentId: string;
  studentClass: string;
  board: string;
  workspace: string;
  avatarUrl?: string;
}

export interface LearningStats {
  overallAccuracy: number;
  questionsSolved: number;
  studyHours: number;
  completedChapters: number;
  completedSubjects: number;
  weeklyProgressPercent: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface SubjectProgressItem {
  id: string;
  subjectName: string;
  iconName: IconName;
  color: string;
  totalChapters: number;
  completedChapters: number;
  progressPercent: number;
  seenChapters?: number;
}

export interface AccountOptionItem {
  id: string;
  title: string;
  subtitle?: string;
  iconName: IconName;
  actionType: "link" | "dialog" | "version";
  value?: string;
}

export interface StudentInfoCardProps {
  info: StudentInfo;
}

export interface LearningStatsCardProps {
  stats: LearningStats;
}

export interface SubjectProgressTileProps {
  item: SubjectProgressItem;
}

export interface AchievementCardProps {
  achievement: AchievementItem;
}

export interface PreferenceTileProps {
  title: string;
  subtitle?: string;
  iconName: IconName;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  isComingSoon?: boolean;
  onPress?: () => void;
}

export interface AccountTileProps {
  item: AccountOptionItem;
  onPress?: (id: string) => void;
}
