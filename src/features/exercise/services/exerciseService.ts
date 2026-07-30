import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { ExerciseSessionPayload, QuestionItem, ReviewPayload, TrackType } from "../types";
import { MOCK_EXERCISE_EXPLORER, MOCK_REVIEW_DATA } from "../constants";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface RawChapterResourceResponse {
  id?: string;
  subjectName?: string;
  trackName?: string;
  trackType?: TrackType;
  title?: string;
  totalQuestions?: number;
  questions?: Array<{
    id: string;
    number?: number;
    type?: "mcq" | "match" | "true_false" | "fill_blank";
    prompt?: string;
    instructions?: string;
    mcqOptions?: Array<{ id: string; label: string; text: string }>;
    matchPairs?: Array<{ id: string; leftText: string; rightText: string }>;
    fillBlankPlaceholder?: string;
  }>;
}

export interface RawQuizAttemptResponse {
  subjectName?: string;
  trackName?: string;
  trackType?: TrackType;
  title?: string;
  questions?: Array<{
    id: string;
    number?: number;
    prompt?: string;
    typeLabel?: string;
    status?: "correct" | "incorrect" | "skipped";
    studentAnswer?: string;
    correctAnswer?: string;
    explanation?: string;
  }>;
}

export async function fetchExerciseSession(
  trackType: TrackType = "explorer",
  subjectId: string = "subj-science",
  chapterId: string = "chap-1",
  getToken?: GetToken
): Promise<ExerciseSessionPayload> {
  if (!getToken) {
    return {
      ...MOCK_EXERCISE_EXPLORER,
      trackType,
    };
  }

  try {
    const data = await mobileApi<RawChapterResourceResponse>(
      `/student/chapter-resources?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}&track=${encodeURIComponent(trackType)}`,
      {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      }
    );

    if (!data || !data.questions || data.questions.length === 0) {
      return {
        ...MOCK_EXERCISE_EXPLORER,
        trackType,
      };
    }

    const mappedQuestions: QuestionItem[] = data.questions.map((q, idx) => ({
      id: q.id || `q-${idx + 1}`,
      number: q.number || idx + 1,
      type: q.type || "mcq",
      prompt: q.prompt || "Question prompt",
      instructions: q.instructions || "Select or answer the following:",
      mcqOptions: q.mcqOptions,
      matchPairs: q.matchPairs,
      fillBlankPlaceholder: q.fillBlankPlaceholder,
      reorderItems: (q as any).reorderItems,
    }));

    return {
      id: data.id || `ex-${trackType}-${chapterId}`,
      subjectName: data.subjectName || "General Science",
      trackName: data.trackName || `${trackType.toUpperCase()} TRACK`,
      trackType: data.trackType || trackType,
      title: data.title || "Interactive Practice Session",
      totalQuestions: mappedQuestions.length,
      questions: mappedQuestions,
    };
  } catch (error) {
    return {
      ...MOCK_EXERCISE_EXPLORER,
      trackType,
    };
  }
}

export async function fetchQuizAttemptReview(
  attemptId: string,
  getToken?: GetToken
): Promise<ReviewPayload> {
  if (!getToken) {
    return MOCK_REVIEW_DATA;
  }

  try {
    const rawData = await mobileApi<RawQuizAttemptResponse>(
      `/student/quiz-attempts?attemptId=${encodeURIComponent(attemptId)}`,
      {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      }
    );

    if (!rawData || !rawData.questions || rawData.questions.length === 0) {
      return MOCK_REVIEW_DATA;
    }

    const mappedQuestions = rawData.questions.map((q, idx) => ({
      id: q.id || `rq-${idx + 1}`,
      number: q.number || idx + 1,
      prompt: q.prompt || "Question prompt",
      typeLabel: q.typeLabel || "Multiple Choice",
      status: q.status || "skipped",
      studentAnswer: q.studentAnswer || "Not answered",
      correctAnswer: q.correctAnswer || "A",
      explanation: q.explanation || "No explanation provided.",
    }));

    const correctCount = mappedQuestions.filter((q) => q.status === "correct").length;
    const incorrectCount = mappedQuestions.filter((q) => q.status === "incorrect").length;
    const skippedCount = mappedQuestions.filter((q) => q.status === "skipped").length;
    const totalQuestions = mappedQuestions.length;
    const accuracyPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return {
      subjectName: rawData.subjectName || "General Science",
      trackName: rawData.trackName || "Practice Set",
      trackType: rawData.trackType || "explorer",
      title: rawData.title || "Practice Review Session",
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracyPercent,
      questions: mappedQuestions,
    };
  } catch (error) {
    return MOCK_REVIEW_DATA;
  }
}

