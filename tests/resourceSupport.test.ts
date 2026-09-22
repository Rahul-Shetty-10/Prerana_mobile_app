import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedApiResourceUrl, getResourceRequestHeaders } from "../src/shared/session/resourceAuth.ts";
import { setMobileSession } from "../src/shared/session/sessionStore.ts";
import { isMilestoneCompleted, type ChapterMilestones } from "../src/shared/services/chapterProgressService.ts";
import { escapeHtmlUrl } from "../src/features/subjects/viewers/videoUtils.ts";
import { RESOURCE_TABS_LIST } from "../src/features/subjects/constants/chapterResourceData.ts";

test("RESOURCE_TABS_LIST contains all 8 supported resource types", () => {
  const supportedTypes = [
    "infographic",
    "mindmap",
    "slidedeck",
    "textbook",
    "flashcards",
    "table",
    "audio",
    "video",
  ];
  const listIds = RESOURCE_TABS_LIST.map((t) => t.id);
  for (const expectedType of supportedTypes) {
    assert.ok(listIds.includes(expectedType as any), `Missing supported resource type: ${expectedType}`);
  }
});

test("isTrustedApiResourceUrl only matches configured backend origin", () => {
  // Trusted API origin (matches appConfig.apiBaseUrl default)
  const trustedUrl = "https://app.smartguru.in/api/mobile/v1/resource-asset?id=123";
  // External storage origins must receive NO Clerk tokens
  const s3Url = "https://murshidaudio.s3.ap-south-1.amazonaws.com/chapter-audio.mp3";
  const externalCdnUrl = "https://cdn.example.com/video.mp4";

  assert.equal(isTrustedApiResourceUrl(trustedUrl), true);
  assert.equal(isTrustedApiResourceUrl(s3Url), false);
  assert.equal(isTrustedApiResourceUrl(externalCdnUrl), false);
});

test("getResourceRequestHeaders never sends Clerk token to external origins", () => {
  setMobileSession({
    userId: "user_1",
    tenantId: "t_1",
    tenantSlug: "school-alpha",
    tenantName: "School Alpha",
    membershipId: "m_1",
    role: "student",
  });
  const token = "mock_clerk_token_123";
  const trustedUrl = "https://app.smartguru.in/api/mobile/v1/resource-asset?id=123";
  const untrustedUrl = "https://murshidaudio.s3.ap-south-1.amazonaws.com/chapter-audio.mp3";

  const trustedHeaders = getResourceRequestHeaders(trustedUrl, token);
  assert.ok(trustedHeaders);
  assert.equal(trustedHeaders["Authorization"], `Bearer ${token}`);
  assert.equal(trustedHeaders["X-Tenant-Slug"], "school-alpha");

  const untrustedHeaders = getResourceRequestHeaders(untrustedUrl, token);
  assert.equal(untrustedHeaders, undefined);
  setMobileSession(null);
});

test("isMilestoneCompleted allows brand-new users to complete chapter with present resources + quiz", () => {
  // New user who viewed Infographic and completed Quiz (chapter with only infographic)
  const infographicOnlyChapter: ChapterMilestones = {
    chapterId: "chap-1",
    subjectId: "subj-science",
    infographicSeen: true,
    quizCompleted: true,
  };
  assert.equal(isMilestoneCompleted(infographicOnlyChapter), true);

  // New user who completed Quiz but has not viewed any resource yet
  const quizOnlyNoResource: ChapterMilestones = {
    chapterId: "chap-2",
    subjectId: "subj-science",
    quizCompleted: true,
  };
  assert.equal(isMilestoneCompleted(quizOnlyNoResource), false);

  // User who viewed textbook and audio, and completed Quiz
  const multiResourceChapter: ChapterMilestones = {
    chapterId: "chap-3",
    subjectId: "subj-maths",
    textbookSeen: true,
    audioSeen: true,
    quizCompleted: true,
  };
  assert.equal(isMilestoneCompleted(multiResourceChapter), true);
});

test("escapeHtmlUrl properly escapes special HTML characters to prevent XSS", () => {
  const rawUrl = 'https://example.com/video.mp4?title="test"&id=<123>';
  const escaped = escapeHtmlUrl(rawUrl);
  assert.equal(escaped.includes('"'), false);
  assert.equal(escaped.includes('<'), false);
  assert.equal(escaped.includes('>'), false);
  assert.ok(escaped.includes("&quot;"));
  assert.ok(escaped.includes("&lt;"));
  assert.ok(escaped.includes("&gt;"));
  assert.ok(escaped.includes("&amp;"));
});

test("rotation-aware aspect math swaps width and height correctly", () => {
  const width = 400;
  const height = 300;

  const isRotated0 = 0 % 180 !== 0; // false
  const effW0 = isRotated0 ? height : width;
  const effH0 = isRotated0 ? width : height;
  assert.equal(effW0, 400);
  assert.equal(effH0, 300);

  const isRotated90 = 90 % 180 !== 0; // true
  const effW90 = isRotated90 ? height : width;
  const effH90 = isRotated90 ? width : height;
  assert.equal(effW90, 300);
  assert.equal(effH90, 400);
});
