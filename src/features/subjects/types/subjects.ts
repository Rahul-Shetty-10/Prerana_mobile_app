import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

export interface SubjectMeta {
  id: string;
  name: string;
  chapterCount: number;
  partCount: number;
  iconName: IconName;
  colorVariant?: StatCardVariant;
}

export interface ChapterItem {
  id: string;
  number?: number;
  partNumber?: number;
  title: string;
  subtitle: string;
}

export interface SubjectWorkspacePayload {
  subject: SubjectMeta;
  stats: {
    completedChapters: number;
    totalChapters: number;
  };
  chapters: ChapterItem[];
}

export interface BreadcrumbProps {
  items: string[];
}

export interface SubjectItemCardProps {
  subject: SubjectMeta;
  isSelected?: boolean;
  onPress?: (subject: SubjectMeta) => void;
}

export interface SubjectListProps {
  subjects: SubjectMeta[];
  selectedSubjectId?: string;
  onSelectSubject?: (subject: SubjectMeta) => void;
}

export interface SubjectHeaderProps {
  breadcrumbItems: string[];
  subjectName: string;
  title: string;
  onBackPress?: () => void;
}

export interface SubjectOverviewCardProps {
  subjectName: string;
  totalChapters: number;
  totalParts: number;
}

export interface SubjectStatisticsCardProps {
  completedChapters: number;
  totalChapters: number;
}

export interface QuickActionsCardProps {
  onStartFirstChapter?: () => void;
  onOpenFundamentals?: () => void;
  onViewQuizzes?: () => void;
}

export interface ChapterCardProps {
  chapter: ChapterItem;
  onPress?: (chapter: ChapterItem) => void;
}
