import { mobileApi } from "../../../api/mobileApi";
import {
  ChapterShelfItem,
  FeaturedResourceItem,
  LibraryPayload,
  ResourceBadgeLabel,
  SavedOutputItem,
  SavedOutputType,
} from "../types";
import { MOCK_LIBRARY_DATA } from "../constants";
import { ResourceTabType } from "../../subjects/types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface RawLibraryItem {
  id: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
  chapterNumber?: number;
  partNumber?: number;
  resourceKind?: string;
  sourceKind?: "study_lab" | "approved_resource";
  savedAt?: string;
}

export interface LibraryApiResponse {
  hero?: LibraryPayload["hero"];
  savedOutputs?: LibraryPayload["savedOutputs"];
  chapterShelves?: LibraryPayload["chapterShelves"];
  featuredResources?: LibraryPayload["featuredResources"];
  items?: RawLibraryItem[];
}

function mapResourceBadge(kind?: string): ResourceBadgeLabel {
  const k = (kind || "").toLowerCase();
  if (k.includes("mind")) return "Mindmap";
  if (k.includes("slide")) return "Slidedeck";
  if (k.includes("text") || k.includes("note")) return "Textbook";
  if (k.includes("flash")) return "Flashcards";
  if (k.includes("table") || k.includes("grid")) return "Table";
  if (k.includes("audio") || k.includes("sound")) return "Audio";
  return "Infographic";
}

function mapResourceTab(kind?: string): ResourceTabType {
  const k = (kind || "").toLowerCase();
  if (k.includes("mind")) return "mindmap";
  if (k.includes("slide")) return "slidedeck";
  if (k.includes("text") || k.includes("note")) return "textbook";
  if (k.includes("flash")) return "flashcards";
  if (k.includes("table") || k.includes("grid")) return "table";
  if (k.includes("audio") || k.includes("sound")) return "audio";
  return "infographic";
}

function mapSavedOutputType(kind?: string): SavedOutputType {
  const k = (kind || "").toLowerCase();
  if (k.includes("slide")) return "slide";
  if (k.includes("flash")) return "flashcard";
  if (k.includes("text")) return "textbook";
  if (k.includes("pdf")) return "pdf";
  if (k.includes("mind")) return "mindmap";
  if (k.includes("info")) return "infographic";
  return "note";
}

export async function fetchLibraryData(getToken?: GetToken): Promise<LibraryPayload> {
  if (!getToken) {
    return MOCK_LIBRARY_DATA;
  }

  try {
    const rawData = await mobileApi<LibraryApiResponse>("/student/library", {
      getToken,
    });

    if (!rawData) {
      return MOCK_LIBRARY_DATA;
    }

    // If backend returns pre-formatted structured sections
    if (rawData.chapterShelves && rawData.chapterShelves.length > 0) {
      return {
        hero: rawData.hero ?? MOCK_LIBRARY_DATA.hero,
        savedOutputs: rawData.savedOutputs ?? MOCK_LIBRARY_DATA.savedOutputs,
        chapterShelves: rawData.chapterShelves,
        featuredResources: rawData.featuredResources ?? MOCK_LIBRARY_DATA.featuredResources,
      };
    }

    // If backend returns flat list of items, transform into grouped shelves
    if (rawData.items && Array.isArray(rawData.items) && rawData.items.length > 0) {
      const allItems = rawData.items;

      // 1. Group saved AI outputs (study_lab)
      const savedItems: SavedOutputItem[] = allItems
        .filter((item) => item.sourceKind === "study_lab")
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: mapSavedOutputType(item.resourceKind),
          subject: item.subjectName || "General Science",
          chapter: item.chapterName || "Chapter 1",
          savedAt: item.savedAt || "Recently",
        }));

      // 2. Group approved chapter resources by chapterId
      const chapterMap = new Map<string, RawLibraryItem[]>();
      allItems.forEach((item) => {
        const cId = item.chapterId || "chap-default";
        if (!chapterMap.has(cId)) {
          chapterMap.set(cId, []);
        }
        chapterMap.get(cId)!.push(item);
      });

      const chapterShelves: ChapterShelfItem[] = Array.from(chapterMap.entries()).map(
        ([cId, groupItems], idx) => {
          const first = groupItems[0];
          const distinctResourceTypes = Array.from(
            new Set(groupItems.map((gi) => mapResourceTab(gi.resourceKind)))
          );

          return {
            id: `shelf-${cId}-${idx}`,
            chapterId: cId,
            chapterName: first.chapterName || "Chemical Reactions & Equations",
            chapterNumber: first.chapterNumber || idx + 1,
            partNumber: first.partNumber || 1,
            subjectId: first.subjectId || "subj-science",
            subjectName: first.subjectName || "General Science",
            chapterType: `${first.subjectName || "Science"} Core Chapter`,
            approvedResourceCount: groupItems.length,
            resourceTypes: distinctResourceTypes,
          };
        }
      );

      // 3. Featured Resources
      const featuredResources: FeaturedResourceItem[] = allItems.map((item, idx) => ({
        id: item.id || `feat-${idx}`,
        title: item.title,
        subjectId: item.subjectId || "subj-science",
        subjectName: item.subjectName || "General Science",
        chapterId: item.chapterId || "chap-1",
        chapterName: item.chapterName || "Chapter 1",
        resourceBadge: mapResourceBadge(item.resourceKind),
        resourceTab: mapResourceTab(item.resourceKind),
      }));

      // 4. Hero Data
      const distinctSubjects = new Set(allItems.map((i) => i.subjectId || i.subjectName)).size;
      const heroStats = {
        activeSubjects: distinctSubjects > 0 ? distinctSubjects : 6,
        savedOutputs: savedItems.length,
        visibleResources: allItems.length,
      };

      return {
        hero: {
          title: "My AI Library",
          subtitle: "Saved outputs and approved resources.",
          stats: heroStats,
        },
        savedOutputs: {
          title: "Saved AI Outputs",
          description:
            "Save approved resources here, then bookmark and group them into collections for quick revision.",
          badgeText: savedItems.length > 0 ? `${savedItems.length} Saved` : "Nothing Saved Yet",
          placeholderText:
            "No saved outputs yet. Approved outputs saved from AI workspace will appear here.",
          items: savedItems,
        },
        chapterShelves: chapterShelves.length > 0 ? chapterShelves : MOCK_LIBRARY_DATA.chapterShelves,
        featuredResources:
          featuredResources.length > 0 ? featuredResources : MOCK_LIBRARY_DATA.featuredResources,
      };
    }

    return {
      hero: rawData.hero ?? MOCK_LIBRARY_DATA.hero,
      savedOutputs: rawData.savedOutputs ?? MOCK_LIBRARY_DATA.savedOutputs,
      chapterShelves: rawData.chapterShelves ?? MOCK_LIBRARY_DATA.chapterShelves,
      featuredResources: rawData.featuredResources ?? MOCK_LIBRARY_DATA.featuredResources,
    };
  } catch (error) {
    return MOCK_LIBRARY_DATA;
  }
}

