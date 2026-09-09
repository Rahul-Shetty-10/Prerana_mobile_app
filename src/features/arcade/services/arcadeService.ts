import { mobileApi } from "../../../api/mobileApi";
import { ArcadeHomePayload } from "../types";
import { getArcadeProfile } from "./profileService";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ArcadeHomeApiResponse {
  profile?: ArcadeHomePayload["profile"];
  games?: ArcadeHomePayload["games"];
}

export async function fetchArcadeHomeData(getToken?: GetToken): Promise<ArcadeHomePayload> {
  const localProfile = getArcadeProfile();

  if (!getToken) {
    throw new Error("Authentication is required to load arcade data.");
  }

  try {
    const rawData = await mobileApi<ArcadeHomeApiResponse>("/student/arcade-home", {
      getToken,
    });

    return {
      profile: rawData.profile ?? localProfile,
      games: Array.isArray(rawData.games) ? rawData.games : [],
    };
  } catch (error) {
    throw error;
  }
}
