import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { getMobileSession } from "../../../shared/session/sessionStore";
import {
  FlashcardItem,
  MindmapNode,
  PDFPageItem,
  TableColumn,
  TableRowData,
  ChapterWordGames,
} from "../types";

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
  tenantSlug?: string;
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
    const resourceAssetProxyBase = `${appConfig.apiBaseUrl.replace("/mobile/v1", "")}/student/resource-asset`;

    /**
     * Resolve any raw asset path/URL into a fully loadable URL.
     *
     * Rules (in priority order):
     *   1. Already an absolute HTTPS URL that is an S3/amazonaws URL
     *      → route through backend resource-asset proxy.
     *   2. Already an absolute HTTPS/HTTP URL (CDN, embed, etc.)
     *      → return as-is.
     *   3. Relative path (e.g. "assets/German+.../infographic.png")
     *      → prepend appConfig.storageBaseUrl to get the full S3 URL,
     *         then route through the proxy.
     */
    const getAbsoluteUrl = (path?: string): string | undefined => {
      if (!path || typeof path !== "string") return undefined;
      const trimmed = path.trim();
      if (!trimmed) return undefined;

      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }

      // Relative asset path — build full S3 URL using configured storage base
      const storageBase = appConfig.storageBaseUrl;
      if (!storageBase) {
        console.warn(`[SUBJECTS][SERVICE] EXPO_PUBLIC_STORAGE_BASE_URL is not set; cannot resolve relative path: '${trimmed}'`);
        return undefined;
      }
      const separator = trimmed.startsWith("/") ? "" : "/";
      return `${storageBase}${separator}${trimmed}`;
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
      tenantSlug: getMobileSession()?.tenantSlug ?? undefined,
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
          const parseInlineCsv = (csvText: string): FlashcardItem[] => {
            const lines = csvText.split("\n").filter((l: string) => l.trim().length > 0);
            const cardList: FlashcardItem[] = [];
            lines.forEach((line: string, idx: number) => {
              const parts = parseCsvLine(line);
              const front = parts[0]?.trim() ?? "";
              const back = parts[1]?.trim() ?? "";
              // Skip header row (front/back, term/definition, question/answer)
              if (
                idx === 0 &&
                ((front.toLowerCase() === "front" && back.toLowerCase() === "back") ||
                  (front.toLowerCase() === "term" && back.toLowerCase() === "definition") ||
                  (front.toLowerCase() === "question" && back.toLowerCase() === "answer"))
              ) {
                return;
              }
              if (front || back) {
                cardList.push({ id: `fc-${cardList.length}`, frontText: front, backText: back });
              }
            });
            return cardList;
          };

          if (typeof item.payload === "string" && item.payload.trim().length > 0) {
            // Inline CSV text in payload
            result.flashcards = parseInlineCsv(item.payload);
          } else if (Array.isArray(item.payload)) {
            result.flashcards = item.payload as FlashcardItem[];
          } else if (assetUrl) {
            // No inline payload — fetch remote CSV (e.g. German flashcards served via S3)
            try {
              console.log(`[SUBJECTS][SERVICE] Fetching remote flashcards CSV: ${assetUrl}`);
              const csvRes = await fetch(assetUrl);
              if (csvRes.ok) {
                const csvText = await csvRes.text();
                result.flashcards = parseInlineCsv(csvText);
                console.log(`[SUBJECTS][SERVICE] Loaded ${result.flashcards.length} flashcards from remote CSV.`);
              } else {
                console.warn(`[SUBJECTS][SERVICE] Flashcards CSV HTTP ${csvRes.status} from ${assetUrl}`);
              }
            } catch (csvErr) {
              console.error(`[SUBJECTS][SERVICE] Failed to fetch flashcards CSV from ${assetUrl}:`, csvErr);
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
    console.error("[SUBJECTS][SERVICE] error in fetchChapterResources:", error);
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
