import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ResourceTabType } from "../../features/subjects/types/chapterResource.ts";
import type { SubjectProgressItem } from "../../features/profile/types/profile.ts";
import { getUserStorageKey } from "./userStorage.ts";

export const MILESTONES_STORAGE_KEY = "@prerana_chapter_milestones";

let memoryMilestonesCache: Record<string, Record<string, ChapterMilestones>> = {};

export async function clearAllMilestones(): Promise<void> {
  const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
  if (!storageKey) return;
  delete memoryMilestonesCache[storageKey];
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
  /**
   * The resource types this chapter actually offered, recorded the first time
   * the chapter's resources loaded. Screens that have no chapter list of their
   * own (Dashboard, Profile) read it so their completion count matches the
   * subject workspace exactly. Absent for chapters last opened by an older
   * build, which fall back to the legacy rule below.
   */
  availableResources?: ResourceTabType[];
  /**
   * Whether this chapter offers a quiz at all, recorded alongside
   * `availableResources`. Chapters with no quiz complete on their resources
   * alone; requiring a quiz that cannot be started would leave them
   * permanently incomplete. Absent for chapters last opened by an older
   * build, which keep requiring the quiz.
   */
  quizAvailable?: boolean;
}

export async function getAllMilestones(): Promise<Record<string, ChapterMilestones>> {
  const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
  if (!storageKey) return {};
  try {
    const json = await AsyncStorage.getItem(storageKey);
    if (json) {
      const parsed = JSON.parse(json);
      memoryMilestonesCache[storageKey] = parsed;
      return parsed;
    }
    return memoryMilestonesCache[storageKey] || {};
  } catch (e) {
    return memoryMilestonesCache[storageKey] || {};
  }
}

