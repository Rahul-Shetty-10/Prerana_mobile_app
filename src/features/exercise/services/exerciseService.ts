import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { getMobileSession } from "../../../shared/session/sessionStore";
import {
  ExerciseResultData,
  ExerciseSessionPayload,
  MCQOption,
  MatchPair,
  QuestionItem,
  QuestionType,
  ReviewPayload,
  ReviewQuestionItem,
  ReviewStatus,
  TrackType,
} from "../types";
import { resolveQuizId } from "./quizIdResolver";

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

const mapBackendTypeToFrontendType = (type: string): QuestionType => {
  const t = type.toLowerCase().replace(/[_\s-]/g, "");
  if (t === "matchfollowing" || t === "match") return "match";
  if (t === "truefal" || t === "truefalse" || t === "true_false") return "true_false";
  if (t === "fillblank" || t === "fillinthblank" || t === "fill_blank") return "fill_blank";
  if (t === "reorder" || t === "reordersequence" || t === "sort") return "reorder";
  // mcq_multi treated as standard mcq in mobile UI
  return "mcq";
};

/**
 * Maps a single question object from the GET /api/mobile/v1/student/quiz-attempts
 * (no questionId) response into a QuestionItem.
 *
 * The backend question shape (confirmed from API):
 *   { _id, questionText, questionType, options: { choices[]|leftItems[]|rightItems[]|items[] },
 *     correctAnswer: { choiceId|pairs[]|... }, explanation }
 */
export function mapBackendQuestionToQuestionItem(backendPayload: any, number: number): QuestionItem {
  // The GET /quiz-attempts response wraps the question under a `question` key:
  // { isSkipped, order, marks, question: { _id, questionText, ... } }
  // Fall back to using the payload itself if there's no `question` wrapper.
  const q = backendPayload?.question ?? backendPayload;

  const rawType: string = q?.questionType || q?.type || "";
  const qType = mapBackendTypeToFrontendType(rawType);

  // --- MCQ options (includes mcq_multi) ---
  let mcqOptions: MCQOption[] | undefined;
  if (qType === "mcq") {
    const choices: any[] = q?.options?.choices ?? q?.choices ?? [];
    // correctAnswer may be { choiceId } or { choiceIds: [] } for multi
    const correctChoiceId: string =
      q?.correctAnswer?.choiceId ?? q?.correctAnswer?.id ?? "";
    const correctChoiceIds: string[] =
      Array.isArray(q?.correctAnswer?.choiceIds) ? q.correctAnswer.choiceIds : [];
    mcqOptions = choices.map((c: any, i: number) => ({
      id: c.id,
      label: String.fromCharCode(65 + i),
      text: c.text ?? "",
      isCorrect:
        correctChoiceIds.length > 0
          ? correctChoiceIds.includes(c.id)
          : c.id === correctChoiceId,
    }));
  }

  // --- Match pairs ---
  let matchPairs: MatchPair[] | undefined;
  if (qType === "match") {
    const leftItems: any[] = q?.options?.leftItems ?? q?.leftItems ?? [];
    const rightItems: any[] = q?.options?.rightItems ?? q?.rightItems ?? [];
    const correctPairs: Array<{ leftId: string; rightId: string }> =
      q?.correctAnswer?.pairs ?? [];
    const correctMap = new Map<string, string>();
    for (const pair of correctPairs) {
      correctMap.set(pair.leftId, pair.rightId);
    }
    matchPairs = leftItems.map((left: any) => {
      const correctRightId = correctMap.get(left.id);
      const right = rightItems.find((r: any) => r.id === correctRightId);
      return {
        id: left.id,
        leftText: left.text ?? left.id,
        rightText: right?.text ?? correctRightId ?? left.id,
      };
    });
  }

  // --- Reorder / sort items ---
  const reorderItems: Array<{ id: string; text: string }> | undefined =
    (qType === "reorder")
      ? (q?.options?.items ?? q?.options?.reorderItems ?? q?.reorderItems)
      : undefined;

  const result: QuestionItem = {
    id: q?._id ?? q?.id ?? `q-${number}`,
    number,
    type: qType,
    prompt: q?.questionText ?? q?.prompt ?? "",
    instructions:
      q?.instructions ??
      (qType === "match" ? "Match the corresponding items:" : undefined),
    mcqOptions,
    matchPairs,
    fillBlankPlaceholder:
      q?.options?.placeholder ?? q?.options?.blank ?? undefined,
    reorderItems,
    correctAnswer: q?.correctAnswer,
    explanation: q?.explanation ?? undefined,
    isLoaded: true,
    _rawBackendPayload: backendPayload,
  };

  return result;
}

