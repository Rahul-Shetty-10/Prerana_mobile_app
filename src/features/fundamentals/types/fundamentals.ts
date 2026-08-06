import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

export interface SubjectItem {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  previewBadgeText: string;
  trackCount: number;
  questionCount: number;
  colorVariant?: StatCardVariant;
  subjectSlug: string;
}

export interface FundamentalsHeroProps {
  subjectCount?: number;
  trackCount?: number;
  onOpenSubjectsPress?: () => void;
}

export interface SubjectCardProps {
  subject: SubjectItem;
  onPress?: (subject: SubjectItem) => void;
}

export interface SubjectListProps {
  subjects: SubjectItem[];
  onSelectSubject?: (subject: SubjectItem) => void;
}

export interface FundamentalsDataPayload {
  subjectCount: number;
  trackCount: number;
  subjects: SubjectItem[];
}
