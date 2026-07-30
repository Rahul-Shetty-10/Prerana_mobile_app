import { LightningQuestion } from "../../types";

export const BIOLOGY_QUESTIONS: LightningQuestion[] = [
  {
    id: "lt-bio-1",
    category: "Biology",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Which organelle is called the powerhouse of the cell?",
    options: ["Ribosome", "Nucleus", "Mitochondria", "Lysosome"],
    correctIndex: 2,
  },
  {
    id: "lt-bio-2",
    category: "Biology",
    questionType: "true_false",
    difficulty: "Easy",
    question: "Hemoglobin carries oxygen in human blood.",
    options: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "lt-bio-3",
    category: "Biology",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Which acid is present in human stomach gastric juice?",
    options: ["Sulfuric Acid", "Hydrochloric Acid", "Nitric Acid", "Acetic Acid"],
    correctIndex: 1,
  },
  {
    id: "lt-bio-4",
    category: "Biology",
    questionType: "true_false",
    difficulty: "Medium",
    question: "DNA stands for Deoxyribonucleic Acid.",
    options: ["True", "False"],
    correctIndex: 0,
  },
];
