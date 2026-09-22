import React from "react";
import { ResourceContainerProps } from "../types";
import { isResourceAvailable } from "../services/resourceAvailability.ts";
import {
  AudioViewer,
  ContentComingSoon,
  FlashcardViewer,
  ImageViewer,
  MindmapViewer,
  PDFViewer,
  SlideDeckViewer,
  TableViewer,
  VideoViewer,
} from "../viewers";

export function ResourceContainer({
  activeTab,
  chapterTitle,
  resources,
  slidedeckPageIndex,
  onSlidedeckPageChange,
  flashcardIndex,
  onFlashcardIndexChange,
  onResourceDisplayed,
}: ResourceContainerProps) {
  // Stable per tab: viewers use this in effect dependencies, so a fresh
  // identity on every render would re-fire progress tracking continuously.
  const handleDisplayed = React.useCallback(() => {
    onResourceDisplayed?.(activeTab);
  }, [onResourceDisplayed, activeTab]);

  switch (activeTab) {
    case "infographic":
      if (!isResourceAvailable("infographic", resources)) {
        return (
          <ContentComingSoon
            icon="image-outline"
            title="Infographic Unavailable"
            message="This infographic resource is currently unavailable."
          />
        );
      }
      return (
        <ImageViewer
          description={resources?.infographicDescription || "Visual concept flowchart and summary diagram."}
          imageUrl={resources?.infographicUrl}
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "mindmap":
      if (!isResourceAvailable("mindmap", resources)) {
        return (
          <ContentComingSoon
            icon="git-network-outline"
            title="Mind Map Unavailable"
            message="This mind map resource is currently unavailable."
          />
        );
      }
      return (
        <MindmapViewer
          title={resources?.chapterTitle || `${chapterTitle} Mind Map`}
          rootNode={resources?.mindmapRoot || ({ resourceUrl: resources?.mindmapUrl } as any)}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "slidedeck":
      if (!isResourceAvailable("slidedeck", resources)) {
        return (
          <ContentComingSoon
            icon="easel-outline"
            title="Slide Deck Unavailable"
            message="This slide deck resource is currently unavailable."
          />
        );
      }
      return (
        <SlideDeckViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Slidedeck`}
          pdfUrl={resources?.slidedeckUrl}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "textbook": {
      const textbookPdf = resources?.textbookUrl || resources?.textbookNotesUrl;
      if (!isResourceAvailable("textbook", resources)) {
        return (
          <ContentComingSoon
            icon="book-outline"
            title="Textbook Unavailable"
            message="This textbook resource is currently unavailable."
          />
        );
      }
      return (
        <PDFViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Textbook`}
          pdfUrl={textbookPdf}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          isSlidedeck={false}
          onResourceDisplayed={handleDisplayed}
        />
      );
    }

    case "flashcards":
      if (!isResourceAvailable("flashcards", resources)) {
        return (
          <ContentComingSoon
            icon="card-outline"
            title="Flashcards Unavailable"
            message="Flashcard resources are currently unavailable for this chapter."
          />
        );
      }
      return (
        <FlashcardViewer
          currentIndex={flashcardIndex}
          onIndexChange={onFlashcardIndexChange}
          flashcards={resources?.flashcards}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "table":
      if (!isResourceAvailable("table", resources)) {
        return (
          <ContentComingSoon
            icon="grid-outline"
            title="Table Unavailable"
            message="Table resources are currently unavailable for this chapter."
          />
        );
      }
      return (
        <TableViewer
          title={resources?.tableTitle || `${chapterTitle} Data Table`}
          columns={resources?.tableColumns}
          rows={resources?.tableRows}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "audio":
      if (!isResourceAvailable("audio", resources)) {
        return (
          <ContentComingSoon
            icon="headset-outline"
            title="Audio Unavailable"
            message="This audio resource is currently unavailable."
          />
        );
      }
      return (
        <AudioViewer
          audioTitle={resources?.audioTitle || `${chapterTitle} Audio Explanation`}
          audioUrl={resources?.audioUrl}
          durationSeconds={resources?.audioDurationSeconds}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
          onResourceDisplayed={handleDisplayed}
        />
      );

    case "video":
      if (!isResourceAvailable("video", resources)) {
        return (
          <ContentComingSoon
            icon="videocam-outline"
            title="Video Unavailable"
            message="This video resource is currently unavailable."
          />
        );
      }
      return (
        <VideoViewer
          title={resources?.chapterTitle}
          videoTitle={resources?.videoTitle || `${chapterTitle} Video Explanation`}
          videoUrl={resources?.videoUrl}
          authToken={resources?.authToken}
          onResourceDisplayed={handleDisplayed}
        />
      );

    default:
      // Never silently substitute the infographic for an unhandled tab: that
      // shows the wrong content and would credit the wrong resource.
      return (
        <ContentComingSoon
          icon="albums-outline"
          title="Resource Unavailable"
          message="This resource type is not supported in this version of the app."
        />
      );
  }
}
