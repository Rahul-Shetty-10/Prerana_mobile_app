import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import {
  ExerciseResultData,
  ExerciseSessionPayload,
  MCQOption,
  QuestionItem,
  QuestionType,
  ReviewPayload,
  ReviewQuestionItem,
  ReviewStatus,
  TrackType,
} from "../types";
import { MOCK_EXERCISE_EXPLORER } from "../constants/exerciseData";

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

function extractQuizId(html: string): string | null {
  if (!html) return null;

  // Strategy 1: Look for quizId key-value patterns (handles escaped JSON too)
  const quizIdRegexes = [
    /\\?["']quizId\\?["']\s*[:,\\]+\s*\\?["']([a-z0-9]{32})\\?["']/i,
    /quizId\s*[:=]\s*["']?([a-z0-9]{32})["']?/i
  ];

  for (const regex of quizIdRegexes) {
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Strategy 2: Look for the word "quiz" followed by a 32-character ID in close proximity
  const proximityRegex = /quiz[a-z0-9_]*\s*[^a-z0-9]{1,10}\s*([a-z0-9]{32})/gi;
  let match;
  while ((match = proximityRegex.exec(html)) !== null) {
    if (match[1]) {
      return match[1];
    }
  }

  // Strategy 3: Find any 32-character strings and see if any contain "quiz" in their surrounding text
  const all32CharMatches = html.match(/[a-z0-9]{32}/g) || [];
  for (const id of all32CharMatches) {
    const idx = html.indexOf(id);
    if (idx !== -1) {
      const surrounding = html.substring(Math.max(0, idx - 150), idx);
      if (surrounding.toLowerCase().includes("quiz")) {
        return id;
      }
    }
  }

  return null;
}

export async function fetchExerciseSession(
  trackType: TrackType = "explorer",
  subjectId: string = "subj-science",
  chapterId: string = "chap-1",
  getToken?: GetToken
): Promise<ExerciseSessionPayload> {
  const quizStartTime = Date.now();
  console.log(`[PERF][QUIZ] Quiz button tapped: 0ms`);
  console.log("[PERF][QUIZ] Quiz resolution started");

  if (!getToken) {
    throw new Error("Authentication required. Please sign in.");
  }

  console.log(`[EXERCISE][SERVICE] fetchExerciseSession started: subjectId='${subjectId}', chapterId='${chapterId}'`);

  try {
    // Step 1: Call quiz-landing endpoint to resolve the quiz info
    console.log("[EXERCISE][SERVICE] Resolving quizId from student/quiz-landing API...");
    const landingStartTime = Date.now();
    
    const landingData = await mobileApi<any>(
      `/student/quiz-landing?subjectId=${encodeURIComponent(subjectId)}&chapterId=${encodeURIComponent(chapterId)}`,
      {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      }
    );

    const quizResolutionDuration = Date.now() - landingStartTime;
    console.log(`[PERF][QUIZ] Quiz resolution completed: ${quizResolutionDuration}ms`);
    console.log("[EXERCISE][SERVICE] quiz-landing API response:", JSON.stringify(landingData, null, 2));

    const quizId = landingData?.quizId || landingData?.id || landingData?.quiz?._id || landingData?.chapterQuizEntry?.quizId || landingData?.chapterQuizEntry?.id;
    console.log(`[PERF][QUIZ] quizId=${quizId || "undefined"}`);

    if (!quizId) {
      console.warn(`\n[API][ERROR]\nendpoint=/student/quiz-landing\nmethod=GET\nstatus=200\nduration=${quizResolutionDuration}ms\nerror=quizId missing in response\n`);
      throw new Error("Could not find a valid quizId in the quiz-landing response.");
    }

    // Step 2: Create a quiz attempt using the resolved quizId
    console.log("[PERF][QUIZ] Attempt creation started");
    const attemptStartTime = Date.now();

    const activeTokenNormal = await getToken();
    if (!activeTokenNormal) {
      throw new Error("Unable to retrieve authentication token.");
    }

    console.log(`[EXERCISE][SERVICE] Creating live quiz attempt for quizId='${quizId}'...`);
    const attemptRes = await fetch("https://app.smartguru.in/api/student/quiz-attempts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeTokenNormal}`,
        "Content-Type": "application/json",
        "X-Tenant-Slug": appConfig.tenantSlug,
      },
      body: JSON.stringify({
        intent: "ensure",
        tenant: appConfig.tenantSlug,
        quizId: quizId,
        questionCount: 45, // Full chapter count
      }),
    });

    const attemptDuration = Date.now() - attemptStartTime;
    console.log(`[PERF][QUIZ] Attempt creation completed: ${attemptDuration}ms`);

    if (!attemptRes.ok) {
      const errText = await attemptRes.text();
      console.error(`\n[API][ERROR]\nendpoint=/api/student/quiz-attempts\nmethod=POST\nstatus=${attemptRes.status}\nduration=${attemptDuration}ms\nerror=${errText}\n`);
      throw new Error(`Failed to start quiz attempt. Server status: ${attemptRes.status}`);
    }

    const attemptData = await attemptRes.json();
    const attemptId = attemptData?.attemptId || attemptData?.id || attemptData?.attempt?._id;
    console.log(`[PERF][QUIZ] attemptId=${attemptId || "undefined"}`);

    // Step 3: Retrieve questions list from attempt data
    console.log("[PERF][QUIZ] Questions request started");
    const questionsList = attemptData?.questions || attemptData?.attempt?.questions;
    const questionCount = questionsList?.length || 0;
    console.log(`[PERF][QUIZ] Questions request completed: 0ms`);
    console.log(`[PERF][QUIZ] questionCount=${questionCount}`);

    if (!questionsList || !Array.isArray(questionsList) || questionsList.length === 0) {
      throw new Error("No quiz questions returned from backend for this chapter.");
    }

    console.log(`[EXERCISE][SERVICE] Successfully retrieved ${questionsList.length} questions from backend.`);

    const mappedQuestions: QuestionItem[] = questionsList.map((q: any, idx: number) => ({
      id: q.id || q._id || `q-${idx + 1}`,
      number: q.number || idx + 1,
      type: q.type || "mcq",
      prompt: q.prompt || "Question prompt",
      instructions: q.instructions || "Select or answer the following:",
      mcqOptions: q.mcqOptions,
      matchPairs: q.matchPairs,
      fillBlankPlaceholder: q.fillBlankPlaceholder,
      reorderItems: q.reorderItems,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const totalDuration = Date.now() - quizStartTime;
    console.log(`[PERF][QUIZ] First question rendered: ${totalDuration}ms`);
    console.log(`[PERF][QUIZ] TOTAL TIME TO FIRST QUESTION: ${totalDuration}ms`);

    return {
      id: attemptData.attemptId || attemptData.id || `ex-${trackType}-${chapterId}`,
      subjectName: attemptData.subjectName || "General Science",
      trackName: attemptData.trackName || "Practice Quiz",
      trackType: trackType,
      title: attemptData.title || "Chapter Test",
      totalQuestions: mappedQuestions.length,
      questions: mappedQuestions,
    };
  } catch (error: any) {
    const totalDuration = Date.now() - quizStartTime;
    console.error("[EXERCISE][SERVICE] fetchExerciseSession critical error:", error?.message || error);
    console.warn(`\n[API][ERROR]\nendpoint=fetchExerciseSession\nmethod=GET_AND_POST\nstatus=FAILED\nduration=${totalDuration}ms\nerror=${error?.message || String(error)}\n`);
    throw error;
  }
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
      { getToken, tenantSlug: appConfig.tenantSlug }
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
