import { mobileApi } from "../../../api/mobileApi";
import { PUZZLE_QUEST_BANK } from "../constants";
import { PuzzleDifficulty, PuzzleItem } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface PuzzleQuestApiResponse {
  puzzles?: PuzzleItem[];
}

export async function fetchPuzzleQuestPuzzles(
  difficulty?: PuzzleDifficulty,
  getToken?: GetToken
): Promise<PuzzleItem[]> {
  if (getToken) {
    try {
      const path = difficulty
        ? `/arcade/puzzle/questions?difficulty=${difficulty}`
        : "/arcade/puzzle/questions";

      const response = await mobileApi<PuzzleQuestApiResponse>(path, {
        getToken,
      });

      if (response.puzzles && response.puzzles.length > 0) {
        return response.puzzles;
      }
    } catch (error) {
      // Local fallback on API failure
    }
  }

  // Local fallback: filter & shuffle once
  let pool = [...PUZZLE_QUEST_BANK];
  if (difficulty) {
    const filtered = pool.filter((p) => p.difficulty === difficulty);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 10);
}
