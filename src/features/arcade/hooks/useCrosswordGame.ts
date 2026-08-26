/**
 * useCrosswordGame.ts
 *
 * All game state and logic for the chapter crossword.
 * Receives a real CrosswordPuzzle from the backend (via route params).
 * No mock data. No hardcoded words or answers.
 */

import { useState, useCallback, useMemo } from "react";
import {
  CrosswordCell,
  CrosswordPuzzle,
  CrosswordWord,
} from "../../subjects/types/wordGames";

// ─── Public types ─────────────────────────────────────────────────────────────

export type CellKey = string; // "row,col"
export type UserGrid = Record<CellKey, string>; // cell key → entered letter (uppercase)
export type CellStatus = "correct" | "incorrect" | "unchecked";
export type CheckedGrid = Record<CellKey, CellStatus>;

export interface CellPosition {
  row: number;
  col: number;
}

export interface CrosswordGameState {
  selectedCell: CellPosition | null;
  selectedDirection: "across" | "down";
  userGrid: UserGrid;
  checkedGrid: CheckedGrid;
  hasChecked: boolean;
  isComplete: boolean;
  activeWord: CrosswordWord | null;
  activeWordCells: CellPosition[];
  cellMap: Map<CellKey, CrosswordCell>;
  acrossWords: CrosswordWord[];
  downWords: CrosswordWord[];
  // Actions
  selectCell: (row: number, col: number) => void;
  enterLetter: (letter: string) => void;
  deleteLetter: () => void;
  selectWord: (word: CrosswordWord) => void;
  checkAnswers: () => void;
  resetGame: () => void;
}

// ─── Pure helpers (exported so grid/cell components can reuse) ────────────────

/** Build a string key from row/col coordinates. */
export function cellKey(row: number, col: number): CellKey {
  return `${row},${col}`;
}

