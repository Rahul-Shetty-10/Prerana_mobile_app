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
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
        />
      );

    case "mindmap":
      return (
        <MindmapViewer
          title={resources?.chapterTitle || `${chapterTitle} Mindmap`}
        />
      );

    case "slidedeck":
      return (
        <SlideDeckViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Slidedeck`}
        />
      );

    case "textbook":
      return (
        <PDFViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Textbook Notes`}
        />
      );

    case "flashcards":
      return (
        <FlashcardViewer
          currentIndex={flashcardIndex}
          onIndexChange={onFlashcardIndexChange}
        />
      );

    case "table":
      return (
        <TableViewer
          title={resources?.tableTitle || `${chapterTitle} Key Data Table`}
        />
      );

    case "audio":
      return (
        <AudioViewer
          audioTitle={resources?.audioTitle || `${chapterTitle} Audio Explanation`}
        />
      );

    default:
      return (
        <ImageViewer
          description={resources?.infographicDescription || "Visual concept flowchart and summary diagram."}
          imageUrl={resources?.infographicUrl}
          title={resources?.chapterTitle || `${chapterTitle} Infographic`}
        />
      );
  }
}