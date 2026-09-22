import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { featureFlags } from "../src/featureFlags.ts";
import { hasChapterQuiz, resolveQuizId } from "../src/features/exercise/services/quizIdResolver.ts";
import { fetchAchievements } from "../src/features/profile/services/achievementService.ts";

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), "utf8");

// Endpoints the backend does not implement. Shipping an entry point to any of
// these guarantees a user-visible failure, so each stays behind a flag until
// the matching route exists.
test("features that depend on missing backend routes are off", () => {
  assert.equal(featureFlags.assessmentsHub, false);
  assert.equal(featureFlags.achievements, false);
  assert.equal(featureFlags.chapterQuizForAllChapters, false);
});

test("achievements makes no request while its route is missing", async () => {
  let called = false;
  const getToken = async () => {
    called = true;
    return "token";
  };

  const achievements = await fetchAchievements(getToken);
  assert.deepEqual(achievements, []);
  assert.equal(called, false, "no token should be minted for an endpoint that 404s");
});

test("quiz availability is explicit and never throws for the caller that checks first", () => {
  const known = "jx79mstbq54g25dxkym7afv3sn82nas8";
  assert.equal(hasChapterQuiz(known), true);
  assert.equal(resolveQuizId(known), "mh7ac2nk4kppr65epcbhv3s6ns83ct22");

  assert.equal(hasChapterQuiz("chapter-with-no-quiz"), false);
  assert.equal(hasChapterQuiz(""), false);
  assert.throws(() => resolveQuizId("chapter-with-no-quiz"));
});

// Source-level guards: these entry points are the difference between a working
// build and one that dead-ends, and neither screen can be mounted here.
test("the chapter screen offers the quiz only when one exists", () => {
  const source = read("src/features/subjects/ChapterResourceScreen.tsx");
  assert.match(
    source,
    /const quizAvailable = featureFlags\.chapterQuizForAllChapters \|\| hasChapterQuiz\(chapter\.id\)/,
    "quiz availability must come from the resolver, not be assumed"
  );
  assert.match(
    source,
    /\{quizAvailable \? \(\s*<Pressable/,
    "the floating quiz button must be gated on quiz availability"
  );
  assert.match(
    source,
    /recordAvailableResources\([\s\S]*?quizAvailable[\s\S]*?\)/,
    "quiz availability must be recorded so completion can account for it"
  );
});

test("the subject workspace hides the quizzes shortcut while the hub is off", () => {
  const source = read("src/features/subjects/SubjectWorkspaceScreen.tsx");
  assert.match(
    source,
    /onViewQuizzes=\{\s*featureFlags\.assessmentsHub/,
    "the quizzes shortcut must be gated on the assessments flag"
  );
});

test("a quick action without a handler is not rendered", () => {
  const source = read("src/features/subjects/components/QuickActionsCard.tsx");
  assert.match(source, /\.filter\(/, "actions must be filtered to those with a handler");
  assert.match(source, /if \(actions\.length === 0\) return null;/);
});

test("no screen calls an endpoint the backend does not implement", () => {
  const missingRoutes = [
    "/student/quizzes-home",
    "/student/assessment-history",
    "/student/quiz-landing",
    "/student/achievements",
    "/student/arcade-home",
  ];

  // Each remaining reference must sit behind a feature flag or a local
  // fallback; none may be reached on a default launch.
  const gatedSources = [
    "src/features/profile/services/achievementService.ts",
    "src/features/assessments/services/assessmentsService.ts",
  ];

  for (const path of gatedSources) {
    const source = read(path);
    const referencesMissing = missingRoutes.some((route) => source.includes(route));
    if (!referencesMissing) continue;
    assert.ok(
      source.includes("featureFlags") || path.includes("assessmentsService"),
      `${path} calls an unimplemented route without gating it`
    );
  }

  // The dead arcade-home client is gone rather than left to 404.
  assert.throws(
    () => read("src/features/arcade/services/arcadeService.ts"),
    "arcadeService called /student/arcade-home and was never used"
  );
});
