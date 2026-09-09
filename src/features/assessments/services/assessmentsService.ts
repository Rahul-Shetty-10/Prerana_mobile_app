import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  AssessmentHistoryPayload,
  QuizLandingPayload,
  QuizzesHomePayload,
} from "../types";
import {
  EMPTY_ASSESSMENT_HISTORY_DATA,
  EMPTY_QUIZ_LANDING_DATA,
  EMPTY_QUIZZES_HOME_DATA,
} from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export async function fetchQuizzesHomeData(getToken?: GetToken): Promise<QuizzesHomePayload> {
  if (!getToken) {
    throw new Error("Authentication is required to load quizzes.");
  }

  try {
    const rawData = await mobileApi<Partial<QuizzesHomePayload>>("/student/quizzes-home", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });


    return {
      hero: rawData.hero ?? EMPTY_QUIZZES_HOME_DATA.hero,
      quickActions: rawData.quickActions ?? EMPTY_QUIZZES_HOME_DATA.quickActions,
      inProgress: rawData.inProgress ?? EMPTY_QUIZZES_HOME_DATA.inProgress,
      awaitingReview: rawData.awaitingReview ?? EMPTY_QUIZZES_HOME_DATA.awaitingReview,
      readyToStart: rawData.readyToStart ?? EMPTY_QUIZZES_HOME_DATA.readyToStart,
      recentCompleted: rawData.recentCompleted ?? EMPTY_QUIZZES_HOME_DATA.recentCompleted,
    };
  } catch (error) {
    console.error("[ASSESSMENTS][SERVICE] fetchQuizzesHomeData error:", error);
    throw error;
  }
}

export async function fetchAssessmentHistoryData(
  getToken?: GetToken
): Promise<AssessmentHistoryPayload> {
  if (!getToken) {
    throw new Error("Authentication is required to load assessment history.");
  }

  try {
    const rawData = await mobileApi<Partial<AssessmentHistoryPayload>>("/student/assessment-history", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    return {
      hero: rawData.hero ?? EMPTY_ASSESSMENT_HISTORY_DATA.hero,
      scope: rawData.scope ?? EMPTY_ASSESSMENT_HISTORY_DATA.scope,
      recentAttempts: rawData.recentAttempts ?? EMPTY_ASSESSMENT_HISTORY_DATA.recentAttempts,
      inProgressAttempts:
        rawData.inProgressAttempts ?? EMPTY_ASSESSMENT_HISTORY_DATA.inProgressAttempts,
      availableQuizEntries:
        rawData.availableQuizEntries ?? EMPTY_ASSESSMENT_HISTORY_DATA.availableQuizEntries,
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchQuizLandingData(
  subjectId?: string,
  chapterId?: string,
  getToken?: GetToken
): Promise<QuizLandingPayload> {
  if (!getToken) {
    throw new Error("Authentication is required to load quiz information.");
  }

  try {
    const rawData = await mobileApi<any>(`/student/quiz-landing?subjectId=${subjectId}&chapterId=${chapterId}`, {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });


    return {
      chapterNumber: rawData.chapterNumber ?? EMPTY_QUIZ_LANDING_DATA.chapterNumber,
      chapterTitle: rawData.chapterTitle ?? EMPTY_QUIZ_LANDING_DATA.chapterTitle,
      subjectId: rawData.subjectId ?? subjectId ?? EMPTY_QUIZ_LANDING_DATA.subjectId,
      subjectName: rawData.subjectName ?? EMPTY_QUIZ_LANDING_DATA.subjectName,
      heroTitle: rawData.heroTitle ?? EMPTY_QUIZ_LANDING_DATA.heroTitle,
      heroSubtitle: rawData.heroSubtitle ?? EMPTY_QUIZ_LANDING_DATA.heroSubtitle,
    };
  } catch (error) {
    console.error("[ASSESSMENTS][SERVICE] fetchQuizLandingData error:", error);
    throw error;
  }
}
