import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { FundamentalsDataPayload, SubjectItem } from "../types";
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
    const rawData = await mobileApi<LearningSnapshotResponse>("/student/learning-snapshot", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    if (!rawData || !rawData.subjects || !Array.isArray(rawData.subjects) || rawData.subjects.length === 0) {
      return fallbackPayload;
    }

    const rawSubjects = rawData.subjects;
    const totalSubjectCount = rawSubjects.length;

    let totalTrackCount = 0;
    const mappedSubjects: SubjectItem[] = rawSubjects.map((item, idx) => {
      const subjectTrackCount = item.chapters ? item.chapters.length : 0;
      totalTrackCount += subjectTrackCount;

      return {
        id: item.id,
        title: item.subjectName || "Subject",
        description: item.description || `Master foundational concepts in ${item.subjectName}.`,
        iconName: getIconForSubject(item.subjectCode, item.subjectName),
        previewBadgeText: getBadgeForSubject(item.subjectCode, item.subjectName),
        trackCount: subjectTrackCount,
        questionCount: subjectTrackCount > 0 ? subjectTrackCount * 30 : 150,
        colorVariant: getColorVariantForSubject(item.subjectCode, idx),
      };
    });

    return {
      subjectCount: totalSubjectCount,
      trackCount: totalTrackCount > 0 ? totalTrackCount : MOCK_FUNDAMENTALS_HEADER.trackCount,
      subjects: mappedSubjects.length > 0 ? mappedSubjects : MOCK_FUNDAMENTALS_SUBJECTS,
    };
  } catch (error) {
    return fallbackPayload;
  }
}

