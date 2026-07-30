import { LightningQuestion } from "../types";
import { BIOLOGY_QUESTIONS } from "./questions/biology";
import { COMPUTER_SCIENCE_QUESTIONS } from "./questions/computerScience";
import { ENGLISH_QUESTIONS } from "./questions/english";
import { GENERAL_KNOWLEDGE_QUESTIONS } from "./questions/generalKnowledge";
import { GEOGRAPHY_QUESTIONS } from "./questions/geography";
import { HISTORY_QUESTIONS } from "./questions/history";
import { MATH_QUESTIONS } from "./questions/math";
import { SCIENCE_QUESTIONS } from "./questions/science";
import { SOCIAL_STUDIES_QUESTIONS } from "./questions/socialStudies";

export const LIGHTNING_QUESTION_BANK: LightningQuestion[] = [
  ...MATH_QUESTIONS,
  ...SCIENCE_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...COMPUTER_SCIENCE_QUESTIONS,
  ...BIOLOGY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GENERAL_KNOWLEDGE_QUESTIONS,
  ...SOCIAL_STUDIES_QUESTIONS,
];
