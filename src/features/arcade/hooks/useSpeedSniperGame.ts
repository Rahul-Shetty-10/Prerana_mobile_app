import { useCallback, useState } from "react";
import { SpeedSniperPuzzle } from "../../subjects/types/wordGames";
import { useGameEngine } from "./useGameEngine";
import { useTimer } from "./useTimer";
import { useAuth } from "@clerk/clerk-expo";
import { recordQuestionAttempt } from "../../../shared/services/attemptTracker";

export interface SpeedSniperSessionResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  highestCombo: number;
  victory: boolean;
}

export function useSpeedSniperGame(puzzle: SpeedSniperPuzzle) {
  const { userId } = useAuth();
  const engine = useGameEngine({ maxLives: 999, basePoints: 10 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionResult, setSessionResult] = useState<SpeedSniperSessionResult | null>(null);

  const calculateResult = useCallback(() => {
    const total = engine.correctAnswers + engine.wrongAnswers;
    const accuracy = total > 0 ? Math.round((engine.correctAnswers / total) * 100) : 0;
    const xpEarned = engine.score + engine.correctAnswers * 5;
    const coinsEarned = Math.floor(engine.score / 8);

    return {
      score: engine.score,
      totalQuestions: puzzle.questions?.length || 0,
      correctCount: engine.correctAnswers,
      wrongCount: engine.wrongAnswers,
      accuracy,
      highestCombo: engine.maxCombo,
      xpEarned,
      coinsEarned,
      victory: engine.correctAnswers >= Math.ceil((puzzle.questions?.length || 0) * 0.5), // Win if got at least 50% correct
    };
  }, [engine, puzzle.questions]);

  const handleTimeUp = useCallback(() => {
    if (engine.status !== "playing") return;
    engine.setStatus("game_over");
    setSessionResult(calculateResult());
  }, [engine, calculateResult]);

  const initialTimerSecs = puzzle.timerSeconds || 30;
  const timer = useTimer({
    initialSeconds: initialTimerSecs,
    autoStart: false,
    onTimeUp: handleTimeUp,
  });

  const startSession = useCallback(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setSessionResult(null);
    engine.startGame();
    timer.restart(initialTimerSecs);
  }, [engine, timer, initialTimerSecs]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnswered || engine.status !== "playing" || !puzzle.questions) return;

      const currentQuestion = puzzle.questions[currentIndex];
      if (!currentQuestion) return;

      setSelectedIndex(optionIndex);
      setIsAnswered(true);

      const correctAnsText = currentQuestion.correctAnswer;
      const selectedAnsText = currentQuestion.choices[optionIndex];
      const isCorrect = selectedAnsText === correctAnsText;

      if (isCorrect) {
        engine.registerCorrect();
      } else {
        engine.registerWrong();
      }
      
      if (userId) {
        void recordQuestionAttempt(userId, isCorrect);
      }

      setTimeout(() => {
        setSelectedIndex(null);
        setIsAnswered(false);

        if (currentIndex < puzzle.questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Finished all questions!
          timer.pause();
          engine.finishGame();
          setSessionResult(calculateResult());
        }
      }, 500); // 500ms display of correctness feedback
    },
    [isAnswered, engine, currentIndex, puzzle.questions, calculateResult, timer]
  );

  return {
    engine,
    timer,
    currentIndex,
    selectedIndex,
    isAnswered,
    sessionResult,
    startSession,
    selectAnswer,
  };
}
