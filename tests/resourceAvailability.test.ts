import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  isResourceAvailable,
  listAvailableResourceTypes,
} from "../src/features/subjects/services/resourceAvailability.ts";
import type { ChapterResourcesPayload } from "../src/features/subjects/services/chapterResourcesService.ts";
import type { ResourceTabType } from "../src/features/subjects/types/chapterResource.ts";

const RESOURCE_CONTAINER = readFileSync(
  join(process.cwd(), "src/features/subjects/components/ResourceContainer.tsx"),
  "utf8"
);

const base: ChapterResourcesPayload = { subjectId: "subj-science", chapterId: "chap-1" };

// Exercises the real module that ResourceContainer uses to choose between a
// viewer and the unavailable state.
test("isResourceAvailable recognises each resource type from its backend payload field", () => {
  const cases: { type: ResourceTabType; payload: Partial<ChapterResourcesPayload> }[] = [
    { type: "infographic", payload: { infographicUrl: "https://api.test/infographic.png" } },
    { type: "mindmap", payload: { mindmapUrl: "https://api.test/mindmap.json" } },
    { type: "slidedeck", payload: { slidedeckUrl: "https://api.test/deck.pdf" } },
    { type: "textbook", payload: { textbookUrl: "https://api.test/textbook.pdf" } },
    { type: "flashcards", payload: { flashcards: [{ id: "f1", front: "a", back: "b" } as any] } },
    { type: "table", payload: { tableColumns: [{ key: "c1", label: "C1" } as any] } },
    { type: "audio", payload: { audioUrl: "https://api.test/audio.m4a" } },
    { type: "video", payload: { videoUrl: "https://api.test/video.mp4" } },
  ];

  for (const { type, payload } of cases) {
    assert.equal(
      isResourceAvailable(type, { ...base, ...payload }),
      true,
      `${type} should be available when its payload field is present`
    );
    assert.equal(
      isResourceAvailable(type, base),
      false,
      `${type} must not be available on an empty payload`
    );
  }
});

test("isResourceAvailable accepts documented alternate payload fields", () => {
  assert.equal(isResourceAvailable("mindmap", { ...base, mindmapRoot: { label: "root" } as any }), true);
  assert.equal(
    isResourceAvailable("textbook", { ...base, textbookNotesUrl: "https://api.test/notes.pdf" }),
    true
  );
});

test("empty collections and missing payloads count as unavailable", () => {
  assert.equal(isResourceAvailable("flashcards", { ...base, flashcards: [] }), false);
  assert.equal(isResourceAvailable("table", { ...base, tableColumns: [] }), false);
  assert.equal(isResourceAvailable("infographic", null), false);
  assert.equal(isResourceAvailable("infographic", undefined), false);
});

test("arcade never gates chapter completion", () => {
  assert.equal(isResourceAvailable("arcade" as ResourceTabType, { ...base, videoUrl: "x" }), false);
  assert.ok(!listAvailableResourceTypes({ ...base, videoUrl: "x" }).includes("arcade" as ResourceTabType));
});

test("listAvailableResourceTypes returns only what the chapter actually has, in tab order", () => {
  const resources: ChapterResourcesPayload = {
    ...base,
    audioUrl: "https://api.test/audio.m4a",
    infographicUrl: "https://api.test/infographic.png",
    videoUrl: "https://api.test/video.mp4",
  };
  assert.deepEqual(listAvailableResourceTypes(resources), ["infographic", "audio", "video"]);
  assert.deepEqual(listAvailableResourceTypes(base), []);
  assert.deepEqual(listAvailableResourceTypes(null), []);
});

// Source-level guards. ResourceContainer renders React and cannot be mounted in
// this test runner, so assert on the file itself: these catch a dropped case or
// a reintroduced silent fallback, which earlier releases both shipped.
test("ResourceContainer handles every resource type through the shared availability check", () => {
  const expected: Record<string, string> = {
    infographic: "ImageViewer",
    mindmap: "MindmapViewer",
    slidedeck: "SlideDeckViewer",
    textbook: "PDFViewer",
    flashcards: "FlashcardViewer",
    table: "TableViewer",
    audio: "AudioViewer",
    video: "VideoViewer",
  };

  for (const [type, viewer] of Object.entries(expected)) {
    assert.ok(
      RESOURCE_CONTAINER.includes(`case "${type}":`),
      `ResourceContainer is missing a case for '${type}'`
    );
    assert.ok(
      RESOURCE_CONTAINER.includes(`isResourceAvailable("${type}", resources)`),
      `'${type}' must gate on the shared isResourceAvailable helper`
    );
    assert.ok(
      RESOURCE_CONTAINER.includes(`<${viewer}`),
      `ResourceContainer should render ${viewer} for '${type}'`
    );
  }
});

test("ResourceContainer does not silently fall back to the infographic viewer", () => {
  const defaultBranch = RESOURCE_CONTAINER.slice(RESOURCE_CONTAINER.indexOf("default:"));
  assert.ok(defaultBranch.length > 0, "expected a default branch");
  assert.ok(
    !defaultBranch.includes("<ImageViewer"),
    "an unhandled tab must not render the infographic viewer"
  );
  assert.ok(
    defaultBranch.includes("<ContentComingSoon"),
    "an unhandled tab should render the unavailable state"
  );
});

test("every resource viewer reports progress only after a successful display", () => {
  const viewers = [
    "ImageViewer",
    "MindmapViewer",
    "SlideDeckViewer",
    "PDFViewer",
    "FlashcardViewer",
    "TableViewer",
    "AudioViewer",
    "VideoViewer",
  ];

  for (const viewer of viewers) {
    const source = readFileSync(
      join(process.cwd(), `src/features/subjects/viewers/${viewer}.tsx`),
      "utf8"
    );
    const calls = source.split("onResourceDisplayed?.()").length - 1;
    assert.equal(
      calls,
      1,
      `${viewer} should report progress from exactly one place, found ${calls}`
    );
    assert.match(
      source,
      /displayed[A-Za-z]*Ref/,
      `${viewer} must guard progress reporting so re-renders cannot re-report it`
    );
  }
});
