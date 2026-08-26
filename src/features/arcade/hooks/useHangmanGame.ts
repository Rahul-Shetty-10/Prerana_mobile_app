import { useState, useCallback, useMemo } from "react";
import { HangmanPuzzle, HangmanWord } from "../../subjects/types/wordGames";

export type HangmanStatus = "playing" | "word_cleared" | "completed" | "game_over";

export interface HangmanGameState {
  currentWordIndex: number;
  currentWord: HangmanWord | null;
  guessedLetters: string[];
  lives: number;
  maxLives: number;
  status: HangmanStatus;
  isWordSolved: boolean;
  revealedWord: string;
  guessLetter: (letter: string) => void;
  nextWord: () => void;
  resetGame: () => void;
}

export function useHangmanGame(puzzle: HangmanPuzzle): HangmanGameState {
  const maxLives = 6;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lives, setLives] = useState(maxLives);
  const [status, setStatus] = useState<HangmanStatus>("playing");

  const currentWord = useMemo(() => {
    if (!puzzle?.words || puzzle.words.length === 0) return null;
    return puzzle.words[currentWordIndex] || null;
  }, [puzzle, currentWordIndex]);

  // Revealed word representation (e.g. "H A N G M A N" with blanks for unguessed letters)
  const revealedWord = useMemo(() => {
    if (!currentWord) return "";
    const answer = currentWord.answer.toUpperCase();
    return answer
      .split("")
      .map((char) => {
        // Automatically reveal spaces, hyphens, and punctuation; require guessing A-Z letters
        if (!/^[A-Z]$/.test(char)) {
          return char;
        }
        return guessedLetters.includes(char) ? char : "_";
      })
      .join("");
  }, [currentWord, guessedLetters]);

  const isWordSolved = useMemo(() => {
    if (!currentWord) return false;
    const answer = currentWord.answer.toUpperCase();
    for (const char of answer) {
      if (/^[A-Z]$/.test(char) && !guessedLetters.includes(char)) {
        return false;
      }
    }
    return true;
  }, [currentWord, guessedLetters]);

  const guessLetter = useCallback(
    (letter: string) => {
      if (status !== "playing" || !currentWord) return;
      const upper = letter.toUpperCase();
      if (!/^[A-Z]$/.test(upper) || guessedLetters.includes(upper)) return;

      const newGuessed = [...guessedLetters, upper];
      setGuessedLetters(newGuessed);

      const answer = currentWord.answer.toUpperCase();
      const isCorrect = answer.includes(upper);

      if (!isCorrect) {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setStatus("game_over");
          return;
        }
      }

      // Check if word is now solved
      const solved = answer.split("").every((char) => {
        if (!/^[A-Z]$/.test(char)) return true;
        return newGuessed.includes(char);
      });

      if (solved) {
        if (currentWordIndex >= puzzle.words.length - 1) {
          setStatus("completed");
        } else {
          setStatus("word_cleared");
        }
      }
    },
    [guessedLetters, lives, status, currentWord, currentWordIndex, puzzle]
  );

  const nextWord = useCallback(() => {
    if (status !== "word_cleared") return;
    setCurrentWordIndex((prev) => prev + 1);
    setGuessedLetters([]);
    setLives(maxLives);
    setStatus("playing");
  }, [status]);

  const resetGame = useCallback(() => {
    setCurrentWordIndex(0);
    setGuessedLetters([]);
    setLives(maxLives);
    setStatus("playing");
  }, []);

  return {
    currentWordIndex,
    currentWord,
    guessedLetters,
    lives,
    maxLives,
    status,
    isWordSolved,
    revealedWord,
    guessLetter,
    nextWord,
    resetGame,
  };
}
