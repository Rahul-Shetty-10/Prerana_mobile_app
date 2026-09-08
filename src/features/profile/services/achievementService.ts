import { appConfig } from "../../../config";
import { mobileApi } from "../../../api/mobileApi";
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
      return response.achievements ?? [];
    } catch (e) {
      throw e;
    }
  }
  throw new Error("Authentication is required to load achievements.");
}