/**
 * Fetches ALL quiz questions for an in-progress attempt in a single GET request.
 *
 * Calls GET /api/mobile/v1/student/quiz-attempts?attemptId={id} — WITHOUT a
 * questionId parameter — which returns the full list of questions with their
 * content regardless of submission state.
 *
 * Returns the sorted `questions` array from data.result.questions.
 */
export async function fetchAllQuizQuestions(
  attemptId: string,
  token: string
): Promise<any[]> {
  const getUrl = `${appConfig.apiBaseUrl}/student/quiz-attempts?attemptId=${encodeURIComponent(attemptId)}`;

  const getRes = await fetch(getUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Slug": getMobileSession()?.tenantSlug ?? "",
    },
  });

  let bodyText = "";
  try {
    bodyText = await getRes.text();
  } catch (_) {
    bodyText = "";
  }

  if (!getRes.ok) {
    console.error(
      `[QUIZ][QUESTIONS_GET_ERROR] status=${getRes.status} url=${getUrl} body=${bodyText.slice(0, 400)}`
    );
    throw new Error(`Failed to load quiz questions. Status: ${getRes.status}`);
  }

  const payload = JSON.parse(bodyText);
  // Response shape: { ok, data: { result: { attempt: {...}, questions: [{isSkipped, order, question:{...}}] } } }
  const questions: any[] = payload?.data?.result?.questions ?? [];
  // Sort by order field to ensure correct display order
  questions.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  return questions;
}


export interface ExerciseSessionResponse {
  session: ExerciseSessionPayload;
  attemptId: string;
  questionOrder: string[];
  quizId: string;
}

