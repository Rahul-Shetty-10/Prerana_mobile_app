import { LightningQuestion } from "../../types";

export const GENERAL_KNOWLEDGE_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-gk-1",
    category: "General Knowledge",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctIndex: 2,
  },
  {
    id: "lt-gk-2",
    category: "General Knowledge",
    questionType: "true_false",
    difficulty: "Easy",
    question: "Diamond is the hardest natural mineral.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-gk-3",
    category: "General Knowledge",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Official currency of Japan:",
    options: ["Yuan", "Won", "Yen", "Baht"],
    correctIndex: 2,
  },
];
