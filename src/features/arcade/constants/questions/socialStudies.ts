import { LightningQuestion } from "../../types";

export const SOCIAL_STUDIES_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-soc-1",
    category: "Social Studies",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Line of latitude dividing Earth into Northern & Southern Hemispheres:",
    options: ["Tropic of Cancer", "Prime Meridian", "Equator", "Tropic of Capricorn"],
    correctIndex: 2,
  },
  {
    id: "lt-soc-2",
    category: "Social Studies",
    questionType: "true_false",
    difficulty: "Easy",
    question: "Black soil is also known as Regur soil.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-soc-3",
    category: "Social Studies",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Organ of UN responsible for maintaining world peace & security:",
    options: [
      "General Assembly",
      "Security Council",
      "International Court",
      "Secretariat",
    ],
    correctIndex: 1,
  },
];
