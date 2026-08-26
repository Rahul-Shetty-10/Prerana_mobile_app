import { useState, useCallback, useMemo } from "react";
import { MemoryBattlePuzzle } from "../../subjects/types/wordGames";
import { MatchCardItem } from "../types/matchMaster";

export type MemoryBattleStatus = "playing" | "completed";

export interface MemoryBattleGameState {
  cards: MatchCardItem[];
  selectedCardIds: string[];
  movesCount: number;
  matchedPairIds: string[];
  status: MemoryBattleStatus;
  flipCard: (cardId: string) => void;
  resetGame: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function useMemoryBattleGame(puzzle: MemoryBattlePuzzle): MemoryBattleGameState {
  const [cards, setCards] = useState<MatchCardItem[]>(() => {
    if (!puzzle?.pairs) return [];
    const items: MatchCardItem[] = [];
    puzzle.pairs.forEach((pair) => {
      items.push({
        id: `${pair.id}-term`,
        pairId: pair.id,
        text: pair.term,
        category: "Term",
        isFlipped: false,
        isMatched: false,
      });
      items.push({
        id: `${pair.id}-match`,
        pairId: pair.id,
        text: pair.matchText,
        category: "Definition",
        isFlipped: false,
        isMatched: false,
      });
    });
    return shuffle(items);
  });

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [status, setStatus] = useState<MemoryBattleStatus>("playing");

  const flipCard = useCallback(
    (cardId: string) => {
      if (status !== "playing") return;
      if (selectedCardIds.length >= 2) return; // Prevent clicking while unmatched cards are flipping back

      const cardIndex = cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      const targetCard = cards[cardIndex];
      if (targetCard.isFlipped || targetCard.isMatched) return;

      // Flip the target card
      const updatedCards = [...cards];
      updatedCards[cardIndex] = { ...targetCard, isFlipped: true };
      setCards(updatedCards);

      const nextSelected = [...selectedCardIds, cardId];
      setSelectedCardIds(nextSelected);

      if (nextSelected.length === 2) {
        setMovesCount((m) => m + 1);
        const cardA = cards.find((c) => c.id === nextSelected[0]);
        const cardB = targetCard; // just flipped

        if (cardA && cardB && cardA.pairId === cardB.pairId) {
          // It's a match!
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c) =>
                c.id === cardA.id || c.id === cardB.id
                  ? { ...c, isFlipped: false, isMatched: true }
                  : c
              )
            );
            setSelectedCardIds([]);
            setMatchedPairIds((prev) => {
              const nextMatched = [...prev, cardA.pairId];
              if (nextMatched.length >= (puzzle.pairs?.length || 0)) {
                setStatus("completed");
              }
              return nextMatched;
            });
          }, 400); // Small delay to let the flip animation finish
        } else {
          // Not a match: flip both back after 1 second
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c) =>
                c.id === nextSelected[0] || c.id === cardId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setSelectedCardIds([]);
          }, 1000);
        }
      }
    },
    [cards, selectedCardIds, status, puzzle.pairs]
  );

  const resetGame = useCallback(() => {
    if (!puzzle?.pairs) return;
    const items: MatchCardItem[] = [];
    puzzle.pairs.forEach((pair) => {
      items.push({
        id: `${pair.id}-term`,
        pairId: pair.id,
        text: pair.term,
        category: "Term",
        isFlipped: false,
        isMatched: false,
      });
      items.push({
        id: `${pair.id}-match`,
        pairId: pair.id,
        text: pair.matchText,
        category: "Definition",
        isFlipped: false,
        isMatched: false,
      });
    });
    setCards(shuffle(items));
    setSelectedCardIds([]);
    setMovesCount(0);
    setMatchedPairIds([]);
    setStatus("playing");
  }, [puzzle.pairs]);

  return {
    cards,
    selectedCardIds,
    movesCount,
    matchedPairIds,
    status,
    flipCard,
    resetGame,
  };
}
