import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

export interface SubjectTrack {
  slug: string;
  name: string;
  questionCount?: number;
  level?: string;
}

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
  tracks?: SubjectTrack[];
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
