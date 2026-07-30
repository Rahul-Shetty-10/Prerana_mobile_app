import { MatchCardItem, MatchDifficulty } from "../types";
import { MOCK_MATCH_PAIRS } from "../constants";

export function getPairCountForDifficulty(difficulty: MatchDifficulty): number {
  switch (difficulty) {
    case "Easy":
      return 6;
    case "Medium":
      return 8;
    case "Hard":
      return 10;
    default:
      return 6;
  }
}

export function fetchMatchCards(difficulty: MatchDifficulty = "Easy"): MatchCardItem[] {
  const pairCount = getPairCountForDifficulty(difficulty);

  // Shuffle master pairs
  const shuffledPairs = [...MOCK_MATCH_PAIRS];
  for (let i = shuffledPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPairs[i], shuffledPairs[j]] = [shuffledPairs[j], shuffledPairs[i]];
  }

  const selectedPairs = shuffledPairs.slice(0, pairCount);

  // Create card items (2 per pair: itemA and itemB)
  const cards: MatchCardItem[] = [];
  selectedPairs.forEach((pair) => {
    cards.push({
      id: `${pair.id}-a`,
      pairId: pair.id,
      text: pair.itemA,
      category: pair.category,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `${pair.id}-b`,
      pairId: pair.id,
      text: pair.itemB,
      category: pair.category,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Shuffle final deck
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}
