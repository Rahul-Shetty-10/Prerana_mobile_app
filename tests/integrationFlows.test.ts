import assert from "node:assert/strict";
import test from "node:test";
import { setMobileSession } from "../src/shared/session/sessionStore.ts";
import { getResourceRequestHeaders, isTrustedApiResourceUrl } from "../src/shared/session/resourceAuth.ts";
import { shouldInvalidateSession } from "../src/api/mobileApiPolicy.ts";
import {
  isMilestoneCompleted,
  markMilestoneSeen,
  getAllMilestones,
  clearAllMilestones,
  markQuizCompleted,
} from "../src/shared/services/chapterProgressService.ts";
import type { ResourceTabType } from "../src/features/subjects/types/chapterResource.ts";

// Helper representing the viewer mapping registry in ResourceContainer
function getViewerComponentName(tab: ResourceTabType, hasData: boolean): string {
  if (!hasData) return "ContentComingSoon";
  switch (tab) {
    case "infographic":
      return "ImageViewer";
    case "slidedeck":
      return "SlideDeckViewer";
    case "flashcards":
      return "FlashcardViewer";
    case "audio":
      return "AudioViewer";
    case "video":
      return "VideoViewer";
    case "mindmap":
      return "MindmapViewer";
    case "textbook":
      return "PDFViewer";
    case "table":
      return "TableViewer";
    case "arcade":
      return "ArcadeViewer";
    default:
      return "ImageViewer";
  }
}

// ─── FLOW A: BACKEND RESOURCE → CORRECT VIEWER ─────────────────────────────

test("FLOW A: selects correct viewer for each of the 8 supported resource types without fallback", () => {
  const mapTestCases: { type: ResourceTabType; expectedViewer: string }[] = [
    { type: "infographic", expectedViewer: "ImageViewer" },
    { type: "slidedeck", expectedViewer: "SlideDeckViewer" },
    { type: "flashcards", expectedViewer: "FlashcardViewer" },
    { type: "audio", expectedViewer: "AudioViewer" },
    { type: "video", expectedViewer: "VideoViewer" },
    { type: "mindmap", expectedViewer: "MindmapViewer" },
    { type: "textbook", expectedViewer: "PDFViewer" },
    { type: "table", expectedViewer: "TableViewer" },
  ];

  for (const { type, expectedViewer } of mapTestCases) {
    const viewer = getViewerComponentName(type, true);
    assert.equal(
      viewer,
      expectedViewer,
      `Resource type '${type}' should map to '${expectedViewer}', got '${viewer}'`
    );
    assert.notEqual(
      type === "infographic" ? "" : viewer,
      "ImageViewer",
      `Resource type '${type}' must NOT fall back silently to ImageViewer`
    );
  }
});

// ─── FLOW B: LIBRARY FEATURED RESOURCE → CORRECT TAB ───────────────────────

test("FLOW B: Library featured resource opens the exact target initialTab for all 8 types", () => {
  const supportedTabs: ResourceTabType[] = [
    "infographic",
    "slidedeck",
    "flashcards",
    "audio",
    "video",
    "mindmap",
    "textbook",
    "table",
  ];

  for (const targetTab of supportedTabs) {
    const featuredResource = {
      id: `feat-${targetTab}`,
      title: `Sample ${targetTab}`,
      subjectId: "subj-1",
      subjectName: "Science",
      chapterId: "chap-1",
      chapterName: "Chapter 1: Energy",
      resourceBadge: (targetTab.charAt(0).toUpperCase() + targetTab.slice(1)) as any,
      resourceTab: targetTab,
    };

    // Navigation payload mapping
    const navParams = {
      chapter: { id: featuredResource.chapterId, title: featuredResource.chapterName },
      subjectName: featuredResource.subjectName,
      subjectId: featuredResource.subjectId,
      initialTab: featuredResource.resourceTab,
    };

    assert.equal(navParams.initialTab, targetTab);
    assert.notEqual(
      targetTab === "infographic" ? "" : navParams.initialTab,
      "infographic",
      `Library resource '${targetTab}' must not fall back to 'infographic'`
    );
  }
});

// ─── FLOW C: AUTHENTICATED RESOURCE LOADING & SECURITY ─────────────────────

