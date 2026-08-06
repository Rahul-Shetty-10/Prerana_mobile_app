import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { FundamentalsDataPayload, SubjectItem, SubjectTrack } from "../types";
import { MOCK_FUNDAMENTALS_HEADER, MOCK_FUNDAMENTALS_SUBJECTS } from "../constants";
import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

interface BackendChapter {
  id: string;
  chapterNumber: number;
  chapterName: string;
  partNumber?: number;
  partName?: string;
  topicTags?: string[];
}

interface BackendSubject {
  id: string;
  subjectName: string;
  subjectCode?: string;
  description?: string;
  academicYear?: string;
  chapters?: BackendChapter[];
}

interface LearningSnapshotResponse {
  subjects?: BackendSubject[];
}

function getIconForSubject(subjectCode?: string, subjectName?: string): IconName {
  const code = (subjectCode || "").toLowerCase();
  const name = (subjectName || "").toLowerCase();

  if (code.includes("eng") || name.includes("english")) return "book-outline";
  if (code.includes("sci") || name.includes("science") || name.includes("physics") || name.includes("chemistry")) return "flask-outline";
  if (code.includes("hin") || name.includes("hindi")) return "book-outline";
  if (code.includes("kan") || name.includes("kannada")) return "language-outline";
  if (code.includes("mat") || name.includes("math")) return "calculator-outline";
  if (code.includes("soc") || name.includes("social")) return "earth-outline";
  return "journal-outline";
}

function getBadgeForSubject(subjectCode?: string, subjectName?: string): string {
  const code = (subjectCode || "").toLowerCase();
  const name = (subjectName || "").toLowerCase();

  if (code.includes("eng") || name.includes("english")) return "LANGUAGE";
  if (code.includes("sci") || name.includes("science")) return "CORE SCIENCE";
  if (code.includes("hin") || name.includes("hindi")) return "LANGUAGE";
  if (code.includes("kan") || name.includes("kannada")) return "REGIONAL LANG";
  if (code.includes("mat") || name.includes("math")) return "FOUNDATION";
  if (code.includes("soc") || name.includes("social")) return "SOCIAL SCIENCE";
  return subjectCode ? subjectCode.toUpperCase() : "FOUNDATION";
}

function getColorVariantForSubject(subjectCode?: string, index: number = 0): StatCardVariant {
  const variants: StatCardVariant[] = ["coral", "amber", "purple", "blue", "emerald"];
  const code = (subjectCode || "").toLowerCase();

  if (code.includes("sci")) return "coral";
  if (code.includes("hin")) return "amber";
  if (code.includes("kan")) return "purple";
  if (code.includes("mat")) return "blue";
  if (code.includes("soc")) return "emerald";

  return variants[index % variants.length];
}

interface BackendCatalogSubject {
  id?: string;
  subjectName?: string;
  subjectSlug?: string;
  subjectCode?: string;
  description?: string;
  trackCount?: number;
  tracks?: Array<{
    slug?: string;
    trackSlug?: string;
    name?: string;
    trackName?: string;
    questionCount?: number;
    level?: string;
  }>;
}

interface CatalogApiResponse {
  subjects?: BackendCatalogSubject[];
}

export async function fetchFundamentalsData(getToken?: GetToken): Promise<FundamentalsDataPayload> {
  const fallbackPayload: FundamentalsDataPayload = {
    subjectCount: MOCK_FUNDAMENTALS_HEADER.subjectCount,
    trackCount: MOCK_FUNDAMENTALS_HEADER.trackCount,
    subjects: MOCK_FUNDAMENTALS_SUBJECTS,
  };

  if (!getToken) {
    return fallbackPayload;
  }

  try {
    const rawData = await mobileApi<any>("/student/fundamentals/catalog", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    console.log("[FUNDAMENTALS][DEBUG] /student/fundamentals/catalog response keys:", rawData ? Object.keys(rawData) : "null");
    console.log("[FUNDAMENTALS][DEBUG] /student/fundamentals/catalog response stringified:", JSON.stringify(rawData));

    let rawSubjects: any[] = [];
    
    function findSubjectsArray(obj: any): any[] | null {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj)) return obj;
      
      const keys = Object.keys(obj);
      const preferredKeys = ["subjects", "catalog", "data", "snapshot", "tracks"];
      const sortedKeys = [...keys].sort((a, b) => {
        const idxA = preferredKeys.indexOf(a);
        const idxB = preferredKeys.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      for (const key of sortedKeys) {
        const val = obj[key];
        if (Array.isArray(val)) {
          return val;
        }
        if (val && typeof val === "object") {
          const found = findSubjectsArray(val);
          if (found) return found;
        }
      }
      return null;
    }

    const foundArray = findSubjectsArray(rawData);
    if (foundArray) {
      rawSubjects = foundArray;
    }

    if (!rawSubjects || rawSubjects.length === 0) {
      console.warn("[FUNDAMENTALS][SERVICE] No subjects found in fundamentals catalog, returning fallback.");
      return fallbackPayload;
    }

    const totalSubjectCount = rawSubjects.length;

    let totalTrackCount = 0;
    const mappedSubjects: SubjectItem[] = rawSubjects.map((item, idx) => {
      const subjectTrackCount = item.trackCount || (item.tracks ? item.tracks.length : 4);
      totalTrackCount += subjectTrackCount;

      // Map backend tracks if available
      const mappedTracks: SubjectTrack[] | undefined = item.tracks && item.tracks.length > 0
        ? item.tracks.map((t: any) => ({
            slug: t.slug || t.trackSlug || "",
            name: t.name || t.trackName || t.slug || "",
            questionCount: t.questionCount,
            level: t.level,
          })).filter((t: SubjectTrack) => t.slug)
        : undefined;

      return {
        id: item.id || item.subjectSlug || `subj-${idx}`,
        subjectSlug: item.subjectSlug || item.slug || item.subjectCode || item.id || "",
        title: item.subjectName || "Subject",
        description: item.description || `Master foundational concepts in ${item.subjectName}.`,
        iconName: getIconForSubject(item.subjectCode, item.subjectName),
        previewBadgeText: getBadgeForSubject(item.subjectCode, item.subjectName),
        trackCount: subjectTrackCount,
        questionCount: subjectTrackCount > 0 ? subjectTrackCount * 30 : 120,
        colorVariant: getColorVariantForSubject(item.subjectCode, idx),
        tracks: mappedTracks,
      };
    });

    return {
      subjectCount: totalSubjectCount,
      trackCount: totalTrackCount > 0 ? totalTrackCount : MOCK_FUNDAMENTALS_HEADER.trackCount,
      subjects: mappedSubjects,
    };
  } catch (error) {
    console.error("[FUNDAMENTALS][fetchFundamentalsData] Failed:", error);
    throw error;
  }
}

