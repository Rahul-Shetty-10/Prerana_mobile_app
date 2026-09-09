import React from "react";
import { ResourceContainerProps } from "../types";
import {
  AudioViewer,
  FlashcardViewer,
  ImageViewer,
  SlideDeckViewer,
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

    case "slidedeck":
      return (
        <SlideDeckViewer
          documentTitle={resources?.chapterTitle || `${chapterTitle} Slidedeck`}
          pdfUrl={resources?.slidedeckUrl}
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

    case "video":
      return (
        <VideoViewer
          videoTitle={resources?.videoTitle || `${chapterTitle} Video Explanation`}
          videoUrl={resources?.videoUrl}
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