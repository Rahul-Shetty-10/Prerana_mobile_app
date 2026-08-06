import React from "react";
import { ResourceContainerProps } from "../types";
import {
  AudioViewer,
  FlashcardViewer,
  ImageViewer,
  PDFViewer,
  SlideDeckViewer,
  TableViewer,
  MindmapViewer,
} from "../viewers";

export function ResourceContainer({
  activeTab,
  chapterTitle,
  resources,
  slidedeckPageIndex,
  onSlidedeckPageChange,
  flashcardIndex,
  onFlashcardIndexChange,
}: ResourceContainerProps) {
  switch (activeTab) {
    case "infographic":
      return (
        <ImageViewer
          description={resources?.infographicDescription || "Visual concept flowchart and summary diagram."}
          imageUrl={resources?.infographicUrl}
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
        />
      );

    case "mindmap":
      return (
        <MindmapViewer
          title={resources?.chapterTitle || `${chapterTitle} Mindmap`}
          rootNode={resources?.mindmapRoot}
        />
      );

    case "slidedeck":
      return (
        <SlideDeckViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Slidedeck`}
          pdfUrl={resources?.slidedeckUrl}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
        />
      );

    case "textbook":
      return (
        <PDFViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Textbook Notes`}
          pdfUrl={resources?.textbookNotesUrl}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
        />
      );

    case "flashcards":
      return (
        <FlashcardViewer
          currentIndex={flashcardIndex}
          onIndexChange={onFlashcardIndexChange}
          flashcards={resources?.flashcards}
        />
      );

    case "table":
      return (
        <TableViewer
          title={resources?.tableTitle || `${chapterTitle} Key Data Table`}
          columns={resources?.tableColumns}
          rows={resources?.tableRows}
        />
      );

    case "audio":
      return (
        <AudioViewer
          audioTitle={resources?.audioTitle || `${chapterTitle} Audio Explanation`}
          audioUrl={resources?.audioUrl}
          durationSeconds={resources?.audioDurationSeconds}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
        />
      );

    default:
      return (
        <ImageViewer
          description={resources?.infographicDescription || "Visual concept flowchart and summary diagram."}
          imageUrl={resources?.infographicUrl}
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
          authToken={resources?.authToken}
          tenantSlug={resources?.tenantSlug}
        />
      );
  }
}