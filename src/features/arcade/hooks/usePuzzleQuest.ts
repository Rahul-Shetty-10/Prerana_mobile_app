import { useCallback, useRef, useState } from "react";
import { fetchPuzzleQuestPuzzles } from "../services";
import { PuzzleDifficulty, PuzzleItem, PuzzleQuestSessionResult } from "../types";
import { useGameEngine } from "./useGameEngine";

export function usePuzzleQuest(initialDifficulty: PuzzleDifficulty = "Medium") {
  const engine = useGameEngine({ maxLives: 999, basePoints: 20 });
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>(initialDifficulty);
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionResult, setSessionResult] = useState<PuzzleQuestSessionResult | null>(null);

  // Solve time tracking
  const puzzleStartTimeRef = useRef<number>(Date.now());
  const solveTimesRef = useRef<number[]>([]);

  const startSession = useCallback(
    async (selectedDifficulty?: PuzzleDifficulty) => {
      const diff = selectedDifficulty || difficulty;
      setDifficulty(diff);
      const fetchedPuzzles = await fetchPuzzleQuestPuzzles(diff);
      setPuzzles(fetchedPuzzles);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setIsAnswered(false);
      setShowHint(false);
      setSessionResult(null);
      solveTimesRef.current = [];
      puzzleStartTimeRef.current = Date.now();
      engine.startGame();
    },
    [difficulty, engine]
  );

  const currentPuzzle = puzzles[currentIndex];

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnswered || engine.status !== "playing" || !currentPuzzle) return;

      const elapsedMs = Date.now() - puzzleStartTimeRef.current;
      solveTimesRef.current.push(elapsedMs);

      setSelectedIndex(optionIndex);
      setIsAnswered(true);

      const isCorrect = optionIndex === currentPuzzle.correctIndex;

      if (isCorrect) {
        engine.registerCorrect();
        // Fast solve bonus (+5 pts if under 5 seconds)
        if (elapsedMs < 5000) {
          engine.setStatus("playing");
        }
      } else {
        engine.registerWrong();
      }

      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx >= puzzles.length) {
          // Finalize session
          const totalAns = puzzles.length;
          const finalCorrect = isCorrect ? engine.correctAnswers + 1 : engine.correctAnswers;
          const accuracy = Math.round((finalCorrect / Math.max(1, totalAns)) * 100);
          const totalMs = solveTimesRef.current.reduce((acc, curr) => acc + curr, 0);
          const avgSec = Number((totalMs / Math.max(1, totalAns) / 1000).toFixed(2));
          const finalScore = engine.score + (isCorrect ? 20 : 0);
          const xpEarned = finalScore + finalCorrect * 15;
          const coinsEarned = Math.floor(finalScore / 6);

          const result: PuzzleQuestSessionResult = {
            difficulty,
            score: finalScore,
            totalPuzzles: totalAns,
            solvedCount: finalCorrect,
            incorrectCount: totalAns - finalCorrect,
            accuracy,
            highestLogicStreak: Math.max(engine.maxCombo, isCorrect ? engine.combo + 1 : engine.combo),
            averageSolveTimeSeconds: avgSec,
            xpEarned,
            coinsEarned,
            victory: true,
          };

          setSessionResult(result);
          engine.finishGame();
        } else {
          setSelectedIndex(null);
          setIsAnswered(false);
          setShowHint(false);
          setCurrentIndex(nextIdx);
          puzzleStartTimeRef.current = Date.now();
        }
      }, 1200);
    },
    [isAnswered, engine, currentPuzzle, currentIndex, puzzles]
  );

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  return {
    engine,
    difficulty,
    puzzles,
    currentPuzzle,
    currentIndex,
    selectedIndex,
    isAnswered,
    showHint,
    sessionResult,
    startSession,
    selectAnswer,
    toggleHint,
  };
}
