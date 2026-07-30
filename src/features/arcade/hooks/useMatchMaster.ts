import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMatchCards, getPairCountForDifficulty } from "../services";
import { MatchCardItem, MatchDifficulty, MatchMasterSessionResult } from "../types";
import { useGameEngine } from "./useGameEngine";

export function useMatchMaster(initialDifficulty: MatchDifficulty = "Easy") {
  const engine = useGameEngine({ maxLives: 999, basePoints: 15 });
  const [difficulty, setDifficulty] = useState<MatchDifficulty>(initialDifficulty);
  const [cards, setCards] = useState<MatchCardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<MatchCardItem[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionResult, setSessionResult] = useState<MatchMasterSessionResult | null>(null);

  // Elapsed time tracker
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = getPairCountForDifficulty(difficulty);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSession = useCallback(
    (selectedDifficulty?: MatchDifficulty) => {
      const diff = selectedDifficulty || difficulty;
      setDifficulty(diff);
      const deck = fetchMatchCards(diff);
      setCards(deck);
      setFlippedCards([]);
      setMoves(0);
      setMatchedPairs(0);
      setIsProcessing(false);
      setSessionResult(null);
      engine.startGame();
      startTimer();
    },
    [difficulty, engine, startTimer]
  );

  const flipCard = useCallback(
    (targetCard: MatchCardItem) => {
      if (
        isProcessing ||
        targetCard.isFlipped ||
        targetCard.isMatched ||
        engine.status !== "playing"
      ) {
        return;
      }

      // Mark targeted card flipped
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === targetCard.id ? { ...c, isFlipped: true } : c))
      );

      if (flippedCards.length === 0) {
        // First card of pair
        setFlippedCards([targetCard]);
      } else if (flippedCards.length === 1) {
        // Second card of pair
        const firstCard = flippedCards[0];
        setFlippedCards([firstCard, targetCard]);
        setMoves((prev) => prev + 1);

        if (firstCard.pairId === targetCard.pairId) {
          // MATCH FOUND!
          engine.registerCorrect();
          setMatchedPairs((prevMatched) => {
            const nextMatched = prevMatched + 1;
            // Mark both matched
            setCards((prevCards) =>
              prevCards.map((c) =>
                c.pairId === targetCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c
              )
            );
            setFlippedCards([]);

            if (nextMatched >= getPairCountForDifficulty(difficulty)) {
              // VICTORY!
              stopTimer();
              const finalMoves = moves + 1;
              const accuracy = Math.round((nextMatched / Math.max(1, finalMoves)) * 100);
              const finalScore = engine.score + 15 * Math.min(engine.combo + 1, 5);
              const xpEarned = finalScore + nextMatched * 10;
              const coinsEarned = Math.floor(finalScore / 8);

              const result: MatchMasterSessionResult = {
                difficulty,
                score: finalScore,
                moves: finalMoves,
                totalPairs: nextMatched,
                matchedPairs: nextMatched,
                accuracy,
                xpEarned,
                coinsEarned,
                highestCombo: Math.max(engine.maxCombo, engine.combo + 1),
                completionTimeSeconds: elapsedTime,
                victory: true,
              };

              setSessionResult(result);
              engine.finishGame();
            }
            return nextMatched;
          });
        } else {
          // MIS-MATCH!
          engine.registerWrong();
          setIsProcessing(true);

          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c) =>
                c.id === firstCard.id || c.id === targetCard.id
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setIsProcessing(false);
          }, 900);
        }
      }
    },
    [
      isProcessing,
      flippedCards,
      engine,
      difficulty,
      moves,
      stopTimer,
      elapsedTime,
    ]
  );

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    engine,
    difficulty,
    cards,
    moves,
    matchedPairs,
    totalPairs,
    elapsedTime,
    isProcessing,
    sessionResult,
    startSession,
    flipCard,
  };
}
