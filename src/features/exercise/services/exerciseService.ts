import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { ExerciseSessionPayload, QuestionItem, QuestionType, ReviewPayload, TrackType } from "../types";

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
    const msg = httpErr instanceof Error ? httpErr.message : String(httpErr);
    console.warn(`[EXERCISE][fetchFundamentalsTrack] HTTP error for subjectSlug="${subjectSlug}", trackSlug="${trackSlug}":`, msg);
    throw new Error(`Questions for this track are not available yet. (${msg})`);
  }

  console.log("[EXERCISE][DEBUG] /student/fundamentals/track full response:", JSON.stringify(data, null, 2));

  // ── Step 1: Collect all raw questions ──────────────────────────────────────
  // Backend may return questions nested inside exercisePacks[] or at top level.
  let rawQuestions: any[] = [];

  function extractQuestions(obj: any): void {
    if (!obj || typeof obj !== "object") return;

    // If obj has an exercisePacks array, flatten questions from each pack
    if (Array.isArray(obj.exercisePacks)) {
      for (const pack of obj.exercisePacks) {
        if (Array.isArray(pack.questions)) {
          rawQuestions.push(...pack.questions);
        } else {
          // pack itself might have nested structure
          extractQuestions(pack);
        }
      }
      return;
    }

    // Direct questions array
    if (Array.isArray(obj.questions) && obj.questions.length > 0) {
      rawQuestions.push(...obj.questions);
      return;
    }

    // Recurse into known wrapper keys
    const wrapperKeys = ["track", "data", "result", "payload", "session"];
    for (const key of wrapperKeys) {
      if (obj[key] && typeof obj[key] === "object") {
        extractQuestions(obj[key]);
        if (rawQuestions.length > 0) return;
      }
    }
  }

  extractQuestions(data);

  console.log(`[EXERCISE][DEBUG] Extracted ${rawQuestions.length} raw questions`);
  if (rawQuestions.length > 0) {
    console.log("[EXERCISE][DEBUG] First raw question sample:", JSON.stringify(rawQuestions[0], null, 2));
  }

  if (rawQuestions.length === 0) {
    throw new Error("No questions are available for this track yet. Check back soon!");
  }

  // ── Step 2: Normalise backend field names to our QuestionItem schema ────────
  const normalizeType = (raw: any): QuestionType => {
    const kind = (raw.type || raw.exerciseKind || raw.kind || "").toLowerCase().replace(/[_\s-]/g, "");
    if (kind.includes("match")) return "match";
    if (kind.includes("fill") || kind.includes("blank")) return "fill_blank";
    if (kind.includes("sort") || kind.includes("reorder") || kind.includes("order")) return "reorder";
    if (kind.includes("truefalse") || kind.includes("true")) return "true_false";
    return "mcq";
  };

  const normalizeOptions = (raw: any): any[] | undefined => {
    // Common backend field names for MCQ options
    const opts = raw.mcqOptions || raw.options || raw.choices || raw.answers;
    if (!Array.isArray(opts)) return undefined;
    return opts.map((o: any, i: number) => ({
      id: o.id || o._id || `opt-${i}`,
      label: o.label || o.text || o.value || o.option || o.content || `Option ${i + 1}`,
      isCorrect: o.isCorrect ?? o.correct ?? false,
    }));
  };

  const normalizeMatchPairs = (raw: any): any[] | undefined => {
    const pairs = raw.matchPairs || raw.pairs || raw.matchItems || raw.matches;
    if (!Array.isArray(pairs)) return undefined;
    return pairs.map((p: any, i: number) => ({
      id: p.id || `pair-${i}`,
      left: p.left || p.term || p.question || p.a || `Item ${i + 1}`,
      right: p.right || p.definition || p.answer || p.b || `Match ${i + 1}`,
    }));
  };

  const mappedQuestions: QuestionItem[] = rawQuestions.map((q: any, idx: number) => ({
    id: q.id || q._id || `q-${idx + 1}`,
    number: q.number || q.questionNumber || q.order || idx + 1,
    type: normalizeType(q),
    // Common field names for question text
    prompt: q.prompt || q.stem || q.questionText || q.text || q.body || q.question || `Question ${idx + 1}`,
    instructions: q.instructions || q.hint || q.helpText || "Select or answer the following:",
    mcqOptions: normalizeOptions(q),
    matchPairs: normalizeMatchPairs(q),
    fillBlankPlaceholder: q.fillBlankPlaceholder || q.placeholder || q.blank,
    reorderItems: q.reorderItems || q.items || q.sortItems,
  }));

  // ── Step 3: Build session metadata ─────────────────────────────────────────
  const trackMeta = data.track || data.level || data;
  return {
    id: trackMeta.id || trackMeta.trackId || `ex-${trackSlug}-${subjectSlug}`,
    subjectName: trackMeta.subjectName || data.subjectName || "Subject",
    trackName: trackMeta.trackName || trackMeta.title || trackMeta.name || `${trackSlug.toUpperCase()} TRACK`,
    trackType: trackMeta.trackType || (trackSlug as TrackType),
    title: trackMeta.title || trackMeta.trackName || "Fundamentals Practice Session",
    totalQuestions: mappedQuestions.length,
    questions: mappedQuestions,
  };
}
