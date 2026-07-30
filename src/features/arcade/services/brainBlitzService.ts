import { BrainBlitzQuestion } from "../types";
import { MOCK_BRAIN_BLITZ_QUESTIONS } from "../constants";

export function fetchBrainBlitzQuestions(count: number = 10): BrainBlitzQuestion[] {
  // Shuffle array using Fisher-Yates and slice desired count
  const shuffled = [...MOCK_BRAIN_BLITZ_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
