import { PuzzleItem } from "../../types";

export const SCIENCE_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-sci-1",
    category: "Science",
    questionType: "mcq",
    difficulty: "Easy",
    question: "Identify cause & effect: Heavy Rainfall + Deforestation ⟹ ?",
    options: ["Drought", "Landslide", "Earthquake", "Tsunami"],
    correctIndex: 1,
    explanation: "Tree roots hold soil together; without trees, heavy rain causes soil erosion & landslides.",
    hint: "Think about what happens to loose soil on a slope during heavy rain.",
  },
  {
    id: "pq-sci-2",
    category: "Science",
    questionType: "mcq",
    difficulty: "Medium",
    question: "Order of energy flow in a food chain:",
    options: [
      "Producer ⟶ Primary Consumer ⟶ Secondary Consumer",
      "Consumer ⟶ Producer ⟶ Decomposer",
      "Decomposer ⟶ Secondary Consumer ⟶ Producer",
      "Primary Consumer ⟶ Producer ⟶ Secondary Consumer",
    ],
    correctIndex: 0,
    explanation: "Energy flows from plants (producers) to herbivores (primary consumers) to carnivores (secondary consumers).",
    hint: "Plants always capture sunlight first.",
  },
];
