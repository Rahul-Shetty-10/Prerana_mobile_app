import { test } from "node:test";
import assert from "node:assert/strict";

import {
  clearAllMilestones,
  isChapterCompleted,
  getCompletedChaptersCount,
  getCalculatedStats,
  markMilestoneSeen,
  markQuizCompleted,
  saveMilestones,
  extractChapterResourceTypes,
} from "../src/shared/services/chapterProgressService.ts";

test("Chapter Completion & Progress Tracking Test Suite", async (t) => {
  await t.test("Chapter with 3 available resources requires all 3 + quiz to complete", async () => {
    await clearAllMilestones();
    const chapterId = "ch-test-101";
    const subjectId = "subj-science";
    const resourceTypes = ["infographic", "mindmap", "audio"];

    // 1. Initial state -> not completed
    let isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, false);

    // 2. Mark quiz completed -> still false because 3 resources unseen
    await markQuizCompleted(chapterId, subjectId, 90, 10);
    isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, false);

    // 3. Mark 2 resources seen -> still false
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markMilestoneSeen(chapterId, subjectId, "mindmap");
    isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, false);

    // 4. Mark 3rd resource seen -> complete!
    await markMilestoneSeen(chapterId, subjectId, "audio");
    isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, true);
  });

  await t.test("Chapter with only 1 available resource completes when that resource + quiz are complete", async () => {
    await clearAllMilestones();
    const chapterId = "ch-single-res";
    const subjectId = "subj-maths";
    const resourceTypes = ["textbook"];

    await markQuizCompleted(chapterId, subjectId, 100, 5);
    let isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, false, "Unseen textbook should prevent completion");

    await markMilestoneSeen(chapterId, subjectId, "textbook");
    isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, true, "1 available resource + quiz completes chapter");
  });

  await t.test("Unavailable resources do not block completion", async () => {
    await clearAllMilestones();
    const chapterId = "ch-partial-avail";
    const subjectId = "subj-english";
    // Chapter only has slidedeck & video
    const resourceTypes = ["slidedeck", "video"];

    await markQuizCompleted(chapterId, subjectId, 85, 8);
    await markMilestoneSeen(chapterId, subjectId, "slidedeck");
    await markMilestoneSeen(chapterId, subjectId, "video");

    // mindmap, audio, infographic are NOT available and must NOT block completion
    const isComp = await isChapterCompleted(chapterId, resourceTypes);
    assert.equal(isComp, true);
  });

  await t.test("getCompletedChaptersCount correctly filters by available resourceTypes", async () => {
    await clearAllMilestones();
    const subjectId = "subj-science";
    const chapters = [
      { id: "ch-1", resourceTypes: ["infographic", "quiz"] },
      { id: "ch-2", resourceTypes: ["slidedeck", "video"] },
    ];

    // Complete ch-1
    await markQuizCompleted("ch-1", subjectId, 100, 5);
    await markMilestoneSeen("ch-1", subjectId, "infographic");

    // Partially complete ch-2 (slidedeck seen, video unseen)
    await markQuizCompleted("ch-2", subjectId, 80, 5);
    await markMilestoneSeen("ch-2", subjectId, "slidedeck");

    const count = await getCompletedChaptersCount(subjectId, chapters as any);
    assert.equal(count, 1, "Only ch-1 should be completed");
  });

  await t.test("extractChapterResourceTypes extracts resources from various payload formats", () => {
    const rawChapterObj = {
      resources: {
        infographicUrl: "https://example.com/info.png",
        videoUrl: "https://example.com/video.mp4",
      },
    };
    const types = extractChapterResourceTypes(rawChapterObj);
    assert.deepEqual(types, ["infographic", "video"]);
  });

  await t.test("getCalculatedStats returns dynamic completions and accuracy", async () => {
    await clearAllMilestones();
    await saveMilestones("ch-stat-1", "subj-science", {
      quizCompleted: true,
      quizScorePercent: 90,
      questionsSolvedCount: 10,
      infographicSeen: true,
      audioSeen: true,
    });
    // Store resourceTypes on milestone
    await saveMilestones("ch-stat-1", "subj-science", {
      seenResources: ["infographic", "audio"],
    });

    const stats = await getCalculatedStats();
    assert.equal(stats.overallAccuracy, 90);
    assert.equal(stats.questionsSolved, 10);
    assert.equal(stats.completedChaptersCount, 1);
  });
});
