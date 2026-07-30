import { LightningQuestion } from "../../types";

export const GEOGRAPHY_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-geo-1",
    category: "Geography",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Capital of India:",
    options: ["Mumbai", "New Delhi", "Kolkata", "Bengaluru"],
    correctIndex: 1,
  },
  {
    id: "lt-geo-2",
    category: "Geography",
    questionType: "true_false",
    difficulty: "Easy",
    question: "The Nile River is the longest river in the world.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-geo-3",
    category: "Geography",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Which ocean is the largest on Earth?",
    options: ["Atlantic", "Indian", "Pacific", "Arctic"],
    correctIndex: 2,
  },
  {
    id: "lt-geo-4",
    category: "Geography",
    questionType: "true_false",
    difficulty: "Medium",
    question: "Equator line is at 90° latitude.",
    options: ["True", "False"],
    correctIndex: 1,
  },
];
