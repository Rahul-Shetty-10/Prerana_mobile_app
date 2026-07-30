import { useCallback, useState } from "react";
import { fetchBrainBlitzQuestions } from "../services";
import { BrainBlitzQuestion, BrainBlitzSessionResult, QuizCategory } from "../types";
import { useGameEngine } from "./useGameEngine";
import { useTimer } from "./useTimer";

export function useBrainBlitz() {
  const engine = useGameEngine({ maxLives: 3, basePoints: 10 });
  const [questions, setQuestions] = useState<BrainBlitzQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionResult, setSessionResult] = useState<BrainBlitzSessionResult | null>(null);

  // Time up handler for current question
  const handleTimeUp = useCallback(() => {
    if (engine.status !== "playing" || isAnswered) return;
    setIsAnswered(true);
    engine.registerWrong();

    setTimeout(() => {
      advanceNextQuestion();
    }, 1200);
  }, [engine, isAnswered]);

  const timer = useTimer({
    initialSeconds: 15,
    autoStart: false,
    onTimeUp: handleTimeUp,
  });

  const advanceNextQuestion = () => {
    setSelectedIndex(null);
    setIsAnswered(false);

    setCurrentIndex((prevIdx) => {
      const nextIdx = prevIdx + 1;
      if (nextIdx >= questions.length || engine.lives <= 0) {
        // Game Over or Completed
        finalizeSession();
        return prevIdx;
      }
      timer.restart(15);
      return nextIdx;
    });
  };

  const finalizeSession = () => {
    timer.pause();
    const totalAns = engine.correctAnswers + engine.wrongAnswers;
    const accuracy = totalAns > 0 ? Math.round((engine.correctAnswers / totalAns) * 100) : 0;
    const xpEarned = engine.score + engine.correctAnswers * 5;
    const coinsEarned = Math.floor(engine.score / 10);
    const isVictory = engine.lives > 0;

    // Determine best category based on active questions
    const categoryCount: Record<string, number> = {};
    questions.forEach((q) => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
    });
    const bestCat = (Object.keys(categoryCount)[0] || "General Knowledge") as QuizCategory;

    const result: BrainBlitzSessionResult = {
      score: engine.score,
      totalQuestions: questions.length,
      correctCount: engine.correctAnswers,
      wrongCount: engine.wrongAnswers,
      accuracy,
      xpEarned,
      coinsEarned,
      highestCombo: engine.maxCombo,
      bestCategory: bestCat,
      victory: isVictory,
    };

    setSessionResult(result);
    if (isVictory) {
      engine.finishGame();
    } else {
      engine.setStatus("game_over");
    }
  };

  const startSession = useCallback(() => {
    const fetched = fetchBrainBlitzQuestions(10);
    setQuestions(fetched);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setSessionResult(null);
    engine.startGame();
    timer.restart(15);
  }, [engine, timer]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnswered || engine.status !== "playing") return;
      timer.pause();
      setSelectedIndex(optionIndex);
      setIsAnswered(true);

      const currentQ = questions[currentIndex];
      const isCorrect = currentQ && optionIndex === currentQ.correctIndex;

      if (isCorrect) {
        engine.registerCorrect();
      } else {
        engine.registerWrong();
      }

      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        const currentLives = isCorrect ? engine.lives : engine.lives - 1;

        if (nextIdx >= questions.length || currentLives <= 0) {
          // Finalize session
          const totalAns = (isCorrect ? engine.correctAnswers + 1 : engine.correctAnswers) +
            (!isCorrect ? engine.wrongAnswers + 1 : engine.wrongAnswers);
          const finalCorrect = isCorrect ? engine.correctAnswers + 1 : engine.correctAnswers;
          const accuracy = totalAns > 0 ? Math.round((finalCorrect / totalAns) * 100) : 0;
          const finalScore = isCorrect ? engine.score + (10 * Math.min(engine.combo + 1, 5)) : engine.score;
          const xpEarned = finalScore + finalCorrect * 5;
          const coinsEarned = Math.floor(finalScore / 10);
          const victory = currentLives > 0;

          const result: BrainBlitzSessionResult = {
            score: finalScore,
            totalQuestions: questions.length,
            correctCount: finalCorrect,
            wrongCount: !isCorrect ? engine.wrongAnswers + 1 : engine.wrongAnswers,
            accuracy,
            xpEarned,
            coinsEarned,
            highestCombo: Math.max(engine.maxCombo, isCorrect ? engine.combo + 1 : engine.combo),
            bestCategory: currentQ ? currentQ.category : "General Knowledge",
            victory,
          };

          setSessionResult(result);
          if (victory) {
            engine.finishGame();
          } else {
            engine.setStatus("game_over");
          }
        } else {
          setSelectedIndex(null);
          setIsAnswered(false);
          setCurrentIndex(nextIdx);
          timer.restart(15);
        }
      }, 1200);
    },
    [isAnswered, engine, questions, currentIndex, timer]
  );

  return {
    engine,
    timer,
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    selectedIndex,
    isAnswered,
    sessionResult,
    startSession,
    selectAnswer,
  };
}