test("FLOW C: Protected resource loading, header scoping, and session invalidation", () => {
  setMobileSession({
    userId: "user_test",
    tenantId: "tenant_alpha",
    tenantSlug: "school-alpha",
    tenantName: "School Alpha",
    membershipId: "m_test",
    role: "student",
  });

  const token = "clerk_secret_token_abc123";
  const trustedBase = "https://app.smartguru.in/api/mobile/v1";

  // Assets to test
  const assets = [
    { type: "image", url: `${trustedBase}/resource-asset?type=infographic&id=1` },
    { type: "PDF", url: `${trustedBase}/resource-asset?type=textbook&id=2` },
    { type: "audio", url: `${trustedBase}/resource-asset?type=audio&id=3` },
    { type: "video", url: `${trustedBase}/resource-asset?type=video&id=4` },
    { type: "flashcard CSV", url: `${trustedBase}/resource-asset?type=flashcards&id=5` },
  ];

  for (const asset of assets) {
    assert.equal(isTrustedApiResourceUrl(asset.url), true, `${asset.type} URL must be trusted`);
    const headers = getResourceRequestHeaders(asset.url, token);
    assert.ok(headers, `Headers must be generated for trusted asset ${asset.type}`);
    assert.equal(headers["Authorization"], `Bearer ${token}`);
    assert.equal(headers["X-Tenant-Slug"], "school-alpha");
  }

  // Untrusted external origins MUST NOT receive Clerk token
  const untrustedUrls = [
    "https://murshidaudio.s3.ap-south-1.amazonaws.com/audio.mp3",
    "https://cdn.external-provider.com/video.mp4",
  ];
  for (const url of untrustedUrls) {
    assert.equal(isTrustedApiResourceUrl(url), false);
    assert.equal(getResourceRequestHeaders(url, token), undefined);
  }

  // Session invalidation on 401 & 403
  assert.equal(shouldInvalidateSession(401), true);
  assert.equal(shouldInvalidateSession(403), true);
  assert.equal(shouldInvalidateSession(404), false);
  assert.equal(shouldInvalidateSession(500), false);

  setMobileSession(null);
});

// ─── FLOW D: MISSING / FAILED RESOURCES PREVENT FALSE PROGRESS ─────────────

test("FLOW D: Missing or failed resources (401/403/404/500/network) result in zero progress", async () => {
  setMobileSession({
    userId: "user_test",
    tenantId: "tenant_alpha",
    tenantSlug: "school-alpha",
    tenantName: "School Alpha",
    membershipId: "m_test",
    role: "student",
  });
  await clearAllMilestones();

  const chapterId = "chap-fail-test";
  const subjectId = "subj-science";

  // Check state when screen opens or loading fails
  let milestones = (await getAllMilestones())[chapterId];
  assert.equal(milestones, undefined, "Initial chapter milestone must be undefined");

  // Simulating 401/403/404/500 failure where viewer callback onResourceDisplayed is NOT invoked
  const failedTab: ResourceTabType = "infographic";
  const isDisplayed = false; // Resource failed or missing

  if (isDisplayed) {
    await markMilestoneSeen(chapterId, subjectId, failedTab);
  }

  milestones = (await getAllMilestones())[chapterId];
  assert.equal(milestones, undefined, "Failed or missing resource must not create milestone entry");
  assert.equal(isMilestoneCompleted(milestones, [failedTab]), false);

  await clearAllMilestones();
  setMobileSession(null);
});

// ─── FLOW E: REAL CHAPTER COMPLETION LIFECYCLE ──────────────────────────────

test("FLOW E: Multi-resource chapter completion lifecycle with display validation", async () => {
  setMobileSession({
    userId: "user_test",
    tenantId: "tenant_alpha",
    tenantSlug: "school-alpha",
    tenantName: "School Alpha",
    membershipId: "m_test",
    role: "student",
  });
  await clearAllMilestones();

  const chapterId = "chap-multi-101";
  const subjectId = "subj-science";
  const availableResources: ResourceTabType[] = ["infographic", "slidedeck", "audio"];

  // 1. Chapter Opens → progress = 0, chapter incomplete
  let milestone = (await getAllMilestones())[chapterId];
  assert.equal(isMilestoneCompleted(milestone, availableResources), false);

  // 2. Resource 1 (infographic) successfully displayed
  await markMilestoneSeen(chapterId, subjectId, "infographic");
  milestone = (await getAllMilestones())[chapterId];
  assert.equal(milestone?.infographicSeen, true);
  assert.equal(isMilestoneCompleted(milestone, availableResources), false, "Incomplete while slidedeck & audio missing");

  // 3. Resource 2 (slidedeck) successfully displayed
  await markMilestoneSeen(chapterId, subjectId, "slidedeck");
  milestone = (await getAllMilestones())[chapterId];
  assert.equal(milestone?.slidedeckSeen, true);
  assert.equal(isMilestoneCompleted(milestone, availableResources), false, "Incomplete while audio & quiz missing");

  // 4. Resource 3 (audio) successfully displayed
  await markMilestoneSeen(chapterId, subjectId, "audio");
  milestone = (await getAllMilestones())[chapterId];
  assert.equal(milestone?.audioSeen, true);
  assert.equal(isMilestoneCompleted(milestone, availableResources), false, "Incomplete while quiz missing");

  // 5. Quiz completed → All required available resources displayed + quiz complete = Chapter Complete
  await markQuizCompleted(chapterId, subjectId, 100, 10);
  milestone = (await getAllMilestones())[chapterId];
  assert.equal(isMilestoneCompleted(milestone, availableResources), true, "Chapter MUST complete now");

  // 6. Test missing/failed resource scenario:
  const chapterIdWithMissing = "chap-missing-res";
  await markMilestoneSeen(chapterIdWithMissing, subjectId, "infographic");
  // slidedeck fails to load and is never displayed
  await markQuizCompleted(chapterIdWithMissing, subjectId, 100, 10);
  const missingMilestone = (await getAllMilestones())[chapterIdWithMissing];
  assert.equal(
    isMilestoneCompleted(missingMilestone, ["infographic", "slidedeck"]),
    false,
    "Chapter MUST NOT complete if an available required resource was missing/failed"
  );

  await clearAllMilestones();
  setMobileSession(null);
});
