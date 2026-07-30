import { PuzzleItem } from "../../types";

export const GENERAL_KNOWLEDGE_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-gk-1",
    category: "General Knowledge",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Odd one out: Apple, Orange, Banana, Potato",
    options: ["Apple", "Orange", "Banana", "Potato"],
    correctIndex: 3,
    explanation: "Potato is a root vegetable; the rest are fruits.",
    hint: "Three of these grow on trees/plants as sweet fruits.",
  },
];
