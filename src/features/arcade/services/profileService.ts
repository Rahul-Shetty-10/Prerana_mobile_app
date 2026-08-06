import { ArcadeUserProfile } from "../types";
import { MOCK_ARCADE_PROFILE } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ARCADE_PROFILE_STORAGE_KEY = "@arcade_profile_data";

// In-memory profile state for the local session
let currentProfile: ArcadeUserProfile = { ...MOCK_ARCADE_PROFILE };

let isLoaded = false;

export async function loadArcadeProfileFromStorage(): Promise<ArcadeUserProfile> {
  if (isLoaded) {
    return { ...currentProfile };
  }
  try {
    const raw = await AsyncStorage.getItem(ARCADE_PROFILE_STORAGE_KEY);
    if (raw) {
      currentProfile = JSON.parse(raw);
    }
    isLoaded = true;
  } catch (e) {
    // Ignore error
  }
  return { ...currentProfile };
}

export async function saveArcadeProfileToStorage(profile: ArcadeUserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(ARCADE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    // Ignore error
  }
}

export function getArcadeProfile(): ArcadeUserProfile {
  return { ...currentProfile };
}

export function updateArcadeProfileOnGameEnd(params: {
  xpEarned: number;
  coinsEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}): ArcadeUserProfile {
  const newXp = currentProfile.xp + params.xpEarned;
  const newLevel = Math.floor(newXp / 500) + 1;
  const newCoins = currentProfile.coins + params.coinsEarned;
  const newGamesPlayed = currentProfile.gamesPlayed + 1;
  const newTotalCorrect = currentProfile.totalCorrect + params.correctAnswers;
  const newTotalAnswered = currentProfile.totalAnswered + params.totalQuestions;

  const sessionAccuracy = Math.round((params.correctAnswers / Math.max(1, params.totalQuestions)) * 100);
  const newHighestAccuracy = Math.max(currentProfile.highestAccuracy, sessionAccuracy);

  currentProfile = {
    ...currentProfile,
    xp: newXp,
    level: newLevel,
    coins: newCoins,
    gamesPlayed: newGamesPlayed,
    totalCorrect: newTotalCorrect,
    totalAnswered: newTotalAnswered,
    highestAccuracy: newHighestAccuracy,
  };

  void saveArcadeProfileToStorage(currentProfile);
  return { ...currentProfile };
}
