import { PuzzleItem } from "../types";
import { BIOLOGY_PUZZLES } from "./puzzles/biology";
import { COMPUTER_SCIENCE_PUZZLES } from "./puzzles/computerScience";
import { ENGLISH_PUZZLES } from "./puzzles/english";
import { GENERAL_KNOWLEDGE_PUZZLES } from "./puzzles/generalKnowledge";
import { GEOGRAPHY_PUZZLES } from "./puzzles/geography";
import { HISTORY_PUZZLES } from "./puzzles/history";
import { LOGICAL_REASONING_PUZZLES } from "./puzzles/logicalReasoning";
import { MATH_PUZZLES } from "./puzzles/math";
import { SCIENCE_PUZZLES } from "./puzzles/science";

export const PUZZLE_QUEST_BANK: PuzzleItem[] = [
  ...MATH_PUZZLES,
  ...SCIENCE_PUZZLES,
  ...ENGLISH_PUZZLES,
  ...COMPUTER_SCIENCE_PUZZLES,
  ...BIOLOGY_PUZZLES,
  ...GEOGRAPHY_PUZZLES,
  ...HISTORY_PUZZLES,
  ...GENERAL_KNOWLEDGE_PUZZLES,
  ...LOGICAL_REASONING_PUZZLES,
];
