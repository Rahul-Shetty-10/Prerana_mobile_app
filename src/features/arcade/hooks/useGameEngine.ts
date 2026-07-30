import { useCallback, useState } from "react";
import { GameEngineStatus } from "../types";

export interface GameEngineConfig {
  maxLives?: number;
  basePoints?: number;
}

export function useGameEngine(config: GameEngineConfig = {}) {
  const maxLives = config.maxLives ?? 3;
  const basePoints = config.basePoints ?? 10;

  const [status, setStatus] = useState<GameEngineStatus>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  const startGame = useCallback(() => {
    setStatus("playing");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(maxLives);
    setCorrectAnswers(0);
    setWrongAnswers(0);
  }, [maxLives]);

  const pauseGame = useCallback(() => {
    if (status === "playing") {
      setStatus("paused");
    }
  }, [status]);

  const resumeGame = useCallback(() => {
    if (status === "paused") {
      setStatus("playing");
    }
  }, [status]);

  const registerCorrect = useCallback(() => {
    setCorrectAnswers((prev) => prev + 1);
    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      setMaxCombo((currentMax) => Math.max(currentMax, nextCombo));
      // Calculate score with combo multiplier
      const multiplier = Math.min(nextCombo, 5);
      const points = basePoints * multiplier;
      setScore((prevScore) => prevScore + points);
      return nextCombo;
    });
  }, [basePoints]);

  const registerWrong = useCallback(() => {
    setWrongAnswers((prev) => prev + 1);
    setCombo(0);
    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        setStatus("game_over");
      }
      return Math.max(0, nextLives);
    });
  }, []);

  const finishGame = useCallback(() => {
    setStatus("completed");
  }, []);

  const resetEngine = useCallback(() => {
    setStatus("idle");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(maxLives);
    setCorrectAnswers(0);
    setWrongAnswers(0);
  }, [maxLives]);

  return {
    status,
    score,
    combo,
    maxCombo,
    lives,
    maxLives,
    correctAnswers,
    wrongAnswers,
    startGame,
    pauseGame,
    resumeGame,
    registerCorrect,
    registerWrong,
    finishGame,
    resetEngine,
    setStatus,
  };
}
