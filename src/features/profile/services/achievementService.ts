import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
import { MOCK_ACHIEVEMENTS } from "../constants";
import { AchievementItem } from "../types";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface AchievementsApiResponse {
  achievements?: AchievementItem[];
}

export async function fetchAchievements(getToken?: GetToken): Promise<AchievementItem[]> {
  if (getToken) {
    try {
      const response = await mobileApi<AchievementsApiResponse>("/student/achievements", {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      });
      if (response.achievements && response.achievements.length > 0) {
        return response.achievements;
      }
    } catch (e) {
      // Local fallback on API error
    }
  }
  return MOCK_ACHIEVEMENTS;
}
