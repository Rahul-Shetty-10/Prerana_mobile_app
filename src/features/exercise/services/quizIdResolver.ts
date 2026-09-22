/**
 * quizIdResolver.ts
 *
 * Maps a backend chapterId to the quizId required by
 * POST /api/student/quiz-attempts.
 *
 * Why a map exists at all
 * -----------------------
 * Nothing the mobile app can call returns a chapter's quizId:
 *   - /student/chapter-resources returns the resources only, no quizId.
 *   - /student/learning-snapshot returns subjects and chapters, no quizzes.
 *   - /student/quiz-landing is not implemented (404).
 * The backend resolves this server-side through the Convex query
 * `assessments/quizzes:getStudentChapterQuiz`, which no HTTP route exposes.
 *
 * Until such a route exists, a chapter has a quiz only if it is listed here.
 * `hasChapterQuiz` is what the UI asks before offering the quiz, so a chapter
 * without an entry never shows a dead end, and chapter completion falls back
 * to its resources alone. See `featureFlags.chapterQuizForAllChapters`.
 *
 * How to extend
 * -------------
 * Add `"<backend chapterId>": "<quizId>"` once a pair is confirmed against the
 * web application. Both IDs are Convex document IDs, not slugs.
 */

/** Map from backend chapterId -> confirmed quizId. */
const CHAPTER_QUIZ_MAP: Record<string, string> = {
  // General Science - Part 1 - Chapter 1: Chemical Reactions & Equations
  jx79mstbq54g25dxkym7afv3sn82nas8: "mh7ac2nk4kppr65epcbhv3s6ns83ct22",
};

/**
 * Whether a quiz can actually be started for this chapter. The UI must check
 * this before showing any quiz entry point.
 */
export function hasChapterQuiz(chapterId: string): boolean {
  return Boolean(chapterId && CHAPTER_QUIZ_MAP[chapterId]);
}

/**
 * Resolve the quizId for the given chapter.
 *
 * @throws if the chapter has no known quiz. Callers should avoid this by
 *         checking `hasChapterQuiz` first; the throw is the last line of
 *         defence for a chapter reached some other way.
 */
export function resolveQuizId(chapterId: string): string {
  const quizId = CHAPTER_QUIZ_MAP[chapterId];
  if (!quizId) {
    throw new Error(
      "This chapter does not have a quiz yet. Your progress is tracked from the chapter resources."
    );
  }
  return quizId;
}
