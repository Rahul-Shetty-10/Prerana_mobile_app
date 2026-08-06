import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResourceTabType } from "../../features/subjects/types";
import { SubjectProgressItem } from "../../features/profile/types";

export const MILESTONES_STORAGE_KEY = "@prerana_chapter_milestones";

export interface ChapterMilestones {
  chapterId: string;
  subjectId: string;
  infographicSeen?: boolean;
  mindmapSeen?: boolean;
  audioSeen?: boolean;
  quizCompleted?: boolean;
  quizScorePercent?: number;
  questionsSolvedCount?: number;
}

export async function getAllMilestones(): Promise<Record<string, ChapterMilestones>> {
  try {
    const json = await AsyncStorage.getItem(MILESTONES_STORAGE_KEY);
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
    await AsyncStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(all));
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
  const updates: Partial<ChapterMilestones> = {};
  if (milestone === "infographic") updates.infographicSeen = true;
  else if (milestone === "mindmap") updates.mindmapSeen = true;
  else if (milestone === "audio") updates.audioSeen = true;

  if (Object.keys(updates).length > 0) {
    await saveMilestones(chapterId, subjectId, updates);
  }
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

export async function isChapterCompleted(chapterId: string): Promise<boolean> {
  const all = await getAllMilestones();
  const m = all[chapterId];
  if (!m) return false;
  return !!(m.infographicSeen && m.mindmapSeen && m.audioSeen && m.quizCompleted);
}

export async function getCompletedChaptersCount(subjectId: string): Promise<number> {
  const all = await getAllMilestones();
  const normalized = normalizeSubjectId(subjectId);
  let count = 0;
  for (const m of Object.values(all)) {
    if (m.subjectId === normalized && m.infographicSeen && m.mindmapSeen && m.audioSeen && m.quizCompleted) {
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
      // Visited means at least one resource was opened
      if (m.infographicSeen || m.mindmapSeen || m.audioSeen || m.quizCompleted) {
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
    if (m.infographicSeen && m.mindmapSeen && m.audioSeen && m.quizCompleted) {
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