export async function fetchExerciseSession(
  trackType: TrackType = "explorer",
  subjectId: string = "subj-science",
  chapterId: string = "chap-1",
  getToken?: GetToken,
  quizStartTime: number = Date.now()
): Promise<ExerciseSessionResponse> {
  if (!getToken) {
    throw new Error("Authentication required. Please sign in.");
  }

  console.log(`[EXERCISE][SERVICE] fetchExerciseSession started: subjectId='${subjectId}', chapterId='${chapterId}'`);

  // /api/mobile/v1 routes require the convex-template JWT
  // /api/student/* web routes require the raw Clerk session token (no template)
  const activeTokenNormal = await getToken({ template: "convex" });
  if (!activeTokenNormal) {
    throw new Error("Unable to retrieve authentication token.");
  }

  // Obtain the raw Clerk session token for web student API routes
  const activeTokenSession = await getToken();
  if (!activeTokenSession) {
    throw new Error("Unable to retrieve session token. Please sign in again.");
  }

  console.log(`[PERF][QUIZ] Quiz start`);

  // Step 1: Resolve the quizId for this chapter
  const quizId = resolveQuizId(chapterId);
  console.log(`[PERF][QUIZ] Quiz ID resolved`);

  // Step 2: Create or ensure a quiz attempt.
  // /api/student/quiz-attempts is a web student route authenticated via the raw
  // Clerk session token (no Convex template). It does NOT go through /api/mobile/v1.
  const baseUrl = appConfig.apiBaseUrl.replace("/api/mobile/v1", "");
  const attemptRes = await fetch(`${baseUrl}/api/student/quiz-attempts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${activeTokenSession}`,
      "Content-Type": "application/json",
      "X-Tenant-Slug": getMobileSession()?.tenantSlug ?? "",
    },
    body: JSON.stringify({
      intent: "ensure",
      tenant: getMobileSession()?.tenantSlug ?? "",
      quizId,
      questionCount: 45,
    }),
  });

  if (!attemptRes.ok) {
    const errText = await attemptRes.text().catch(() => "");
    console.error(`[PERF][QUIZ] Attempt creation failed: status=${attemptRes.status} body=${errText.slice(0, 200)}`);
    throw new Error(`Unable to start the quiz right now. Please try again. (status: ${attemptRes.status})`);
  }

  console.log(`[PERF][QUIZ] Attempt created: ${Date.now() - quizStartTime}ms`);

  const attemptData = await attemptRes.json();
  const attemptId: string | undefined =
    attemptData?.attemptId ?? attemptData?.id ?? attemptData?.attempt?._id;
  const questionOrder: string[] | undefined = attemptData?.questionOrder;

  if (!attemptId) {
    throw new Error("Unable to start the quiz right now. Please try again. (missing attemptId)");
  }
  if (!questionOrder || !Array.isArray(questionOrder) || questionOrder.length === 0) {
    throw new Error("No quiz questions are available for this chapter yet. Please check back soon.");
  }

  console.log(`[PERF][QUIZ] Attempt created — attemptId=${attemptId} questions=${questionOrder.length}`);

  // Step 3: Fetch ALL questions at once.
  // GET /api/mobile/v1/student/quiz-attempts?attemptId={id} (NO questionId) returns
  // the full question list including content for unanswered (skipped) questions.
  const rawQuestions = await fetchAllQuizQuestions(attemptId, activeTokenNormal);
  console.log(`[PERF][QUIZ] All questions loaded: ${Date.now() - quizStartTime}ms (count=${rawQuestions.length})`);

  if (rawQuestions.length === 0) {
    throw new Error("No quiz questions are available for this chapter yet. Please check back soon.");
  }

  // Step 4: Map raw question items to QuestionItem and build the session.
  const mappedQuestions = rawQuestions.map((rawQ: any, idx: number) =>
    mapBackendQuestionToQuestionItem(rawQ, idx + 1)
  );

  const initialSession: ExerciseSessionPayload = {
    id: attemptId,
    subjectName: "General Science",
    trackName: "Chapter Quiz",
    trackType,
    title: "Chapter Test",
    totalQuestions: mappedQuestions.length,
    questions: mappedQuestions,
  };

  return {
    session: initialSession,
    attemptId,
    questionOrder,
    quizId,
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
    }
  );

  if (!rawData || !rawData.questions || rawData.questions.length === 0) {
    throw new Error("No review data found for this quiz attempt.");
  }

  const mappedQuestions = rawData.questions.map((q: any, idx: number) => ({
    id: q.id || `rq-${idx + 1}`,
    number: q.number || idx + 1,
    prompt: q.prompt || "Question prompt",
    typeLabel: q.typeLabel || "Multiple Choice",
    status: q.status || "skipped",
    studentAnswer: q.studentAnswer || "Not answered",
    correctAnswer: q.correctAnswer || "A",
    explanation: q.explanation || "No explanation provided.",
  }));

  const correctCount = mappedQuestions.filter((q: any) => q.status === "correct").length;
  const incorrectCount = mappedQuestions.filter((q: any) => q.status === "incorrect").length;
  const skippedCount = mappedQuestions.filter((q: any) => q.status === "skipped").length;
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

  let data: any;
  try {
    data = await mobileApi<any>(
      `/student/fundamentals/track?subjectSlug=${encodeURIComponent(subjectSlug)}&trackSlug=${encodeURIComponent(trackSlug)}`,
      { getToken }
    );
  } catch (httpErr) {
    const msg = httpErr instanceof Error ? httpErr.message : String(httpErr);
    console.warn(`[EXERCISE][fetchFundamentalsTrack] HTTP error for subjectSlug="${subjectSlug}", trackSlug="${trackSlug}":`, msg);
    throw new Error(`Questions for this track are not available yet. (${msg})`);
  }

  // ── Step 1: Extract raw pack-questions from data.track.packs[].questions[] ──
  // Backend shape: { track: { packs: [{ packType, questions: [{ order, question: { id, questionText, questionType, options, correctAnswer } }] }] } }
  const trackObj = data?.track ?? data;
  const packs: any[] = Array.isArray(trackObj?.packs) ? trackObj.packs : [];

  interface RawPackQuestion {
    order: number;
    marks: number;
    packType: string;
    question: any;
  }

  const rawPackQuestions: RawPackQuestion[] = [];
  for (const pack of packs) {
    const packType: string = pack.packType || pack.packKey || "mcq";
    if (Array.isArray(pack.questions)) {
      for (const pq of pack.questions) {
        rawPackQuestions.push({
          order: pq.order ?? rawPackQuestions.length + 1,
          marks: pq.marks ?? 1,
          packType,
          question: pq.question ?? pq,
        });
      }
    }
  }

  // Sort by order
  rawPackQuestions.sort((a, b) => a.order - b.order);
  console.log(`[EXERCISE][DEBUG] Extracted ${rawPackQuestions.length} questions from ${packs.length} packs`);

  if (rawPackQuestions.length === 0) {
    throw new Error("No questions are available for this track yet. Check back soon!");
  }

  // ── Step 2: Normalize question type ──────────────────────────────────────────
  const normalizeType = (packType: string, qType: string): QuestionType => {
    const kind = (packType + " " + (qType || "")).toLowerCase().replace(/[_\s-]/g, "");
    if (kind.includes("match")) return "match";
    if (kind.includes("fill") || kind.includes("blank")) return "fill_blank";
    if (kind.includes("sort") || kind.includes("reorder")) return "reorder";
    if (kind.includes("truefalse")) return "true_false";
    return "mcq";
  };

  // ── Step 3: Map each question to QuestionItem ─────────────────────────────────
  const mappedQuestions: QuestionItem[] = rawPackQuestions.map(({ order, packType, question: q }) => {
    const qType = normalizeType(packType, q.questionType || "");

    // ── MCQ options ─────────────────────────────────────────────────────────
    let mcqOptions: MCQOption[] | undefined;
    if (qType === "mcq" && q.options?.choices) {
      const correctChoiceId: string = q.correctAnswer?.choiceId ?? "";
      mcqOptions = (q.options.choices as any[]).map((c: any, i: number) => ({
        id: c.id,
        label: String.fromCharCode(65 + i), // A, B, C, D
        text: c.text || `Option ${i + 1}`,
        isCorrect: c.id === correctChoiceId,
      }));
    }

    // ── Match pairs ─────────────────────────────────────────────────────────
    // Backend: options.leftItems[] + options.rightItems[] + correctAnswer.pairs[{leftId,rightId}]
    // Component expects: MatchPair[] { id, leftText, rightText }
    // We map each leftItem to its correct rightItem using correctAnswer.pairs
    let matchPairs: any[] | undefined;
    if (qType === "match" && q.options?.leftItems && q.options?.rightItems) {
      const leftItems: any[] = q.options.leftItems;
      const rightItems: any[] = q.options.rightItems;
      const correctPairs: Array<{ leftId: string; rightId: string }> = q.correctAnswer?.pairs ?? [];

      // Build a lookup: leftId → rightId (from correct answer)
      const correctMap = new Map<string, string>();
      for (const pair of correctPairs) {
        correctMap.set(pair.leftId, pair.rightId);
      }

      matchPairs = leftItems.map((left: any) => {
        const correctRightId = correctMap.get(left.id);
        const right = rightItems.find((r: any) => r.id === correctRightId);
        return {
          id: left.id,
          leftText: left.text || left.id,
          rightText: right?.text || correctRightId || left.id,
        };
      });
    }

    return {
      id: q.id || `q-${order}`,
      number: order,
      type: qType,
      prompt: q.questionText || q.prompt || q.stem || q.text || `Question ${order}`,
      instructions: qType === "match"
        ? "Match each item in Column A with its correct pair in Column B."
        : "Select the correct answer.",
      mcqOptions,
      matchPairs,
      fillBlankPlaceholder: q.placeholder || q.blank || undefined,
      reorderItems: q.reorderItems || q.items || undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || q.helpText || undefined,
    };
  });

  // ── Step 4: Session metadata ─────────────────────────────────────────────────
  const trackMeta = trackObj?.track ?? trackObj ?? {};
  const subjectMeta = trackObj?.subject ?? {};
  return {
    id: trackMeta.trackId || `ex-${trackSlug}-${subjectSlug}`,
    subjectName: subjectMeta.subjectName || "Subject",
    trackName: trackMeta.title || trackMeta.name || trackSlug.toUpperCase(),
    trackType: "explorer" as TrackType, // frontend display only
    title: `${subjectMeta.subjectName || "Fundamentals"} — ${trackMeta.title || trackSlug}`,
    totalQuestions: mappedQuestions.length,
    questions: mappedQuestions,
  };
}

