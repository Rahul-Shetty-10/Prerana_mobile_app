import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  FlashcardItem,
  MindmapNode,
  PDFPageItem,
  TableColumn,
  TableRowData,
  ChapterWordGames,
} from "../types";
import { getResourceRequestHeaders, shouldInvalidateResourceResponse } from "../../../shared/session/resourceAuth";
import { invalidateMobileSession } from "../../../shared/session/sessionStore";

export class ChapterResourcesError extends Error {
  constructor(public code: 'NETWORK_FAILURE' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'EMPTY_DATA', message: string) {
    super(message);
    this.name = 'ChapterResourcesError';
  }
}

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
  textbookUrl?: string;
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
  authToken?: string;
  /** Parsed payload from a `type === "puzzle"` resource (Chapter Word Games). */
  wordGames?: ChapterWordGames;
}

export async function fetchChapterResources(
  subjectId: string,
  chapterId: string,
  getToken?: GetToken
): Promise<ChapterResourcesPayload> {
  console.log(`[SUBJECTS][SERVICE] fetchChapterResources(): START for subjectId='${subjectId}', chapterId='${chapterId}'`);

  if (!subjectId || !chapterId) {
    throw new ChapterResourcesError('SERVER_ERROR', `Missing required parameter: subjectId='${subjectId}', chapterId='${chapterId}'`);
  }

  if (!getToken) {
    throw new ChapterResourcesError('UNAUTHORIZED', "Authentication token is required to load chapter resources.");
  }

  try {
    const token = (await getToken({ template: "convex" })) || "";
    const data = await mobileApi<ChapterResourcesPayload>(
      `/student/chapter-resources?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      {
        getToken,
      }
    );

    if (!data || typeof data !== "object") {
      throw new ChapterResourcesError('EMPTY_DATA', "API returned nullish or non-object response payload for chapter resources.");
    }


    // Map raw array resources to flat ChapterResourcesPayload structure
    const baseUrl = appConfig.apiBaseUrl.replace("/api/mobile/v1", "");
    const getAbsoluteUrl = (path?: string) => {
      if (!path || typeof path !== "string") return undefined;
      const trimmed = path.trim();
      if (!trimmed) return undefined;
      if (/^https?:\/\//i.test(trimmed)) return trimmed;

      // Prefer the configured asset origin for relative S3/content paths.
      // Keep the API origin as a backwards-compatible fallback for legacy
      // backend paths. Neither origin contains tenant identity.
      const origin = appConfig.storageBaseUrl.trim() || baseUrl;
      try {
        return new URL(trimmed, `${origin.replace(/\/+$/, "")}/`).toString();
      } catch {
        return undefined;
      }
    };

    const parseCsvLine = (text: string): string[] => {
      const result = [];
      let inQuotes = false;
      let current = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"(.*)"$/, "$1"));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"(.*)"$/, "$1"));
      return result;
    };

    const result: ChapterResourcesPayload = {
      subjectId,
      chapterId,
      chapterTitle: data.chapterTitle || "Chapter Resources",
      textbookNotesUrl: getAbsoluteUrl(data.textbookUrl),
      authToken: token,
    };

    const resourcesArray = (data as any).resources?.resources || (data as any).resources || [];

    if (Array.isArray(resourcesArray)) {
      console.log(`[SUBJECTS][SERVICE] Resources returned:`, resourcesArray.map((r: any) => ({ type: r?.type, title: r?.title })));
      for (const item of resourcesArray) {
        if (!item || typeof item !== "object") continue;
        const type = item.type;

        // Resource URL priority:
        // 1. item.payload.resourceUrl (new S3 storage pipeline for Kannada/Hindi)
        // 2. item.payload.url
        // 3. item.assetUrl (legacy content pipeline for Science/English)
        // 4. item.url
        const rawUrl =
          (typeof item.payload === "object" && item.payload !== null
            ? item.payload.resourceUrl || item.payload.url
            : undefined) ||
          (typeof item.assetUrl === "string" ? item.assetUrl : undefined) ||
          (typeof item.url === "string" ? item.url : undefined);

        const assetUrl = getAbsoluteUrl(rawUrl);

        if (type === "infographic") {
          result.infographicUrl = assetUrl;
          result.infographicDescription = item.title || "";
        } else if (type === "mind_map") {
          result.mindmapUrl = assetUrl;
          result.mindmapRoot = item.payload?.root || item.payload || undefined;
        } else if (type === "slide") {
          result.slidedeckUrl = assetUrl;
        } else if (type === "pdf") {
          result.textbookNotesUrl = assetUrl;
        } else if (type === "flashcards") {
          if (typeof item.payload === "string") {
            const lines = item.payload.split("\n").filter((l: string) => l.trim().length > 0);
            const cardList: FlashcardItem[] = [];
            lines.forEach((line: string) => {
              const parts = parseCsvLine(line);
              if (parts.length >= 2) {
                cardList.push({
                  id: `fc-${cardList.length}`,
                  frontText: parts[0],
                  backText: parts[1],
                });
              }
            });
            result.flashcards = cardList;
          } else if (Array.isArray(item.payload)) {
            result.flashcards = item.payload;
          } else if (assetUrl) {
            // Some content packs expose flashcards as a CSV asset. Use the
            // same active tenant context as other resource requests when the
            // asset is served by the API. Signed external URLs authenticate
            // themselves and receive no Clerk token.
            try {
              const csvHeaders = getResourceRequestHeaders(assetUrl, token);
              const csvRes = await fetch(assetUrl, csvHeaders ? { headers: csvHeaders } : undefined);
              if (!csvRes.ok) {
                if (shouldInvalidateResourceResponse(assetUrl, csvRes.status)) await invalidateMobileSession();
              } else {
                const lines = (await csvRes.text()).split("\n").filter((l: string) => l.trim().length > 0);
                const cardList: FlashcardItem[] = [];
                lines.forEach((line: string, index: number) => {
                  const parts = parseCsvLine(line);
                  const front = parts[0]?.trim() ?? "";
                  const back = parts[1]?.trim() ?? "";
                  if (index === 0 && ["front,back", "term,definition", "question,answer"].includes(`${front.toLowerCase()},${back.toLowerCase()}`)) return;
                  if (front || back) cardList.push({ id: `fc-${cardList.length}`, frontText: front, backText: back });
                });
                result.flashcards = cardList;
              }
            } catch {
              // A missing optional flashcard asset should show an empty state,
              // not break the rest of the chapter resources.
            }
          }
        } else if (type === "table") {
          if (typeof item.payload === "string") {
            const lines = item.payload.split("\n").filter((l: string) => l.trim().length > 0);
            if (lines.length > 0) {
              const headers = parseCsvLine(lines[0]).map((h, colIdx) => ({
                key: `col_${colIdx}`,
                title: h,
              }));
              const rows = lines.slice(1).map((line: string, rowIdx: number) => {
                const cells = parseCsvLine(line);
                const rowData: Record<string, string> = { id: `row-${rowIdx}` };
                headers.forEach((hdr, colIdx) => {
                  rowData[hdr.key] = cells[colIdx] || "";
                });
                return rowData;
              });
              result.tableColumns = headers;
              result.tableRows = rows;
              result.tableTitle = item.title || "Data Table";
            }
          } else if (item.payload && typeof item.payload === "object") {
            result.tableColumns = item.payload.columns;
            result.tableRows = item.payload.rows;
            result.tableTitle = item.title || "Data Table";
          }
        } else if (type === "audio") {
          result.audioUrl = assetUrl;
          result.audioTitle = item.title || "Audio Summary";
          result.audioDurationSeconds = item.payload?.duration || undefined;
        } else if (type === "video") {
          result.videoUrl = assetUrl;
          result.videoTitle = item.title || "Video Explanation";
        } else if (type === "puzzle") {
          // Chapter Word Games — payload keys match backend exactly.
          const p = item.payload;
          if (p && typeof p === "object") {
            result.wordGames = {
              crosswords: Array.isArray(p.crosswords) ? p.crosswords : [],
              hangman: Array.isArray(p.hangman) ? p.hangman : [],
              memoryBattle: Array.isArray(p.memoryBattle) ? p.memoryBattle : [],
              speedSniper: Array.isArray(p.speedSniper) ? p.speedSniper : [],
            };
            console.log(
              `[SUBJECTS][SERVICE] puzzle resource parsed — crosswords:${result.wordGames.crosswords.length} hangman:${result.wordGames.hangman.length} memoryBattle:${result.wordGames.memoryBattle.length} speedSniper:${result.wordGames.speedSniper.length}`
            );
          }
        }
      }
    }

    console.log(`[SUBJECTS][SERVICE] fetchChapterResources(): Successfully fetched and mapped chapter resources from backend. Title: '${result.chapterTitle}'`);
    return result;
  } catch (error) {
    console.error("[SUBJECTS][SERVICE] fetchChapterResources failed", error instanceof Error ? error.message : "unknown error");
    if (error instanceof ChapterResourcesError) throw error;
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("unauthenticated") || msg.includes("clerk token")) {
        throw new ChapterResourcesError('UNAUTHORIZED', error.message);
      } else if (msg.includes("network") || msg.includes("fetch")) {
        throw new ChapterResourcesError('NETWORK_FAILURE', error.message);
      }
    }
    throw new ChapterResourcesError('SERVER_ERROR', 'Failed to fetch chapter resources');
  }
}
