/**
 * quizIdResolver.ts
 *
 * Isolated resolver that maps a (subjectId, chapterId) pair to the real backend
 * quizId required by POST /api/student/quiz-attempts.
 *
 * Background:
 *   - /student/quiz-landing returns 404 HTML (not a valid mobile endpoint).
 *   - /student/chapter-resources returns JSON but does NOT include a quizId field.
 *   - The real quizId must come from an explicit mapping until a dedicated
 *     mobile API endpoint is added.
 *
 * Verified quizIds (confirmed via the web application):
 *   General Science → Part 1 → Chapter 1 (Chemical Reactions & Equations)
 *     backend chapterId : jx79mstbq54g25dxkym7afv3sn82nas8  (from /student/subjects API)
 *     quizId            : mh7ac2nk4kppr65epcbhv3s6ns83ct22

 *
 * How to extend:
 *   Add more entries to CHAPTER_QUIZ_MAP below as additional quizIds are confirmed
 *   from the web application or from the backend team.
 */

/** Map from backend chapterId → confirmed quizId */
const CHAPTER_QUIZ_MAP: Record<string, string> = {
  // General Science – Part 1 – Chapter 1: Chemical Reactions & Equations
  jx79mstbq54g25dxkym7afv3sn82nas8: "mh7ac2nk4kppr65epcbhv3s6ns83ct22",
};

/**
 * Resolve the quizId for the given chapter.
 *
 * @param chapterId  The backend chapter ID (from the subjects API).
 * @returns          The confirmed quizId string.
 * @throws           An Error with a user-friendly message if no mapping exists.
 */
export function resolveQuizId(chapterId: string): string {
  const quizId = CHAPTER_QUIZ_MAP[chapterId];
  if (!quizId) {
    throw new Error(
      "Quiz questions are not yet available for this chapter. Please check back soon."
    );
  }
  return quizId;
}
