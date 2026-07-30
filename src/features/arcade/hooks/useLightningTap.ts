import { useCallback, useRef, useState } from "react";
import { fetchLightningQuestions } from "../services";
import { LightningDifficulty, LightningQuestion, LightningTapSessionResult } from "../types";
import { useGameEngine } from "./useGameEngine";
import { useTimer } from "./useTimer";

export function useLightningTap(initialDifficulty: LightningDifficulty = "Medium") {
  const engine = useGameEngine({ maxLives: 999, basePoints: 10 });
  const [difficulty, setDifficulty] = useState<LightningDifficulty>(initialDifficulty);
  const [queue, setQueue] = useState<LightningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionResult, setSessionResult] = useState<LightningTapSessionResult | null>(null);

  // Response time tracking
  const questionStartTimeRef = useRef<number>(Date.now());
  const responseTimesRef = useRef<number[]>([]);

  // Time up handler when 60s expires
  const handleTimeUp = useCallback(() => {
    if (engine.status !== "playing") return;

    const totalAns = engine.correctAnswers + engine.wrongAnswers;
    const accuracy = totalAns > 0 ? Math.round((engine.correctAnswers / totalAns) * 100) : 0;
    const totalMs = responseTimesRef.current.reduce((acc, curr) => acc + curr, 0);
    const avgSec = totalAns > 0 ? Number((totalMs / totalAns / 1000).toFixed(2)) : 0;
    const xpEarned = engine.score + engine.correctAnswers * 5;
    const coinsEarned = Math.floor(engine.score / 8);

    const result: LightningTapSessionResult = {
      difficulty,
      score: engine.score,
      totalAnswered: totalAns,
      correctCount: engine.correctAnswers,
      wrongCount: engine.wrongAnswers,
      accuracy,
      highestCombo: engine.maxCombo,
      averageResponseTimeSeconds: avgSec,
      xpEarned,
      coinsEarned,
      victory: true,
    };

    setSessionResult(result);
    engine.finishGame();
  }, [engine, difficulty]);

  const timer = useTimer({
    initialSeconds: 60,
    autoStart: false,
    onTimeUp: handleTimeUp,
  });

  const startSession = useCallback(
    async (selectedDifficulty?: LightningDifficulty) => {
      const diff = selectedDifficulty || difficulty;
      setDifficulty(diff);
      const fetchedQueue = await fetchLightningQuestions(diff);
      setQueue(fetchedQueue);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setIsAnswered(false);
      setSessionResult(null);
      responseTimesRef.current = [];
      questionStartTimeRef.current = Date.now();
      engine.startGame();
      timer.restart(60);
    },
    [difficulty, engine, timer]
  );

  const currentQuestion = queue[currentIndex];

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnswered || engine.status !== "playing" || !currentQuestion) return;

      const elapsedForQuestion = Date.now() - questionStartTimeRef.current;
      responseTimesRef.current.push(elapsedForQuestion);

      setSelectedIndex(optionIndex);
      setIsAnswered(true);

      const isCorrect = optionIndex === currentQuestion.correctIndex;

      if (isCorrect) {
        // Multiplier: 5 -> 2x, 10 -> 3x, 20 -> 4x
        engine.registerCorrect();
      } else {
        engine.registerWrong();
      }

      // Rapid transition under 300ms
      setTimeout(() => {
        setSelectedIndex(null);
        setIsAnswered(false);
        questionStartTimeRef.current = Date.now();

        setCurrentIndex((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx >= queue.length) {
            // Loop back or end if ran out of pool
            return 0;
          }
          return nextIdx;
        });
      }, 250);
    },
    [isAnswered, engine, currentQuestion, queue]
  );

  // Urgency mode trigger when 10s or less remain
  const isUrgent = timer.timeLeft <= 10 && timer.timeLeft > 0;

  return {
    engine,
    timer,
    difficulty,
    currentQuestion,
    currentIndex,
    selectedIndex,
    isAnswered,
    isUrgent,
    sessionResult,
    startSession,
    selectAnswer,
  };
}
