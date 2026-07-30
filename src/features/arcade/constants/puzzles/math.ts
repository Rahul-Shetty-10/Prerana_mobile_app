import { PuzzleItem } from "../../types";

export const MATH_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-math-1",
    category: "Mathematics",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Complete the number sequence: 2, 4, 8, 16, __?",
    options: ["24", "30", "32", "64"],
    correctIndex: 2,
    explanation: "Each number is doubled (multiplied by 2). 16 × 2 = 32.",
    hint: "Look at the ratio between consecutive numbers.",
  },
  {
    id: "pq-math-2",
    category: "Mathematics",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Which number replaces the question mark? 5 + 3 × 2 - 4 = ?",
    options: ["7", "12", "9", "10"],
    correctIndex: 0,
    explanation: "Using order of operations (BODMAS): 3 × 2 = 6; 5 + 6 = 11; 11 - 4 = 7.",
    hint: "Remember to do multiplication before addition and subtraction.",
  },
  {
    id: "pq-math-3",
    category: "Mathematics",
    questionType: "mcq",
    difficulty: "Hard",
    question: "If A = 3, B = 6, and C = 9, what is the value of (A × C) ÷ B?",
    options: ["4.5", "5.5", "6", "9"],
    correctIndex: 0,
    explanation: "(3 × 9) ÷ 6 = 27 ÷ 6 = 4.5.",
    hint: "Substitute the values of A, B, and C first.",
  },
];
