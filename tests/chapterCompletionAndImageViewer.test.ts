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
  getAllMilestones,
  isMilestoneCompleted,
  recordAvailableResources,
} from "../src/shared/services/chapterProgressService.ts";
import type { ResourceTabType } from "../src/features/subjects/types/chapterResource.ts";

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

// ─── Dashboard / Profile consistency ────────────────────────────────────────
//
// Dashboard and Profile have no chapter list, so they evaluate completion with
// no explicit resource list. Before the requirement was recorded on the
// chapter itself they applied a looser rule and reported more completed
// chapters than the subject workspace for the same data.

test("recorded available resources make every screen agree on completion", async (t) => {
  await t.test("a partially viewed chapter is incomplete with or without a caller list", async () => {
    await clearAllMilestones();

    const chapterId = "chap-consistency-1";
    const subjectId = "subj-science";
    const available: ResourceTabType[] = ["infographic", "audio", "video"];

    await recordAvailableResources(chapterId, subjectId, available);
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markQuizCompleted(chapterId, subjectId, 80, 10);

    const milestones = (await getAllMilestones())[chapterId];

    // Subject workspace passes the chapter's resource list explicitly.
    assert.equal(isMilestoneCompleted(milestones, available), false);
    // Dashboard and Profile pass nothing and must reach the same verdict.
    assert.equal(isMilestoneCompleted(milestones), false);
  });

  await t.test("viewing every available resource completes the chapter on both paths", async () => {
    await clearAllMilestones();

    const chapterId = "chap-consistency-2";
    const subjectId = "subj-science";
    const available: ResourceTabType[] = ["infographic", "audio"];

    await recordAvailableResources(chapterId, subjectId, available);
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markMilestoneSeen(chapterId, subjectId, "audio");
    await markQuizCompleted(chapterId, subjectId, 90, 10);

    const milestones = (await getAllMilestones())[chapterId];

    assert.equal(isMilestoneCompleted(milestones, available), true);
    assert.equal(isMilestoneCompleted(milestones), true);
  });

  await t.test("an explicit caller list still wins over the recorded one", async () => {
    await clearAllMilestones();

    const chapterId = "chap-consistency-3";
    const subjectId = "subj-maths";

    await recordAvailableResources(chapterId, subjectId, ["infographic", "audio"]);
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markQuizCompleted(chapterId, subjectId, 70, 10);

    const milestones = (await getAllMilestones())[chapterId];

    // Backend now reports only the infographic for this chapter.
    assert.equal(isMilestoneCompleted(milestones, ["infographic"]), true);
    assert.equal(isMilestoneCompleted(milestones), false);
  });

  await t.test("chapters stored by an older build keep the legacy rule", async () => {
    await clearAllMilestones();

    const chapterId = "chap-legacy";
    const subjectId = "subj-english";

    // No recordAvailableResources() call: simulates a pre-upgrade milestone.
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markQuizCompleted(chapterId, subjectId, 75, 10);

    const milestones = (await getAllMilestones())[chapterId];
    assert.equal(milestones.availableResources, undefined);
    assert.equal(isMilestoneCompleted(milestones), true);
  });
});

// ─── Chapters the backend offers no quiz for ────────────────────────────────
//
// No mobile route resolves a chapter's quizId, so most chapters cannot start
// a quiz at all. Requiring one would leave them permanently incomplete.

test("a chapter with no quiz completes on its resources alone", async (t) => {
  await t.test("all available resources seen is enough when no quiz exists", async () => {
    await clearAllMilestones();

    const chapterId = "chap-noquiz-1";
    const subjectId = "subj-science";
    const available: ResourceTabType[] = ["infographic", "audio"];

    await recordAvailableResources(chapterId, subjectId, available, false);
    await markMilestoneSeen(chapterId, subjectId, "infographic");
    await markMilestoneSeen(chapterId, subjectId, "audio");

    const milestones = (await getAllMilestones())[chapterId];
    assert.equal(milestones.quizCompleted, undefined);
    assert.equal(isMilestoneCompleted(milestones, available), true);
    assert.equal(isMilestoneCompleted(milestones), true);
  });

  await t.test("a partially viewed chapter is still incomplete without a quiz", async () => {
    await clearAllMilestones();

    const chapterId = "chap-noquiz-2";
    const subjectId = "subj-science";
    const available: ResourceTabType[] = ["infographic", "audio", "video"];

    await recordAvailableResources(chapterId, subjectId, available, false);
    await markMilestoneSeen(chapterId, subjectId, "infographic");

    const milestones = (await getAllMilestones())[chapterId];
    assert.equal(isMilestoneCompleted(milestones), false);
  });

  await t.test("a chapter that does have a quiz still requires it", async () => {
    await clearAllMilestones();

    const chapterId = "chap-withquiz";
    const subjectId = "subj-science";
    const available: ResourceTabType[] = ["infographic"];

    await recordAvailableResources(chapterId, subjectId, available, true);
    await markMilestoneSeen(chapterId, subjectId, "infographic");

    let milestones = (await getAllMilestones())[chapterId];
    assert.equal(isMilestoneCompleted(milestones), false);

    await markQuizCompleted(chapterId, subjectId, 80, 10);
    milestones = (await getAllMilestones())[chapterId];
    assert.equal(isMilestoneCompleted(milestones), true);
  });

  await t.test("quiz availability is recorded even when the resource list is unchanged", async () => {
    await clearAllMilestones();

    const chapterId = "chap-flip";
    const subjectId = "subj-maths";
    const available: ResourceTabType[] = ["infographic"];

    await recordAvailableResources(chapterId, subjectId, available, true);
    assert.equal((await getAllMilestones())[chapterId].quizAvailable, true);

    await recordAvailableResources(chapterId, subjectId, available, false);
    assert.equal((await getAllMilestones())[chapterId].quizAvailable, false);
  });
});
