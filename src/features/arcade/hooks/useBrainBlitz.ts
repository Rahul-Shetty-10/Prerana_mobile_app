import React, { useCallback, useRef, useState } from "react";
import { fetchBrainBlitzQuestions } from "../services";
import { BrainBlitzQuestion, BrainBlitzSessionResult, QuizCategory } from "../types";
import { useGameEngine } from "./useGameEngine";
import { useTimer } from "./useTimer";
import { useAuth } from "@clerk/expo";
import { recordQuestionAttempt } from "../../../shared/services/attemptTracker";

export function useBrainBlitz() {
  const { userId } = useAuth();
  const engine = useGameEngine({ maxLives: 3, basePoints: 10 });
  const [questions, setQuestions] = useState<BrainBlitzQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionResult, setSessionResult] = useState<BrainBlitzSessionResult | null>(null);

  // Stable refs to avoid infinite re-renders from object reference changes
  const engineRef = useRef(engine);
  const timerRef = useRef<ReturnType<typeof useTimer> | null>(null);
  const isAnsweredRef = useRef(isAnswered);
  const questionsRef = useRef(questions);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs up to date each render (no effects needed)
  engineRef.current = engine;
  isAnsweredRef.current = isAnswered;
  questionsRef.current = questions;
  currentIndexRef.current = currentIndex;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const finalizeSession = useCallback(() => {
    const eng = engineRef.current;
    const tmr = timerRef.current;
    tmr?.pause();
    const qs = questionsRef.current;
    const totalAns = eng.correctAnswers + eng.wrongAnswers;
    const accuracy = totalAns > 0 ? Math.round((eng.correctAnswers / totalAns) * 100) : 0;
    const xpEarned = eng.score + eng.correctAnswers * 5;
    const coinsEarned = Math.floor(eng.score / 10);
    const isVictory = eng.lives > 0;
    const categoryCount: Record<string, number> = {};
    qs.forEach((q) => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
    });
    const bestCat = (Object.keys(categoryCount)[0] || "General Knowledge") as QuizCategory;
    const result: BrainBlitzSessionResult = {
      score: eng.score,
      totalQuestions: qs.length,
      correctCount: eng.correctAnswers,
      wrongCount: eng.wrongAnswers,
      accuracy,
      xpEarned,
      coinsEarned,
      highestCombo: eng.maxCombo,
      bestCategory: bestCat,
      victory: isVictory,
    };
    setSessionResult(result);
    if (isVictory) {
      eng.finishGame();
    } else {
      eng.setStatus("game_over");
    }
  }, []);

  const advanceNextQuestion = useCallback(() => {
    setSelectedIndex(null);
    setIsAnswered(false);
    setCurrentIndex((prevIdx) => {
      const nextIdx = prevIdx + 1;
      const qs = questionsRef.current;
      const eng = engineRef.current;
      if (nextIdx >= qs.length || eng.lives <= 0) {
        finalizeSession();
        return prevIdx;
      }
      timerRef.current?.restart(15);
      return nextIdx;
    });
  }, [finalizeSession]);

  // Time up handler - stable, reads from refs
  const handleTimeUp = useCallback(() => {
    const eng = engineRef.current;
    if (eng.status !== "playing" || isAnsweredRef.current) return;
    setIsAnswered(true);
    eng.registerWrong();
    if (userId) {
      void recordQuestionAttempt(userId, false);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      advanceNextQuestion();
    }, 1200);
  }, [advanceNextQuestion]);

  const timer = useTimer({
    initialSeconds: 15,
    autoStart: false,
    onTimeUp: handleTimeUp,
  });
  // Update timer ref every render
  timerRef.current = timer;

  const startSession = useCallback(() => {
    const fetched = fetchBrainBlitzQuestions(10);
    setQuestions(fetched);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setIsAnswered(false);
    setSessionResult(null);
    engineRef.current.startGame();
    timerRef.current?.restart(15);
  }, []);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      const eng = engineRef.current;
      const tmr = timerRef.current;
      const qs = questionsRef.current;
      const idx = currentIndexRef.current;
      if (isAnsweredRef.current || eng.status !== "playing") return;
      tmr?.pause();
      setSelectedIndex(optionIndex);
      setIsAnswered(true);

      const currentQ = qs[idx];
      const isCorrect = currentQ && optionIndex === currentQ.correctIndex;

      if (isCorrect) {
        eng.registerCorrect();
      } else {
        eng.registerWrong();
      }
      
      if (userId) {
        void recordQuestionAttempt(userId, isCorrect);
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const nextIdx = idx + 1;
        const currentLives = isCorrect ? eng.lives : eng.lives - 1;

        if (nextIdx >= qs.length || currentLives <= 0) {
          const totalAns = (isCorrect ? eng.correctAnswers + 1 : eng.correctAnswers) +
            (!isCorrect ? eng.wrongAnswers + 1 : eng.wrongAnswers);
          const finalCorrect = isCorrect ? eng.correctAnswers + 1 : eng.correctAnswers;
          const accuracy = totalAns > 0 ? Math.round((finalCorrect / totalAns) * 100) : 0;
          const finalScore = isCorrect ? eng.score + (10 * Math.min(eng.combo + 1, 5)) : eng.score;
          const xpEarned = finalScore + finalCorrect * 5;
          const coinsEarned = Math.floor(finalScore / 10);
          const victory = currentLives > 0;
          const result: BrainBlitzSessionResult = {
            score: finalScore,
            totalQuestions: qs.length,
            correctCount: finalCorrect,
            wrongCount: !isCorrect ? eng.wrongAnswers + 1 : eng.wrongAnswers,
            accuracy,
            xpEarned,
            coinsEarned,
            highestCombo: Math.max(eng.maxCombo, isCorrect ? eng.combo + 1 : eng.combo),
            bestCategory: currentQ ? currentQ.category : "General Knowledge",
            victory,
          };
          setSessionResult(result);
          if (victory) {
            eng.finishGame();
          } else {
            eng.setStatus("game_over");
          }
        } else {
          setSelectedIndex(null);
          setIsAnswered(false);
          setCurrentIndex(nextIdx);
          tmr?.restart(15);
        }
      }, 1200);
    },
    []
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