export function gradeExercise(
  session: ExerciseSessionPayload,
  userAnswers: Record<string, any>
): { resultData: ExerciseResultData; reviewData: ReviewPayload } {
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const reviewQuestions: ReviewQuestionItem[] = session.questions.map((q) => {
    const userAnswer = userAnswers[q.id];
    let isCorrect = false;
    let correctAnswerText = "Unknown Answer";
    let studentAnswerText = "Not answered";
    let status: ReviewStatus = "skipped";

    if (userAnswer === undefined || userAnswer === null || userAnswer === "") {
      skippedCount++;
      // Determine correct answer text for display
      if (q.type === "mcq" && q.mcqOptions) {
        const correctOpt = q.mcqOptions.find((opt: any) => opt.isCorrect);
        if (correctOpt) {
          correctAnswerText = `(${correctOpt.label}) ${correctOpt.text}`;
        }
      } else if (q.type === "true_false") {
        const correctVal = q.correctAnswer?.value ?? q.correctAnswer;
        correctAnswerText = typeof correctVal === "boolean" ? (correctVal ? "TRUE" : "FALSE") : String(correctVal || "TRUE");
      } else if (q.type === "match" && q.matchPairs) {
        correctAnswerText = q.matchPairs.map(p => `${p.leftText} ➔ ${p.rightText}`).join(", ");
      } else if (q.type === "fill_blank") {
        correctAnswerText = String(q.correctAnswer?.value || q.correctAnswer?.text || q.correctAnswer || "Answer");
      } else if (q.type === "reorder" && q.reorderItems) {
        correctAnswerText = q.reorderItems.map(item => item.text).join(", ");
      }
    } else {
      status = "incorrect"; // default if answered
      switch (q.type) {
        case "mcq": {
          const correctOpt = q.mcqOptions?.find((opt: any) => opt.isCorrect);
          const studentOpt = q.mcqOptions?.find(opt => opt.id === userAnswer);
          if (correctOpt) {
            correctAnswerText = `(${correctOpt.label}) ${correctOpt.text}`;
          }
          if (studentOpt) {
            studentAnswerText = `(${studentOpt.label}) ${studentOpt.text}`;
            if (studentOpt.id === correctOpt?.id) {
              isCorrect = true;
              status = "correct";
            }
          }
          break;
        }
        case "true_false": {
          const rawCorrect = q.correctAnswer;
          let correctVal = true;
          if (typeof rawCorrect === "boolean") {
            correctVal = rawCorrect;
          } else if (rawCorrect && typeof rawCorrect === "object") {
            if (typeof rawCorrect.value === "boolean") {
              correctVal = rawCorrect.value;
            } else if (typeof rawCorrect.choiceId === "string") {
              const cid = rawCorrect.choiceId.toLowerCase();
              correctVal = cid.includes("true") || cid.includes("yes") || cid.includes("correct");
            }
          }
          correctAnswerText = correctVal ? "TRUE" : "FALSE";
          studentAnswerText = userAnswer ? "TRUE" : "FALSE";
          if (userAnswer === correctVal) {
            isCorrect = true;
            status = "correct";
          }
          break;
        }
        case "match": {
          const pairs = q.matchPairs || [];
          let matchesCorrect = true;
          const leftIds = pairs.map(p => p.id);

          correctAnswerText = pairs.map(p => `${p.leftText} ➔ ${p.rightText}`).join(", ");

          const studentMatches: string[] = [];
          for (const p of pairs) {
            const matchedRightId = userAnswer[p.id];
            if (matchedRightId) {
              const rightPair = pairs.find(rp => rp.id === matchedRightId);
              studentMatches.push(`${p.leftText} ➔ ${rightPair ? rightPair.rightText : matchedRightId}`);
              if (matchedRightId !== p.id) {
                matchesCorrect = false;
              }
            } else {
              matchesCorrect = false;
            }
          }
          studentAnswerText = studentMatches.length > 0 ? studentMatches.join(", ") : "No connections established";
          if (matchesCorrect && leftIds.length > 0) {
            isCorrect = true;
            status = "correct";
          }
          break;
        }
        case "fill_blank": {
          const rawCorrect = q.correctAnswer;
          const possibleCorrect: string[] = [];
          if (typeof rawCorrect === "string") {
            possibleCorrect.push(rawCorrect);
          } else if (rawCorrect && typeof rawCorrect === "object") {
            const val = rawCorrect.value || rawCorrect.text || rawCorrect.correctText || rawCorrect.choiceId;
            if (typeof val === "string") possibleCorrect.push(val);
          }

          correctAnswerText = possibleCorrect[0] || "Answer";
          studentAnswerText = String(userAnswer);

          const studentClean = String(userAnswer).trim().toLowerCase();
          const match = possibleCorrect.some(c => studentClean === c.trim().toLowerCase());
          if (match) {
            isCorrect = true;
            status = "correct";
          }
          break;
        }
        case "reorder": {
          const rawCorrect = q.correctAnswer;
          let correctIds: string[] = [];
          if (Array.isArray(rawCorrect)) {
            correctIds = rawCorrect;
          } else if (rawCorrect && typeof rawCorrect === "object") {
            const val = rawCorrect.orderedIds || rawCorrect.itemIds || rawCorrect.value || rawCorrect.choices;
            if (Array.isArray(val)) correctIds = val;
          }

          if (correctIds.length === 0 && q.reorderItems) {
            correctIds = q.reorderItems.map(item => item.id);
          }

          const items = q.reorderItems || [];
          correctAnswerText = correctIds.map(id => items.find(it => it.id === id)?.text || id).join(", ");
          studentAnswerText = (userAnswer as string[]).map(id => items.find(it => it.id === id)?.text || id).join(", ");

          if (JSON.stringify(userAnswer) === JSON.stringify(correctIds)) {
            isCorrect = true;
            status = "correct";
          }
          break;
        }
        default:
          break;
      }

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }

    return {
      id: q.id,
      number: q.number,
      typeLabel: q.type === "mcq" ? "Multiple Choice" : q.type === "true_false" ? "True / False" : q.type === "match" ? "Match the Following" : q.type === "fill_blank" ? "Fill in the Blank" : "Reorder",
      prompt: q.prompt,
      status,
      studentAnswer: studentAnswerText,
      correctAnswer: correctAnswerText,
      explanation: q.explanation || "No explanation provided.",
    };
  });

  const totalQuestions = session.questions.length;
  const attemptedCount = totalQuestions - skippedCount;
  const accuracyPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const completionPercent = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;

  let performanceLevel: "excellent" | "good" | "average" | "needs_improvement" = "average";
  let performanceMessage = "Good attempt! Keep practicing to improve your understanding of these concepts.";

  if (accuracyPercent >= 85) {
    performanceLevel = "excellent";
    performanceMessage = "Outstanding performance! You have demonstrated strong analytical mastery of these concepts.";
  } else if (accuracyPercent >= 70) {
    performanceLevel = "good";
    performanceMessage = "Great job! You have a solid grasp of the subject fundamentals.";
  } else if (accuracyPercent < 50) {
    performanceLevel = "needs_improvement";
    performanceMessage = "Reviewing the chapter materials and attempting the exercise again is highly recommended.";
  }

  const resultData: ExerciseResultData = {
    subjectName: session.subjectName,
    trackName: session.trackName,
    trackType: session.trackType,
    title: session.title,
    totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    skippedCount,
    score: correctCount,
    maxScore: totalQuestions,
    percentage: accuracyPercent,
    accuracyPercent,
    completionPercent,
    timeTakenFormatted: "02m 15s", // mock duration
    performanceLevel,
    performanceMessage,
  };

  const reviewData: ReviewPayload = {
    subjectName: session.subjectName,
    trackName: session.trackName,
    trackType: session.trackType,
    title: session.title,
    totalQuestions,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracyPercent,
    questions: reviewQuestions,
  };

  return { resultData, reviewData };
}
