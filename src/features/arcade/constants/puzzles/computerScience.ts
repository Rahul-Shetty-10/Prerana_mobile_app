import { PuzzleItem } from "../../types";

export const COMPUTER_SCIENCE_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-cs-1",
    category: "Computer Science",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Evaluate logic gate: IF (True AND False) OR True ⟹ ?",
    options: ["False", "True", "Null", "Undefined"],
    correctIndex: 1,
    explanation: "(True AND False) = False; False OR True = True.",
    hint: "Evaluate the boolean operation in parentheses first.",
  },
  {
    id: "pq-cs-2",
    category: "Computer Science",
    questionType: "mcq",
    difficulty: "Hard",
    question: "Convert binary 1010 to decimal:",
    options: ["8", "10", "12", "14"],
    correctIndex: 1,
    explanation: "(1 × 8) + (0 × 4) + (1 × 2) + (0 × 1) = 8 + 2 = 10.",
    hint: "Powers of 2: 8, 4, 2, 1.",
  },
];
