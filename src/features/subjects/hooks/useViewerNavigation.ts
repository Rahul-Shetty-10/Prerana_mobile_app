import { useState } from "react";

export interface ViewerNavigationResult {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleReset: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function useViewerNavigation(
  totalItems: number,
  currentIndex: number,
  onIndexChange: (index: number) => void
): ViewerNavigationResult {
  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleReset = () => {
    onIndexChange(0);
  };

  return {
    currentIndex,
    setCurrentIndex: onIndexChange,
    handlePrev,
    handleNext,
    handleReset,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < totalItems - 1,
  };
}
