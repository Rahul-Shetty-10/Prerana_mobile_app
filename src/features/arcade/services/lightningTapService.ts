import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { LIGHTNING_QUESTION_BANK } from "../constants";
import { LightningDifficulty, LightningQuestion } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface LightningQuestionsResponse {
  questions?: LightningQuestion[];
}

/**
 * Creates a shuffled session queue consumed sequentially during a 60s speed round.
 * Filters by difficulty if specified, shuffles ONCE, and returns the full queue.
 */
export async function fetchLightningQuestions(
  difficulty?: LightningDifficulty,
  getToken?: GetToken
): Promise<LightningQuestion[]> {
  if (getToken) {
    try {
      const path = difficulty
        ? `/arcade/lightning/questions?difficulty=${difficulty}`
        : "/arcade/lightning/questions";

      const response = await mobileApi<LightningQuestionsResponse>(path, {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      });

      if (response.questions && response.questions.length > 0) {
        return response.questions;
      }
    } catch (error) {
      // Fallback to local queue on API failure
    }
  }

  // Local fallback: filter & shuffle once
  let pool = [...LIGHTNING_QUESTION_BANK];
  if (difficulty) {
    const filtered = pool.filter((q) => q.difficulty === difficulty);
    if (filtered.length >= 10) {
      pool = filtered;
    }
  }

  // Fisher-Yates shuffle once
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}
