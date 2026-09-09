import { mobileApi } from "../../../api/mobileApi";
import { ArcadeHomePayload } from "../types";
import { MOCK_ARCADE_GAMES } from "../constants";
import { getArcadeProfile } from "./profileService";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

export interface ArcadeHomeApiResponse {
  profile?: ArcadeHomePayload["profile"];
  games?: ArcadeHomePayload["games"];
}

export async function fetchArcadeHomeData(getToken?: GetToken): Promise<ArcadeHomePayload> {
  const localProfile = getArcadeProfile();

  if (!getToken) {
    return {
      profile: localProfile,
      games: MOCK_ARCADE_GAMES,
    };
  }

  try {
    const rawData = await mobileApi<ArcadeHomeApiResponse>("/student/arcade-home", {
      getToken,
    });

    return {
      profile: rawData.profile ?? localProfile,
      games: rawData.games ?? MOCK_ARCADE_GAMES,
    };
  } catch (error) {
    return {
      profile: localProfile,
      games: MOCK_ARCADE_GAMES,
    };
  }
}
