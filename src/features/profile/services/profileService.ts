import AsyncStorage from "@react-native-async-storage/async-storage";
import { mobileApi } from "../../../api/mobileApi";
import { LearningStats, StudentInfo, SubjectProgressItem } from "../types";
import { clearLearningState } from "../../../shared/services/learningStateService";
import { clearAllMilestones } from "../../../shared/services/chapterProgressService";
import { clearAllAttemptsForUser } from "../../../shared/services/attemptTracker";
import { clearActiveLearningForUser } from "../../../shared/hooks/useActiveLearningTracker";
import { clearArcadeProfileForUser } from "../../arcade/services/profileService";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ProfileApiResponse {
  info?: {
    name?: string;
    fullName?: string;
    email?: string;
    enrollmentId?: string;
    studentClass?: string;
    board?: string;
    workspace?: string;
    avatarUrl?: string;
  };
  learningStats?: Partial<LearningStats>;
  subjectProgress?: SubjectProgressItem[];
}

export async function fetchProfileData(getToken?: GetToken) {
  if (!getToken) {
    throw new Error("Authentication is required to load profile data.");
  }

  try {
    const response = await mobileApi<ProfileApiResponse>("/student/profile", {
      getToken,
    });

    if (!response) {
      throw new Error("No profile data returned from the server.");
    }

    const info: StudentInfo = {
      name: response.info?.name || response.info?.fullName || "",
      email: response.info?.email || "",
      enrollmentId: response.info?.enrollmentId || "",
      studentClass: response.info?.studentClass || "",
      board: response.info?.board || "",
      workspace: response.info?.workspace || "",
      avatarUrl: response.info?.avatarUrl,
    };

    const learningStats: LearningStats = {
      overallAccuracy: response.learningStats?.overallAccuracy ?? 0,
      questionsSolved: response.learningStats?.questionsSolved ?? 0,
      studyHours: response.learningStats?.studyHours ?? 0,
      completedChapters: response.learningStats?.completedChapters ?? 0,
      completedSubjects: response.learningStats?.completedSubjects ?? 0,
      weeklyProgressPercent: response.learningStats?.weeklyProgressPercent ?? 0,
    };

    const subjectProgress = response.subjectProgress ?? [];

    return {
      info,
      learningStats,
      subjectProgress,
    };
  } catch (e) {
    throw e;
  }
}

/**
 * Perform complete local logout storage cleanup
 */
export async function performStudentSignOut(
  clerkSignOut?: () => Promise<void>,
  userId?: string | null,
): Promise<void> {
  try {
    await Promise.allSettled([
      AsyncStorage.removeItem("@prerana_session"),
      clearLearningState(),
      clearAllMilestones(),
      userId ? clearAllAttemptsForUser(userId) : Promise.resolve(),
      userId ? clearActiveLearningForUser(userId) : Promise.resolve(),
      userId ? clearArcadeProfileForUser(userId) : Promise.resolve(),
    ]);

    if (clerkSignOut) {
      await clerkSignOut();
    }
  } catch (e) {
    if (clerkSignOut) {
      await clerkSignOut();
    }
  }
}
