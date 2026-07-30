import { PuzzleItem } from "../../types";

export const ENGLISH_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-eng-1",
    category: "English",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Solve analogy: Light is to Dark as Knowledge is to __?",
    options: ["Wisdom", "Ignorance", "Intelligence", "Education"],
    correctIndex: 1,
    explanation: "Light and Dark are antonyms; the antonym of Knowledge is Ignorance.",
    hint: "Identify the relationship between the first pair.",
  },
  {
    id: "pq-eng-2",
    category: "English",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Which word does NOT belong in this group?",
    options: ["Orator", "Speaker", "Lecturer", "Audience"],
    correctIndex: 3,
    explanation: "Orator, Speaker, and Lecturer deliver speeches; Audience listens.",
    hint: "Three of these describe the person talking.",
  },
];
