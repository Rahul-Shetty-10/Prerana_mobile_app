import { LightningQuestion } from "../../types";

export const COMPUTER_SCIENCE_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-cs-1",
    category: "Computer Science",
    questionType: "mcq",
    difficulty: "Easy",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Control Power Unit",
      "Computer Processing Unit",
      "Core Program Unit",
    ],
    correctIndex: 0,
  },
  {
    id: "lt-cs-2",
    category: "Computer Science",
    questionType: "true_false",
    difficulty: "Easy",
    question: "1 Byte is equal to 8 Bits.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-cs-3",
    category: "Computer Science",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Who invented the World Wide Web in 1989?",
    options: ["Steve Jobs", "Tim Berners-Lee", "Bill Gates", "Alan Turing"],
    correctIndex: 1,
  },
  {
    id: "lt-cs-4",
    category: "Computer Science",
    questionType: "true_false",
    difficulty: "Medium",
    question: "RAM is a non-volatile memory.",
    options: ["True", "False"],
    correctIndex: 1,
  },
  {
    id: "lt-cs-5",
    category: "Computer Science",
    questionType: "mcq",
    difficulty: "Hard",
    question: "Base number system of Binary:",
    options: ["Base-8", "Base-10", "Base-2", "Base-16"],
    correctIndex: 2,
  },
];
