import React from "react";
import { ResourceContainerProps } from "../types";
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
  const handleDisplayed = () => {
    onResourceDisplayed?.(activeTab);
  };

  switch (activeTab) {
    case "infographic":
      if (!resources?.infographicUrl) {
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
      if (!resources?.mindmapUrl && !resources?.mindmapRoot) {
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
      if (!resources?.slidedeckUrl) {
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
      if (!textbookPdf) {
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
      if (!resources?.flashcards || resources.flashcards.length === 0) {
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
      if (!resources?.tableColumns || resources.tableColumns.length === 0) {
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
      if (!resources?.audioUrl) {
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
      if (!resources?.videoUrl) {
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
      return (
        <ImageViewer
          description={resources?.infographicDescription || "Visual concept flowchart and summary diagram."}
          imageUrl={resources?.infographicUrl}
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
          authToken={resources?.authToken}
          onResourceDisplayed={handleDisplayed}
        />
      );
  }
}
