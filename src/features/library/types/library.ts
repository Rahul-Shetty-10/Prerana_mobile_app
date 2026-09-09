import { ResourceTabType } from "../../subjects/types";

export interface LibraryHeroStats {
  activeSubjects: number;
  savedOutputs: number;
  visibleResources: number;
}

export interface LibraryHeroData {
  title: string;
  subtitle: string;
  stats: LibraryHeroStats;
}

export type SavedOutputType =
  | "note"
  | "slide"
  | "flashcard"
  | "textbook"
  | "pdf"
  | "mindmap"
  | "infographic";

export interface SavedOutputItem {
  id: string;
  title: string;
  type: SavedOutputType;
  subject: string;
  chapter: string;
  savedAt: string;
}

export interface SavedOutputsData {
  title: string;
  description: string;
  badgeText: string;
  placeholderText: string;
  items: SavedOutputItem[];
}

export interface ChapterShelfItem {
  id: string;
  chapterId: string;
  chapterName: string;
  chapterNumber?: number;
  partNumber?: number;
  subjectId: string;
  subjectName: string;
  chapterType: string;
  approvedResourceCount: number;
  resourceTypes: ResourceTabType[];
}

export type ResourceBadgeLabel =
  | "Infographic"
  | "Mindmap"
  | "Slidedeck"
  | "Textbook"
  | "Flashcards"
  | "Table"
  | "Audio";

export interface FeaturedResourceItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  resourceBadge: ResourceBadgeLabel;
  resourceTab: ResourceTabType;
}

export interface LibraryPayload {
  hero: LibraryHeroData;
  savedOutputs: SavedOutputsData;
  chapterShelves: ChapterShelfItem[];
  featuredResources: FeaturedResourceItem[];
}

export interface LibraryHeroCardProps {
  title?: string;
  subtitle?: string;
  stats: LibraryHeroStats;
  onOpenMySubjects: () => void;
}

export interface SavedOutputsCardProps {
  title?: string;
  description?: string;
  badgeText?: string;
  placeholderText?: string;
  savedItems?: SavedOutputItem[];
  onItemPress?: (item: SavedOutputItem) => void;
}

export interface ChapterShelfCardProps {
  shelf: ChapterShelfItem;
  onOpenChapterShelf: (shelf: ChapterShelfItem) => void;
}

export interface FeaturedResourceCardProps {
  resource: FeaturedResourceItem;
  onOpenResource: (resource: FeaturedResourceItem) => void;
}
