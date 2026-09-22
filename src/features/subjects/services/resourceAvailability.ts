import type { ResourceTabType } from "../types/chapterResource.ts";
import type { ChapterResourcesPayload } from "./chapterResourcesService.ts";
import { RESOURCE_TABS_LIST } from "../constants/chapterResourceData.ts";

/**
 * Single source of truth for "does this chapter actually have this resource?".
 *
 * `ResourceContainer` uses it to decide between a viewer and the unavailable
 * state, and `ChapterResourceScreen` uses it to record which resources a
 * chapter offers. Both must agree: if they drift, a chapter can require a
 * resource for completion that is never rendered, making completion
 * unreachable.
 */
export function isResourceAvailable(
  tab: ResourceTabType,
  resources?: ChapterResourcesPayload | null
): boolean {
  if (!resources) return false;

  switch (tab) {
    case "infographic":
      return Boolean(resources.infographicUrl);
    case "mindmap":
      return Boolean(resources.mindmapUrl || resources.mindmapRoot);
    case "slidedeck":
      return Boolean(resources.slidedeckUrl);
    case "textbook":
      return Boolean(resources.textbookUrl || resources.textbookNotesUrl);
    case "flashcards":
      return Boolean(resources.flashcards && resources.flashcards.length > 0);
    case "table":
      return Boolean(resources.tableColumns && resources.tableColumns.length > 0);
    case "audio":
      return Boolean(resources.audioUrl);
    case "video":
      return Boolean(resources.videoUrl);
    default:
      // "arcade" and any future tab are not resource viewers and never gate
      // chapter completion.
      return false;
  }
}

/**
 * The resource types this chapter genuinely offers, in tab order. Used both to
 * build the tab strip and to persist the completion requirement for a chapter.
 */
export function listAvailableResourceTypes(
  resources?: ChapterResourcesPayload | null
): ResourceTabType[] {
  if (!resources) return [];
  return RESOURCE_TABS_LIST.map((tab) => tab.id).filter((id) => isResourceAvailable(id, resources));
}
