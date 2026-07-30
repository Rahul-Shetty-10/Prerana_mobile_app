import { PuzzleItem } from "../../types";

export const BIOLOGY_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-bio-1",
    category: "Biology",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Order of cell organization: Cell ⟶ Tissue ⟶ Organ ⟶ __?",
    options: ["Molecule", "Organ System", "Atom", "Organelle"],
    correctIndex: 1,
    explanation: "Multiple organs working together form an Organ System (e.g. Digestive system).",
    hint: "Think of the level above an organ.",
  },
];
