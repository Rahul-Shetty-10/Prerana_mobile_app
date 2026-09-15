import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ResourceTabType } from "../../features/subjects/types/chapterResource.ts";
import type { SubjectProgressItem } from "../../features/profile/types/profile.ts";
import { getUserStorageKey } from "./userStorage.ts";

export const MILESTONES_STORAGE_KEY = "@prerana_chapter_milestones";

export async function clearAllMilestones(): Promise<void> {
  const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
  if (!storageKey) return;
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (e) {
    // Local progress cleanup is best-effort during logout.
  }
}

export interface ChapterMilestones {
  chapterId: string;
  subjectId: string;
  infographicSeen?: boolean;
  mindmapSeen?: boolean;
  slidedeckSeen?: boolean;
  textbookSeen?: boolean;
  flashcardsSeen?: boolean;
  tableSeen?: boolean;
  audioSeen?: boolean;
  videoSeen?: boolean;
  quizCompleted?: boolean;
  quizScorePercent?: number;
  questionsSolvedCount?: number;
  seenResources?: string[];
}

export async function getAllMilestones(): Promise<Record<string, ChapterMilestones>> {
  const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
  if (!storageKey) return {};
  try {
    const json = await AsyncStorage.getItem(storageKey);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    return {};
  }
}

export async function saveMilestones(
  chapterId: string,
  subjectId: string,
  updates: Partial<ChapterMilestones>
): Promise<ChapterMilestones> {
  try {
    const all = await getAllMilestones();
    const current = all[chapterId] || { chapterId, subjectId: normalizeSubjectId(subjectId) };
    const updated: ChapterMilestones = {
      ...current,
      ...updates,
      subjectId: normalizeSubjectId(updates.subjectId || current.subjectId),
    };
    all[chapterId] = updated;
    const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(all));
    return updated;
  } catch (e) {
    return { chapterId, subjectId, ...updates };
  }
}

export function normalizeSubjectId(id: string): string {
  const lower = id.toLowerCase();
  if (lower.includes("science")) return "subj-science";
  if (lower.includes("math")) return "subj-maths";
  if (lower.includes("english")) return "subj-english";
  if (lower.includes("hindi")) return "subj-hindi";
  if (lower.includes("kannada")) return "subj-kannada";
  if (lower.includes("social")) return "subj-social";
  if (lower.includes("cs") || lower.includes("computer")) return "subj-cs-11";
  return id;
}

export async function markMilestoneSeen(
  chapterId: string,
  subjectId: string,
  milestone: ResourceTabType
): Promise<void> {
  const all = await getAllMilestones();
  const current = all[chapterId] || { chapterId, subjectId: normalizeSubjectId(subjectId) };
  const seenSet = new Set<string>(current.seenResources || []);
  seenSet.add(milestone);

  const updates: Partial<ChapterMilestones> = {
    seenResources: Array.from(seenSet),
  };

  switch (milestone) {
    case "infographic":
      updates.infographicSeen = true;
      break;
    case "mindmap":
      updates.mindmapSeen = true;
      break;
    case "slidedeck":
      updates.slidedeckSeen = true;
      break;
    case "textbook":
      updates.textbookSeen = true;
      break;
    case "flashcards":
      updates.flashcardsSeen = true;
      break;
    case "table":
      updates.tableSeen = true;
      break;
    case "audio":
      updates.audioSeen = true;
      break;
    case "video":
      updates.videoSeen = true;
      break;
  }

  await saveMilestones(chapterId, subjectId, updates);
}

export async function markQuizCompleted(
  chapterId: string,
  subjectId: string,
  scorePercent: number,
  questionsSolved: number
): Promise<void> {
  await saveMilestones(chapterId, subjectId, {
    quizCompleted: true,
    quizScorePercent: scorePercent,
    questionsSolvedCount: questionsSolved,
  });
}

export function isMilestoneCompleted(m?: ChapterMilestones): boolean {
  if (!m) return false;
  const hasSeenAnyResource =
    Boolean(m.infographicSeen || m.mindmapSeen || m.slidedeckSeen || m.textbookSeen || m.flashcardsSeen || m.tableSeen || m.audioSeen || m.videoSeen) ||
    (Array.isArray(m.seenResources) && m.seenResources.length > 0);
  return Boolean(hasSeenAnyResource && m.quizCompleted);
}

export async function isChapterCompleted(chapterId: string): Promise<boolean> {
  const all = await getAllMilestones();
  const m = all[chapterId];
  return isMilestoneCompleted(m);
}

export async function getCompletedChaptersCount(subjectId: string): Promise<number> {
  const all = await getAllMilestones();
  const normalized = normalizeSubjectId(subjectId);
  let count = 0;
  for (const m of Object.values(all)) {
    if (m.subjectId === normalized && isMilestoneCompleted(m)) {
      count++;
    }
  }
  return count;
}

export async function getSeenChaptersCount(subjectId: string): Promise<number> {
  const all = await getAllMilestones();
  const normalized = normalizeSubjectId(subjectId);
  let count = 0;
  for (const m of Object.values(all)) {
    if (m.subjectId === normalized) {
      const hasSeenAny =
        Boolean(m.infographicSeen || m.mindmapSeen || m.slidedeckSeen || m.textbookSeen || m.flashcardsSeen || m.tableSeen || m.audioSeen || m.videoSeen || m.quizCompleted) ||
        (Array.isArray(m.seenResources) && m.seenResources.length > 0);
      if (hasSeenAny) {
        count++;
      }
    }
  }
  return count;
}

export interface CalculatedStats {
  overallAccuracy: number;
  questionsSolved: number;
  completedChaptersCount: number;
}

export async function getCalculatedStats(): Promise<CalculatedStats> {
  const all = await getAllMilestones();
  let totalScore = 0;
  let quizCount = 0;
  let questionsSolved = 0;
  let completedChaptersCount = 0;

  for (const m of Object.values(all)) {
    if (m.quizCompleted) {
      totalScore += m.quizScorePercent ?? 0;
      quizCount++;
      questionsSolved += m.questionsSolvedCount ?? 0;
    }
    if (isMilestoneCompleted(m)) {
      completedChaptersCount++;
    }
  }

  const overallAccuracy = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
  return {
    overallAccuracy,
    questionsSolved,
    completedChaptersCount,
  };
}

export async function mergeSubjectProgressWithLocal(
  progressList: SubjectProgressItem[]
): Promise<SubjectProgressItem[]> {
  const merged = await Promise.all(
    progressList.map(async (item) => {
      const completed = await getCompletedChaptersCount(item.id);
      const seen = await getSeenChaptersCount(item.id);
      // Use local completions if they are greater than or equal to backend completions
      const finalCompleted = Math.max(item.completedChapters, completed);
      const finalPercent = item.totalChapters > 0
        ? Math.round((finalCompleted / item.totalChapters) * 100)
        : item.progressPercent;
      return {
        ...item,
        completedChapters: finalCompleted,
        progressPercent: finalPercent,
        seenChapters: seen,
      };
    })
  );
  return merged;
}