/** Return all cell positions covered by a word, in reading order. */
export function getWordCells(word: CrosswordWord): CellPosition[] {
  return Array.from({ length: word.answer.length }, (_, i) =>
    word.direction === "across"
      ? { row: word.row, col: word.col + i }
      : { row: word.row + i, col: word.col }
  );
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function cellBelongsToWord(cell: CellPosition, word: CrosswordWord): boolean {
  return getWordCells(word).some(
    (c) => c.row === cell.row && c.col === cell.col
  );
}

function findWord(
  cell: CellPosition,
  direction: "across" | "down",
  words: CrosswordWord[]
): CrosswordWord | null {
  return (
    words.find((w) => w.direction === direction && cellBelongsToWord(cell, w)) ??
    null
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCrosswordGame(puzzle: CrosswordPuzzle): CrosswordGameState {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<"across" | "down">(
    "across"
  );
  const [userGrid, setUserGrid] = useState<UserGrid>({});
  const [checkedGrid, setCheckedGrid] = useState<CheckedGrid>({});
  const [hasChecked, setHasChecked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // O(1) lookup for playable cells — rebuilt only when puzzle changes
  const cellMap = useMemo(() => {
    const map = new Map<CellKey, CrosswordCell>();
    for (const cell of puzzle.cells) {
      // Safely ignore duplicates (last write wins — should never happen in valid data)
      map.set(cellKey(cell.row, cell.col), cell);
    }
    return map;
  }, [puzzle.cells]);

  const acrossWords = useMemo(
    () =>
      [...puzzle.words]
        .filter((w) => w.direction === "across")
        .sort((a, b) => a.number - b.number),
    [puzzle.words]
  );

  const downWords = useMemo(
    () =>
      [...puzzle.words]
        .filter((w) => w.direction === "down")
        .sort((a, b) => a.number - b.number),
    [puzzle.words]
  );

  const activeWord = useMemo(
    () =>
      selectedCell
        ? findWord(selectedCell, selectedDirection, puzzle.words)
        : null,
    [selectedCell, selectedDirection, puzzle.words]
  );

  const activeWordCells = useMemo(
    () => (activeWord ? getWordCells(activeWord) : []),
    [activeWord]
  );

  // ─── selectCell ─────────────────────────────────────────────────────────────
  const selectCell = useCallback(
    (row: number, col: number) => {
      if (!cellMap.has(cellKey(row, col))) return;

      if (selectedCell?.row === row && selectedCell?.col === col) {
        // Same cell tapped → toggle direction if both words exist at this cell
        const hasAcross = !!findWord({ row, col }, "across", puzzle.words);
        const hasDown = !!findWord({ row, col }, "down", puzzle.words);
        if (hasAcross && hasDown) {
          setSelectedDirection((d) => (d === "across" ? "down" : "across"));
        }
        return;
      }

      setSelectedCell({ row, col });

      // Auto-pick direction for the new cell
      const hasAcross = !!findWord({ row, col }, "across", puzzle.words);
      const hasDown = !!findWord({ row, col }, "down", puzzle.words);
      if (hasAcross && !hasDown) setSelectedDirection("across");
      else if (hasDown && !hasAcross) setSelectedDirection("down");
      // If both: keep current direction
    },
    [selectedCell, cellMap, puzzle.words]
  );

  // ─── enterLetter ────────────────────────────────────────────────────────────
  const enterLetter = useCallback(
    (letter: string) => {
      if (!selectedCell) return;
      const upper = letter.toUpperCase();
      if (!/^[A-Z]$/.test(upper)) return;

      const key = cellKey(selectedCell.row, selectedCell.col);

      setUserGrid((prev) => ({ ...prev, [key]: upper }));
      // Reset check status for this cell so stale results clear on re-type
      setCheckedGrid((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      // Auto-advance to next cell in the active word
      const word = findWord(selectedCell, selectedDirection, puzzle.words);
      if (word) {
        const cells = getWordCells(word);
        const idx = cells.findIndex(
          (c) => c.row === selectedCell.row && c.col === selectedCell.col
        );
        if (idx >= 0 && idx < cells.length - 1) {
          setSelectedCell(cells[idx + 1]);
        }
      }
    },
    [selectedCell, selectedDirection, puzzle.words]
  );

  // ─── deleteLetter ───────────────────────────────────────────────────────────
  const deleteLetter = useCallback(() => {
    if (!selectedCell) return;
    const key = cellKey(selectedCell.row, selectedCell.col);

    if (userGrid[key]) {
      // Delete current cell
      setUserGrid((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setCheckedGrid((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      // Cell is empty — move back one cell and delete there
      const word = findWord(selectedCell, selectedDirection, puzzle.words);
      if (word) {
        const cells = getWordCells(word);
        const idx = cells.findIndex(
          (c) => c.row === selectedCell.row && c.col === selectedCell.col
        );
        if (idx > 0) {
          const prevPos = cells[idx - 1];
          setSelectedCell(prevPos);
          const prevKey = cellKey(prevPos.row, prevPos.col);
          setUserGrid((g) => {
            const n = { ...g };
            delete n[prevKey];
            return n;
          });
          setCheckedGrid((g) => {
            const n = { ...g };
            delete n[prevKey];
            return n;
          });
        }
      }
    }
  }, [selectedCell, selectedDirection, userGrid, puzzle.words]);

  // ─── selectWord (from clue list tap) ────────────────────────────────────────
  const selectWord = useCallback(
    (word: CrosswordWord) => {
      const cells = getWordCells(word);
      if (!cells.length) return;
      // Jump to first empty cell in the word, or start of word if all filled
      const firstEmpty = cells.find((c) => !userGrid[cellKey(c.row, c.col)]);
      setSelectedCell(firstEmpty ?? cells[0]);
      setSelectedDirection(word.direction);
    },
    [userGrid]
  );

  // ─── checkAnswers ────────────────────────────────────────────────────────────
  const checkAnswers = useCallback(() => {
    if (!puzzle.words.length) return;

    // Build a correct-letter map from all words (intersecting cells share the same letter)
    const expectedLetters: Record<CellKey, string> = {};
    for (const word of puzzle.words) {
      const cells = getWordCells(word);
      cells.forEach((cell, i) => {
        expectedLetters[cellKey(cell.row, cell.col)] = word.answer[i];
      });
    }

    // Mark each entered cell as correct or incorrect
    const newChecked: CheckedGrid = {};
    for (const [key, userLetter] of Object.entries(userGrid)) {
      if (userLetter && expectedLetters[key]) {
        newChecked[key] =
          userLetter === expectedLetters[key] ? "correct" : "incorrect";
      }
    }
    setCheckedGrid(newChecked);
    setHasChecked(true);

    // Completion: every cell in every word matches the answer
    const complete = puzzle.words.every((word) =>
      getWordCells(word).every(
        (c, i) => userGrid[cellKey(c.row, c.col)] === word.answer[i]
      )
    );
    setIsComplete(complete);
  }, [puzzle.words, userGrid]);

  // ─── resetGame ───────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setSelectedCell(null);
    setSelectedDirection("across");
    setUserGrid({});
    setCheckedGrid({});
    setHasChecked(false);
    setIsComplete(false);
  }, []);

  return {
    selectedCell,
    selectedDirection,
    userGrid,
    checkedGrid,
    hasChecked,
    isComplete,
    activeWord,
    activeWordCells,
    cellMap,
    acrossWords,
    downWords,
    selectCell,
    enterLetter,
    deleteLetter,
    selectWord,
    checkAnswers,
    resetGame,
  };
}
