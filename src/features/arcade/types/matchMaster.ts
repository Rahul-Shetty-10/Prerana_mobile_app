export type MatchDifficulty = "Easy" | "Medium" | "Hard";

export interface MatchPair {
  id: string;
  category: string;
  itemA: string;
  itemB: string;
}

export interface MatchCardItem {
  id: string; // unique card id (e.g. "pair-1-a" or "pair-1-b")
  pairId: string;
  text: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MatchMasterSessionResult {
  difficulty: MatchDifficulty;
  score: number;
  moves: number;
  totalPairs: number;
  matchedPairs: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  highestCombo: number;
  completionTimeSeconds: number;
  victory: boolean;
}

export interface MemoryCardProps {
  card: MatchCardItem;
  onPress: (card: MatchCardItem) => void;
  disabled?: boolean;
}

export interface MemoryGridProps {
  cards: MatchCardItem[];
  onCardPress: (card: MatchCardItem) => void;
  disabled?: boolean;
}

export interface DifficultyModalProps {
  visible: boolean;
  onSelectDifficulty: (difficulty: MatchDifficulty) => void;
  onCancel: () => void;
}
