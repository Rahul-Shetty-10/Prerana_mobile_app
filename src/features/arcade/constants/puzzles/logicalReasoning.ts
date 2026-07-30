import { PuzzleItem } from "../../types";

export const LOGICAL_REASONING_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-lr-1",
    category: "Logical Reasoning",
    questionType: "mcq",
    difficulty: "Easy",
    question: "If CAT = 24 (3+1+20), what is DOG (4+15+7)?",
    options: ["22", "26", "28", "30"],
    correctIndex: 1,
    explanation: "Sum of alphabetical positions: D(4) + O(15) + G(7) = 26.",
    hint: "Add up the alphabetical letter positions (A=1, B=2, C=3...).",
  },
  {
    id: "pq-lr-2",
    category: "Logical Reasoning",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Syllogism: All Birds have wings. All Sparrows are birds. Therefore:",
    options: [
      "All Sparrows have wings",
      "Some Sparrows cannot fly",
      "All wings belong to sparrows",
      "No sparrows have wings",
    ],
    correctIndex: 0,
    explanation: "Standard deductive logic: If all A are B and all B have C, then all A have C.",
    hint: "Follow the logical deduction chain directly.",
  },
  {
    id: "pq-lr-3",
    category: "Logical Reasoning",
    questionType: "mcq",
    difficulty: "Hard",
    question: "A is father of B, but B is not son of A. What is B to A?",
    options: ["Brother", "Daughter", "Uncle", "Nephew"],
    correctIndex: 1,
    explanation: "If A is father of B and B is not a son, B must be his daughter.",
    hint: "Think of other child relationships besides son.",
  },
];
