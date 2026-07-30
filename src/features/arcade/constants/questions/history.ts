import { LightningQuestion } from "../../types";

export const HISTORY_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-his-1",
    category: "History",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Who is known as the Father of the Indian Constitution?",
    options: [
      "Mahatma Gandhi",
      "Dr. B.R. Ambedkar",
      "Jawaharlal Nehru",
      "Sardar Patel",
    ],
    correctIndex: 1,
  },
  {
    id: "lt-his-2",
    category: "History",
    questionType: "true_false",
    difficulty: "Easy",
    question: "India gained independence in 1947.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-his-3",
    category: "History",
    questionType: "mcq",
    difficulty: "Medium",
    question: "In which year did the Dandi March take place?",
    options: ["1920", "1930", "1942", "1947"],
    correctIndex: 1,
  },
];
