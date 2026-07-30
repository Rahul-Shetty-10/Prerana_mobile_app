import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  FlashcardItem,
  MindmapNode,
  PDFPageItem,
  TableColumn,
  TableRowData,
} from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ChapterResourcesPayload {
  subjectId: string;
  chapterId: string;
  chapterTitle?: string;
  infographicUrl?: string;
  infographicDescription?: string;
  mindmapUrl?: string;
  mindmapRoot?: MindmapNode;
  slidedeckUrl?: string;
  slidedeckPages?: PDFPageItem[];
  textbookNotesUrl?: string;
  textbookPages?: PDFPageItem[];
  flashcards?: FlashcardItem[];
  tableTitle?: string;
  tableColumns?: TableColumn[];
  tableRows?: TableRowData[];
  audioUrl?: string;
  audioTitle?: string;
  audioDurationSeconds?: number;
  videoUrl?: string;
  videoTitle?: string;
}

import { getMockChapterResources } from "../mock/mockChapterResources";

export async function fetchChapterResources(
  subjectId: string,
  chapterId: string,
  getToken?: GetToken
): Promise<ChapterResourcesPayload> {
  console.log(`[SUBJECTS][SERVICE] fetchChapterResources(): START for subjectId='${subjectId}', chapterId='${chapterId}'`);

  try {
    if (!subjectId || !chapterId) {
      throw new Error(`Missing required parameter: subjectId='${subjectId}', chapterId='${chapterId}'`);
    }

    if (!getToken) {
      throw new Error("Authentication token is required to load chapter resources.");
    }

    const data = await mobileApi<ChapterResourcesPayload>(
      `/student/chapter-resources?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      }
    );

    if (!data || typeof data !== "object") {
      throw new Error("API returned nullish or non-object response payload for chapter resources.");
    }

    // Support alternative shapes (e.g. if the payload has resources inside a sub-key)
    let resourcesPayload = data;
    if (!data.chapterTitle && (data as any).resources && typeof (data as any).resources === "object") {
      console.log("[SUBJECTS][SERVICE] fetchChapterResources(): Found alternative 'resources' wrapper key in payload. Extracting nested object.");
      resourcesPayload = (data as any).resources;
    }

    if (!resourcesPayload.chapterTitle) {
      console.warn("[SUBJECTS][SERVICE] fetchChapterResources(): Warning - payload is missing 'chapterTitle'. Payload keys:", Object.keys(resourcesPayload));
    }

    console.log(`[SUBJECTS][SERVICE] fetchChapterResources(): Successfully fetched chapter resources from backend. chapterTitle='${resourcesPayload.chapterTitle || "Unknown"}'`);
    return resourcesPayload;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`[SUBJECTS][ERROR] Component: chapterResourcesService | Function: fetchChapterResources | Error message: ${errorMsg}`);
    console.log(`[SUBJECTS][SERVICE] fetchChapterResources backend failed for subjectId='${subjectId}', chapterId='${chapterId}'. Falling back to local mock resources.`);
    return getMockChapterResources(subjectId, chapterId);
  }
}
