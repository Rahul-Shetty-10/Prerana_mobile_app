/**
 * Features gated off because the backend does not serve them yet.
 *
 * The mobile API (`/api/mobile/v1`) currently implements exactly these routes:
 *
 *   /session                      /student/library
 *   /student/dashboard            /student/profile
 *   /student/learning-snapshot    /student/chapter-resources
 *   /student/fundamentals/catalog /student/quiz-attempts (GET only)
 *   /student/fundamentals/track   /student/content-requests
 *
 * Anything else returns a 404 HTML page. Rather than ship screens that are
 * guaranteed to fail, the entry points below stay hidden until the matching
 * route exists. The screens themselves are untouched, so enabling a flag is
 * the only change needed once the backend ships.
 */
export const featureFlags = {
  /**
   * Quizzes Home, Assessment History and Quiz Landing.
   *
   * Requires: GET /student/quizzes-home
   *           GET /student/assessment-history
   *           GET /student/quiz-landing?subjectId=&chapterId=
   */
  assessmentsHub: false,

  /**
   * The achievements list on the Profile screen.
   *
   * Requires: GET /student/achievements
   *
   * The Profile screen already renders an empty state when this is off, so
   * turning it on only adds the network call back.
   */
  achievements: false,

  /**
   * Chapter quizzes for every chapter, rather than only those listed in
   * `CHAPTER_QUIZ_MAP`.
   *
   * Requires an endpoint that resolves a chapter's quiz for the signed-in
   * student. The backend already has the logic in Convex
   * (`assessments/quizzes:getStudentChapterQuiz`), but no HTTP route exposes
   * it, and `/student/chapter-resources` does not include a quizId.
   *
   * While this is off, a chapter shows its quiz only when the map has an
   * entry for it, and a chapter with no quiz completes on its resources
   * alone. See `chapterQuizzes.ts`.
   */
  chapterQuizForAllChapters: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
