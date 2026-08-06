import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { ExerciseSessionPayload, QuestionItem, ReviewPayload, TrackType } from "../types";

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
    throw new Error("Authentication required. Please sign in.");
  }

  const data = await mobileApi<RawChapterResourceResponse>(
    `/student/chapter-resources?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}&track=${encodeURIComponent(trackType)}`,
    {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    }
  );

  if (!data || !data.questions || data.questions.length === 0) {
    throw new Error("No questions found for this chapter.");
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
}

export async function fetchQuizAttemptReview(
  attemptId: string,
  getToken?: GetToken
): Promise<ReviewPayload> {
  if (!getToken) {
    throw new Error("Authentication required. Please sign in.");
  }

  const rawData = await mobileApi<RawQuizAttemptResponse>(
    `/student/quiz-attempts?attemptId=${encodeURIComponent(attemptId)}`,
    {
      getToken,
      tenantSlug: appConfig.tenantSlug,
    }
  );

  if (!rawData || !rawData.questions || rawData.questions.length === 0) {
    throw new Error("No review data found for this quiz attempt.");
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
}

export async function fetchFundamentalsTrack(
  subjectSlug: string,
  trackSlug: string,
  getToken?: GetToken
): Promise<ExerciseSessionPayload> {
  if (!getToken) {
    throw new Error("Authentication required. Please sign in.");
  }

  console.log(`[EXERCISE][fetchFundamentalsTrack] Fetching: subjectSlug="${subjectSlug}", trackSlug="${trackSlug}"`);

  let data: any;
  try {
    data = await mobileApi<any>(
      `/student/fundamentals/track?subjectSlug=${encodeURIComponent(subjectSlug)}&trackSlug=${encodeURIComponent(trackSlug)}`,
      {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      }
    );
  } catch (httpErr) {
    // The backend returned a non-ok response (e.g. 404, 500). Surface a clean message.
    const msg = httpErr instanceof Error ? httpErr.message : String(httpErr);
    console.warn(`[EXERCISE][fetchFundamentalsTrack] HTTP error for subjectSlug="${subjectSlug}", trackSlug="${trackSlug}":`, msg);
    throw new Error(`Questions for this track are not available yet. (${msg})`);
  }

  console.log("[EXERCISE][DEBUG] /student/fundamentals/track response:", JSON.stringify(data));

  let questionsList: any[] = [];

  function findQuestionsArray(obj: any): any[] | null {
    if (!obj || typeof obj !== "object") return null;
    if (Array.isArray(obj)) return obj;

    const keys = Object.keys(obj);
    const preferredKeys = ["questions", "data", "snapshot", "track"];
    const sortedKeys = [...keys].sort((a, b) => {
      const idxA = preferredKeys.indexOf(a);
      const idxB = preferredKeys.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    for (const key of sortedKeys) {
      const val = obj[key];
      if (Array.isArray(val)) {
        return val;
      }
      if (val && typeof val === "object") {
        const found = findQuestionsArray(val);
        if (found) return found;
      }
    }
    return null;
  }

  const foundArray = findQuestionsArray(data);
  if (foundArray) {
    questionsList = foundArray;
  }

  if (!questionsList || questionsList.length === 0) {
    throw new Error("No questions are available for this track yet. Check back soon!");
  }

  const mappedQuestions: QuestionItem[] = questionsList.map((q, idx) => ({
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
    id: data.id || `ex-${trackSlug}-${subjectSlug}`,
    subjectName: data.subjectName || "Subject",
    trackName: data.trackName || `${trackSlug.toUpperCase()} TRACK`,
    trackType: data.trackType || (trackSlug as TrackType),
    title: data.title || "Fundamentals Practice Session",
    totalQuestions: mappedQuestions.length,
    questions: mappedQuestions,
  };
}
