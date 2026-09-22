import { mobileApi } from "../../../api/mobileApi.ts";
import type { AchievementItem } from "../types/profile.ts";
import { featureFlags } from "../../../featureFlags.ts";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface AchievementsApiResponse {
  achievements?: AchievementItem[];
}

export async function fetchAchievements(getToken?: GetToken): Promise<AchievementItem[]> {
  // /student/achievements is not implemented by the backend. Skip the request
  // rather than spend a round trip on a guaranteed 404; the Profile screen
  // already renders its empty state for an empty list.
  if (!featureFlags.achievements) return [];

  if (getToken) {
    try {
      const response = await mobileApi<AchievementsApiResponse>("/student/achievements", {
        getToken,
      });
      return response.achievements ?? [];
    } catch (e) {
      throw e;
    }
  }
  throw new Error("Authentication is required to load achievements.");
}
