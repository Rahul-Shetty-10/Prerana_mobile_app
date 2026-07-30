import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { ChapterItem, SubjectMeta, SubjectWorkspacePayload } from "../types";
import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";
import { MOCK_SUBJECTS } from "../mock/mockSubjects";
import { getMockSubjectWorkspace } from "../mock/mockWorkspace";

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
  snapshot: {
    subjects: BackendSubject[];
  };
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

function getColorVariantForSubject(subjectCode?: string, index: number = 0): StatCardVariant {
  const variants: StatCardVariant[] = ["amber", "coral", "purple", "emerald", "blue"];
  const code = (subjectCode || "").toLowerCase();

  if (code.includes("eng")) return "amber";
  if (code.includes("sci")) return "coral";
  if (code.includes("hin")) return "purple";
  if (code.includes("kan")) return "emerald";
  if (code.includes("mat")) return "blue";
  if (code.includes("soc")) return "coral";

  return variants[index % variants.length];
}

export async function fetchSubjectsList(getToken?: GetToken): Promise<SubjectMeta[]> {
  console.log("[SUBJECTS][SERVICE] fetchSubjectsList(): START");

  try {
    if (!getToken) {
      throw new Error("Authentication token is required to load subjects.");
    }

    const rawData = await mobileApi<LearningSnapshotResponse>("/student/learning-snapshot", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    console.log("[SUBJECTS][DEBUG] rawData =", rawData);

    let subjects: any[] = [];
    if (rawData && typeof rawData === "object") {
      if (rawData.snapshot && typeof rawData.snapshot === "object" && Array.isArray(rawData.snapshot.subjects)) {
        subjects = rawData.snapshot.subjects;
      } else if (Array.isArray((rawData as any).subjects)) {
        subjects = (rawData as any).subjects;
      } else if (rawData.snapshot && Array.isArray(rawData.snapshot)) {
        // Alternative case where snapshot itself is the array of subjects
        subjects = rawData.snapshot;
      } else {
        console.warn("[SUBJECTS][SERVICE] fetchSubjectsList(): Payload structure is unexpected. Keys in rawData:", Object.keys(rawData));
        if (rawData.snapshot) {
          console.warn("[SUBJECTS][SERVICE] Keys in rawData.snapshot:", Object.keys(rawData.snapshot));
        }
      }
    } else {
      console.warn("[SUBJECTS][SERVICE] fetchSubjectsList(): Raw data is nullish or not an object:", rawData);
    }

    const backendCount = subjects.length;
    console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): Validated backend subject count: ${backendCount}`);

    if (subjects.length === 0) {
      console.log("[SUBJECTS][SERVICE] No subjects found or validated from backend response. Falling back to local mock data.");
      const mockMapped = MOCK_SUBJECTS.map((s) => ({
        id: s.id,
        name: s.name,
        chapterCount: s.chapterCount,
        partCount: s.partCount,
        iconName: s.iconName,
        colorVariant: s.colorVariant,
      }));
      console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): Mapped subject count: ${mockMapped.length}`);
      console.log("[SUBJECTS][SERVICE] fetchSubjectsList(): END");
      return mockMapped;
    }

    const mapped = subjects.map((item, idx) => {
      const itemChapters = Array.isArray(item.chapters) ? item.chapters : [];
      const chapterCount = itemChapters.length;
      const partCount =
        itemChapters.length > 0
          ? Math.max(...itemChapters.map((c: any) => c.partNumber || 1))
          : 1;

      return {
        id: item.id || `subj-${idx}`,
        name: item.subjectName || "Unknown Subject",
        chapterCount,
        partCount,
        iconName: getIconForSubject(item.subjectCode, item.subjectName),
        colorVariant: getColorVariantForSubject(item.subjectCode, idx),
      };
    });

    console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): Mapped subject count: ${mapped.length}`);
    console.log("[SUBJECTS][SERVICE] fetchSubjectsList(): END");
    return mapped;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`[SUBJECTS][ERROR] Component: subjectsService | Function: fetchSubjectsList | Error message: ${errorMsg}`);
    console.log("[SUBJECTS][SERVICE] fetchSubjectsList backend failed. Falling back to local mock data.");
    const mockMapped = MOCK_SUBJECTS.map((s) => ({
      id: s.id,
      name: s.name,
      chapterCount: s.chapterCount,
      partCount: s.partCount,
      iconName: s.iconName,
      colorVariant: s.colorVariant,
    }));
    console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): Mapped subject count: ${mockMapped.length}`);
    console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): First mapped subject: ${JSON.stringify(mockMapped[0])}`);
    console.log("[SUBJECTS][SERVICE] fetchSubjectsList(): END");
    return mockMapped;
  }
}

export async function fetchSubjectWorkspace(
  subjectId: string,
  getToken?: GetToken
): Promise<SubjectWorkspacePayload> {
  console.log(`[SUBJECTS][SERVICE] fetchSubjectWorkspace(): START for subjectId=${subjectId}`);

  try {
    if (!getToken) {
      throw new Error("Authentication token is required to load subject workspace.");
    }

    const rawData = await mobileApi<LearningSnapshotResponse>("/student/learning-snapshot", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    let subjects: any[] = [];
    if (rawData && typeof rawData === "object") {
      if (rawData.snapshot && typeof rawData.snapshot === "object" && Array.isArray(rawData.snapshot.subjects)) {
        subjects = rawData.snapshot.subjects;
      } else if (Array.isArray((rawData as any).subjects)) {
        subjects = (rawData as any).subjects;
      } else if (rawData.snapshot && Array.isArray(rawData.snapshot)) {
        subjects = rawData.snapshot;
      } else {
        console.warn("[SUBJECTS][SERVICE] fetchSubjectWorkspace(): Payload structure is unexpected. Keys in rawData:", Object.keys(rawData));
      }
    } else {
      console.warn("[SUBJECTS][SERVICE] fetchSubjectWorkspace(): Raw data is nullish or not an object:", rawData);
    }

    if (subjects.length === 0) {
      throw new Error("No subjects validated from learning snapshot.");
    }

    const itemIdx = subjects.findIndex(
      (s) => s.id === subjectId || (s.subjectName && s.subjectName.toLowerCase() === subjectId.toLowerCase())
    );
    
    if (itemIdx < 0) {
      throw new Error(`Selected subject '${subjectId}' workspace not found on backend.`);
    }

    const item = subjects[itemIdx];
    const itemChapters = Array.isArray(item.chapters) ? item.chapters : [];
    const chapterCount = itemChapters.length;
    const partCount =
      itemChapters.length > 0
        ? Math.max(...itemChapters.map((c: any) => c.partNumber || 1))
        : 1;

    const subjectMeta: SubjectMeta = {
      id: item.id || subjectId,
      name: item.subjectName || "Unknown Subject",
      chapterCount,
      partCount,
      iconName: getIconForSubject(item.subjectCode, item.subjectName),
      colorVariant: getColorVariantForSubject(item.subjectCode, itemIdx),
    };

    const chapters: ChapterItem[] = itemChapters.map((ch: any, idx: number) => ({
      id: ch.id || `chap-${idx + 1}`,
      number: ch.chapterNumber || idx + 1,
      partNumber: ch.partNumber || 1,
      title: ch.chapterName || `Chapter ${ch.chapterNumber || idx + 1}`,
      subtitle: ch.partName || "Open this chapter for a focused student view.",
    }));

    console.log(`[SUBJECTS][SERVICE] fetchSubjectWorkspace(): Workspace loaded successfully with ${chapters.length} chapters.`);
    return {
      subject: subjectMeta,
      stats: {
        completedChapters: Math.floor(chapterCount * 0.4),
        totalChapters: chapterCount,
      },
      chapters,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`[SUBJECTS][ERROR] Component: subjectsService | Function: fetchSubjectWorkspace | Error message: ${errorMsg}`);
    console.log("[SUBJECTS][SERVICE] fetchSubjectWorkspace backend failed. Falling back to local mock workspace.");
    return getMockSubjectWorkspace(subjectId);
  }
}
