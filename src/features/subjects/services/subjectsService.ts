import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { ChapterItem, SubjectMeta, SubjectWorkspacePayload } from "../types";
import { IconName } from "../../../shared/icons";
import { StatCardVariant } from "../../dashboard/types";

export class SubjectsError extends Error {
  constructor(public code: 'NETWORK_FAILURE' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'EMPTY_DATA', message: string) {
    super(message);
    this.name = 'SubjectsError';
  }
}

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
  if (code.includes("hin") || name.includes("hindi")) return "document-text-outline";
  if (code.includes("kan") || name.includes("kannada")) return "journal-outline";
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

  if (!getToken) {
    throw new SubjectsError('UNAUTHORIZED', 'Authentication token is required to load subjects.');
  }

  try {
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
        subjects = rawData.snapshot;
      } else {
        console.warn("[SUBJECTS][SERVICE] fetchSubjectsList(): Payload structure is unexpected. Keys in rawData:", Object.keys(rawData));
      }
    }

    const backendCount = subjects.length;
    console.log(`[SUBJECTS][SERVICE] fetchSubjectsList(): Validated backend subject count: ${backendCount}`);

    if (subjects.length === 0) {
      throw new SubjectsError('EMPTY_DATA', 'No subjects found or returned from the server.');
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
    console.error("[SUBJECTS][SERVICE] error in fetchSubjectsList:", error);
    if (error instanceof SubjectsError) throw error;
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("unauthenticated") || msg.includes("clerk token")) {
        throw new SubjectsError('UNAUTHORIZED', error.message);
      } else if (msg.includes("network") || msg.includes("fetch")) {
        throw new SubjectsError('NETWORK_FAILURE', error.message);
      }
    }
    throw new SubjectsError('SERVER_ERROR', 'Failed to fetch subjects list');
  }
}

export async function fetchSubjectWorkspace(
  subjectId: string,
  getToken?: GetToken
): Promise<SubjectWorkspacePayload> {
  console.log(`[SUBJECTS][SERVICE] fetchSubjectWorkspace(): START for subjectId=${subjectId}`);

  if (!getToken) {
    throw new SubjectsError('UNAUTHORIZED', 'Authentication token is required to load subject workspace.');
  }

  try {
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
    }

    if (subjects.length === 0) {
      throw new SubjectsError('EMPTY_DATA', 'No subjects found on backend.');
    }

    const itemIdx = subjects.findIndex(
      (s) => s.id === subjectId || (s.subjectName && s.subjectName.toLowerCase() === subjectId.toLowerCase())
    );
    
    if (itemIdx < 0) {
      throw new SubjectsError('SERVER_ERROR', `Selected subject '${subjectId}' workspace not found on backend.`);
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
        completedChapters: 0, // Set to 0 to avoid dummy content fabrication.
        totalChapters: chapterCount,
      },
      chapters,
    };
  } catch (error) {
    console.error("[SUBJECTS][SERVICE] error in fetchSubjectWorkspace:", error);
    if (error instanceof SubjectsError) throw error;
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("unauthenticated") || msg.includes("clerk token")) {
        throw new SubjectsError('UNAUTHORIZED', error.message);
      } else if (msg.includes("network") || msg.includes("fetch")) {
        throw new SubjectsError('NETWORK_FAILURE', error.message);
      }
    }
    throw new SubjectsError('SERVER_ERROR', 'Failed to fetch subject workspace');
  }
}
