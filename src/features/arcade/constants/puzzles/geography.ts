import { PuzzleItem } from "../../types";

export const GEOGRAPHY_PUZZLES: PuzzleItem[] = [
  {
    id: "pq-geo-1",
    category: "Geography",
    questionType: "mcq",
    difficulty: "Medium",
    question: "If it is 12:00 PM at Prime Meridian (0°), what time is it at 15° East?",
    options: ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"],
    correctIndex: 2,
    explanation: "Earth rotates 15° longitude per hour. Going East adds 1 hour (12:00 PM + 1h = 1:00 PM).",
    hint: "15 degrees longitude corresponds to 1 hour time difference. East is ahead.",
  },
];