export async function saveMilestones(
  chapterId: string,
  subjectId: string,
  updates: Partial<ChapterMilestones>
): Promise<ChapterMilestones> {
  const storageKey = getUserStorageKey(MILESTONES_STORAGE_KEY);
  try {
    const all = await getAllMilestones();
    const current = all[chapterId] || { chapterId, subjectId: normalizeSubjectId(subjectId) };
    const updated: ChapterMilestones = {
      ...current,
      ...updates,
      subjectId: normalizeSubjectId(updates.subjectId || current.subjectId),
    };
    all[chapterId] = updated;
    if (storageKey) {
      memoryMilestonesCache[storageKey] = all;
      await AsyncStorage.setItem(storageKey, JSON.stringify(all));
    }
    return updated;
  } catch (e) {
    const current = (storageKey && memoryMilestonesCache[storageKey]?.[chapterId]) || {
      chapterId,
      subjectId: normalizeSubjectId(subjectId),
    };
    const updated: ChapterMilestones = {
      ...current,
      ...updates,
      subjectId: normalizeSubjectId(updates.subjectId || current.subjectId),
    };
    if (storageKey) {
      if (!memoryMilestonesCache[storageKey]) memoryMilestonesCache[storageKey] = {};
      memoryMilestonesCache[storageKey][chapterId] = updated;
    }
    return updated;
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

/**
 * Records which resources a chapter offers, so chapter completion can be
 * evaluated identically on every screen. Only rewrites storage when the list
 * actually changes, since this is called each time a chapter's resources load.
 */
export async function recordAvailableResources(
  chapterId: string,
  subjectId: string,
  availableResources: ResourceTabType[],
  quizAvailable: boolean
): Promise<void> {
  if (availableResources.length === 0) return;

  const all = await getAllMilestones();
  const current = all[chapterId];
  const previous = current?.availableResources;
  if (
    previous &&
    previous.length === availableResources.length &&
    previous.every((type, index) => type === availableResources[index]) &&
    current?.quizAvailable === quizAvailable
  ) {
    return;
  }

  await saveMilestones(chapterId, subjectId, { availableResources, quizAvailable });
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

export function extractChapterResourceTypes(ch: any): ResourceTabType[] | undefined {
  if (!ch || typeof ch !== "object") return undefined;
  if (Array.isArray(ch.resourceTypes) && ch.resourceTypes.length > 0) {
    return ch.resourceTypes;
  }
  if (Array.isArray(ch.availableResources) && ch.availableResources.length > 0) {
    return ch.availableResources;
  }
  if (Array.isArray(ch.resources) && ch.resources.length > 0) {
    const types: ResourceTabType[] = [];
    for (const r of ch.resources) {
      const type = typeof r === "string" ? r : r?.type;
      if (type && !types.includes(type as ResourceTabType)) {
        types.push(type as ResourceTabType);
      }
    }
    if (types.length > 0) return types;
  }
  if (ch.resources && typeof ch.resources === "object") {
    const types: ResourceTabType[] = [];
    if (ch.resources.infographicUrl || ch.resources.infographic) types.push("infographic");
    if (ch.resources.mindmapUrl || ch.resources.mindmapRoot || ch.resources.mindmap) types.push("mindmap");
    if (ch.resources.slidedeckUrl || ch.resources.slidedeck) types.push("slidedeck");
    if (ch.resources.textbookNotesUrl || ch.resources.textbookUrl || ch.resources.textbook) types.push("textbook");
    if (ch.resources.flashcards && Array.isArray(ch.resources.flashcards) && ch.resources.flashcards.length > 0) types.push("flashcards");
    if (ch.resources.tableColumns || ch.resources.table) types.push("table");
    if (ch.resources.audioUrl || ch.resources.audio) types.push("audio");
    if (ch.resources.videoUrl || ch.resources.video) types.push("video");
    if (types.length > 0) return types;
  }
  return undefined;
}

export function isMilestoneCompleted(
  m?: ChapterMilestones,
  availableResources?: (ResourceTabType | string)[]
): boolean {
  if (!m) return false;

  // A chapter the backend offers no quiz for must still be completable, or it
  // stays permanently unfinished. Milestones written before this was recorded
  // leave the field undefined and keep requiring the quiz.
  const quizRequired = m.quizAvailable !== false;
  if (quizRequired && !m.quizCompleted) return false;

  // Prefer the caller's list (the subject workspace has one), then the list
  // recorded on the chapter itself. Screens without a chapter list therefore
  // apply exactly the same requirement instead of a looser one.
  const resourceRequirement = availableResources ?? m.availableResources;

  const validResources = resourceRequirement
    ? resourceRequirement.filter((r) => r !== "arcade" && r !== "quiz")
    : undefined;

  if (validResources && validResources.length > 0) {
    const seenSet = new Set(m.seenResources || []);
    const isSeen = (type: ResourceTabType | string) => {
      switch (type) {
        case "infographic":
          return Boolean(m.infographicSeen);
        case "mindmap":
          return Boolean(m.mindmapSeen);
        case "slidedeck":
          return Boolean(m.slidedeckSeen);
        case "textbook":
          return Boolean(m.textbookSeen);
        case "flashcards":
          return Boolean(m.flashcardsSeen);
        case "table":
          return Boolean(m.tableSeen);
        case "audio":
          return Boolean(m.audioSeen);
        case "video":
          return Boolean(m.videoSeen);
        default:
          return seenSet.has(type);
      }
    };
    return validResources.every((res) => isSeen(res) || seenSet.has(res));
  }

  const hasSeenAnyResource =
    Boolean(
      m.infographicSeen ||
        m.mindmapSeen ||
        m.slidedeckSeen ||
        m.textbookSeen ||
        m.flashcardsSeen ||
        m.tableSeen ||
        m.audioSeen ||
        m.videoSeen
    ) || (Array.isArray(m.seenResources) && m.seenResources.length > 0);
  return hasSeenAnyResource;
}

export async function isChapterCompleted(
  chapterId: string,
  availableResources?: (ResourceTabType | string)[]
): Promise<boolean> {
  const all = await getAllMilestones();
  const m = all[chapterId];
  return isMilestoneCompleted(m, availableResources);
}

export async function getCompletedChaptersCount(
  subjectId: string,
  chapters?: { id: string; resourceTypes?: (ResourceTabType | string)[] }[]
): Promise<number> {
  const normalized = normalizeSubjectId(subjectId);
  if (chapters && chapters.length > 0) {
    let count = 0;
    for (const ch of chapters) {
      const isComp = await isChapterCompleted(ch.id, ch.resourceTypes);
      if (isComp) count++;
    }
    return count;
  }

  const all = await getAllMilestones();
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
