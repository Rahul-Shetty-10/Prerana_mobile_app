import { IconName } from "../../../shared/icons";

export type ResourceTabType =
  | "infographic"
  | "mindmap"
  | "slidedeck"
  | "textbook"
  | "flashcards"
  | "table"
  | "audio"
  | "arcade";

export interface ResourceTabItem {
  id: ResourceTabType;
  label: string;
  iconName: IconName;
}

export interface ChapterResourceHeaderProps {
  breadcrumbItems: string[];
  subjectName: string;
  chapterTitle: string;
  chapterNumber?: number;
  onBackPress?: () => void;
}

export interface ResourceTabsProps {
  tabs: ResourceTabItem[];
  activeTab: ResourceTabType;
  onTabSelect: (tab: ResourceTabType) => void;
}

export interface ResourceTabButtonProps {
  tab: ResourceTabItem;
  isActive: boolean;
  onPress: (tabId: ResourceTabType) => void;
}

import { ChapterResourcesPayload } from "../services";

export interface ResourceContainerProps {
  activeTab: ResourceTabType;
  chapterTitle: string;
  resources?: ChapterResourcesPayload | null;
  slidedeckPageIndex: number;
  onSlidedeckPageChange: (index: number) => void;
  flashcardIndex: number;
  onFlashcardIndexChange: (index: number) => void;
}

