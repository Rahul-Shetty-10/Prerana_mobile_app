import AsyncStorage from "@react-native-async-storage/async-storage";
import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { MOCK_LEARNING_STATS, MOCK_STUDENT_INFO, MOCK_SUBJECT_PROGRESS } from "../constants";
import { LearningStats, StudentInfo, SubjectProgressItem } from "../types";
import { clearLearningState } from "../../../shared/services/learningStateService";

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
  const fallback = {
    info: MOCK_STUDENT_INFO,
    learningStats: MOCK_LEARNING_STATS,
    subjectProgress: MOCK_SUBJECT_PROGRESS,
  };

  if (!getToken) {
    return fallback;
  }

  try {
    const response = await mobileApi<ProfileApiResponse>("/student/profile", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    if (!response) {
      return fallback;
    }

    const info: StudentInfo = {
      name: response.info?.name || response.info?.fullName || MOCK_STUDENT_INFO.name,
      email: response.info?.email || MOCK_STUDENT_INFO.email,
      enrollmentId: response.info?.enrollmentId || MOCK_STUDENT_INFO.enrollmentId,
      studentClass: response.info?.studentClass || MOCK_STUDENT_INFO.studentClass,
      board: response.info?.board || MOCK_STUDENT_INFO.board,
      workspace: response.info?.workspace || MOCK_STUDENT_INFO.workspace,
      avatarUrl: response.info?.avatarUrl || MOCK_STUDENT_INFO.avatarUrl,
    };

    const learningStats: LearningStats = {
      overallAccuracy: response.learningStats?.overallAccuracy ?? 0,
      questionsSolved: response.learningStats?.questionsSolved ?? 0,
      studyHours: response.learningStats?.studyHours ?? 0,
      completedChapters: response.learningStats?.completedChapters ?? 0,
      completedSubjects: response.learningStats?.completedSubjects ?? 0,
      weeklyProgressPercent: response.learningStats?.weeklyProgressPercent ?? 0,
    };

    const subjectProgress =
      response.subjectProgress && response.subjectProgress.length > 0
        ? response.subjectProgress
        : MOCK_SUBJECT_PROGRESS;

    return {
      info,
      learningStats,
      subjectProgress,
    };
  } catch (e) {
    return fallback;
  }
}

/**
 * Perform complete local logout storage cleanup
 */
export async function performStudentSignOut(clerkSignOut?: () => Promise<void>): Promise<void> {
  try {
    // 1. Clear AsyncStorage (learning state, theme, session caches)
    await AsyncStorage.clear();

    // 2. Clear learning state helper
    await clearLearningState();

    // 3. Perform Clerk Sign Out if available
    if (clerkSignOut) {
      await clerkSignOut();
    }
  } catch (e) {
    // Fallback sign out call
    if (clerkSignOut) {
      await clerkSignOut();
    }
  }
}
