import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  AssessmentHistoryPayload,
  QuizLandingPayload,
  QuizzesHomePayload,
} from "../types";
import {
  MOCK_ASSESSMENT_HISTORY_DATA,
  MOCK_QUIZ_LANDING_DATA,
  MOCK_QUIZZES_HOME_DATA,
} from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export async function fetchQuizzesHomeData(getToken?: GetToken): Promise<QuizzesHomePayload> {
  if (!getToken) {
    return MOCK_QUIZZES_HOME_DATA;
  }

  try {
    const rawData = await mobileApi<Partial<QuizzesHomePayload>>("/student/quizzes-home", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    return {
      hero: rawData.hero ?? MOCK_QUIZZES_HOME_DATA.hero,
      quickActions: rawData.quickActions ?? MOCK_QUIZZES_HOME_DATA.quickActions,
      inProgress: rawData.inProgress ?? MOCK_QUIZZES_HOME_DATA.inProgress,
      awaitingReview: rawData.awaitingReview ?? MOCK_QUIZZES_HOME_DATA.awaitingReview,
      readyToStart: rawData.readyToStart ?? MOCK_QUIZZES_HOME_DATA.readyToStart,
      recentCompleted: rawData.recentCompleted ?? MOCK_QUIZZES_HOME_DATA.recentCompleted,
    };
  } catch (error) {
    return MOCK_QUIZZES_HOME_DATA;
  }
}

export async function fetchAssessmentHistoryData(
  getToken?: GetToken
): Promise<AssessmentHistoryPayload> {
  if (!getToken) {
    return MOCK_ASSESSMENT_HISTORY_DATA;
  }

  try {
    const rawData = await mobileApi<Partial<AssessmentHistoryPayload>>("/student/assessment-history", {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    return {
      hero: rawData.hero ?? MOCK_ASSESSMENT_HISTORY_DATA.hero,
      scope: rawData.scope ?? MOCK_ASSESSMENT_HISTORY_DATA.scope,
      recentAttempts: rawData.recentAttempts ?? MOCK_ASSESSMENT_HISTORY_DATA.recentAttempts,
      inProgressAttempts:
        rawData.inProgressAttempts ?? MOCK_ASSESSMENT_HISTORY_DATA.inProgressAttempts,
      availableQuizEntries:
        rawData.availableQuizEntries ?? MOCK_ASSESSMENT_HISTORY_DATA.availableQuizEntries,
    };
  } catch (error) {
    return MOCK_ASSESSMENT_HISTORY_DATA;
  }
}

export async function fetchQuizLandingData(
  subjectId?: string,
  chapterId?: string,
  getToken?: GetToken
): Promise<QuizLandingPayload> {
  if (!getToken) {
    return MOCK_QUIZ_LANDING_DATA;
  }

  try {
    const rawData = await mobileApi<Partial<QuizLandingPayload>>(`/student/quiz-landing?subjectId=${subjectId}&chapterId=${chapterId}`, {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    });

    return {
      chapterNumber: rawData.chapterNumber ?? MOCK_QUIZ_LANDING_DATA.chapterNumber,
      chapterTitle: rawData.chapterTitle ?? MOCK_QUIZ_LANDING_DATA.chapterTitle,
      subjectId: rawData.subjectId ?? subjectId ?? MOCK_QUIZ_LANDING_DATA.subjectId,
      subjectName: rawData.subjectName ?? MOCK_QUIZ_LANDING_DATA.subjectName,
      heroTitle: rawData.heroTitle ?? MOCK_QUIZ_LANDING_DATA.heroTitle,
      heroSubtitle: rawData.heroSubtitle ?? MOCK_QUIZ_LANDING_DATA.heroSubtitle,
    };
  } catch (error) {
    return MOCK_QUIZ_LANDING_DATA;
  }
}
