import { ArcadeUserProfile } from "../types";
import { EMPTY_ARCADE_PROFILE } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMobileSession } from "../../../shared/session/sessionStore";
import { getUserStorageKey } from "../../../shared/services/userStorage";

const ARCADE_PROFILE_STORAGE_KEY = "@arcade_profile_data";

let currentProfile: ArcadeUserProfile = { ...EMPTY_ARCADE_PROFILE };
let activeScopeKey: string | null = null;

let isLoaded = false;

function getStorageKey(userId?: string | null): string | null {
  const session = getMobileSession();
  return userId && session?.userId === userId ? getUserStorageKey(ARCADE_PROFILE_STORAGE_KEY) : null;
}

function resetForUser(userId?: string | null): void {
  const session = getMobileSession();
  const nextScopeKey = userId && session?.userId === userId
    ? `${userId}:${session.tenantId}`
    : null;
  if (activeScopeKey !== nextScopeKey) {
    activeScopeKey = nextScopeKey;
    currentProfile = { ...EMPTY_ARCADE_PROFILE, id: userId ?? "" };
    isLoaded = false;
  }
}

export async function loadArcadeProfileFromStorage(userId?: string | null): Promise<ArcadeUserProfile> {
  resetForUser(userId);
  const storageKey = getStorageKey(userId);
  if (!storageKey) {
    return { ...currentProfile };
  }
  if (isLoaded) {
    return { ...currentProfile };
  }
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ArcadeUserProfile>;
      currentProfile = {
        ...EMPTY_ARCADE_PROFILE,
        ...parsed,
        id: userId ?? "",
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      };
    }
    isLoaded = true;
  } catch (e) {
    isLoaded = true;
  }
  return { ...currentProfile };
}

export async function saveArcadeProfileToStorage(profile: ArcadeUserProfile, userId?: string | null): Promise<void> {
  const storageKey = getStorageKey(userId);
  if (!storageKey) return;
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(profile));
  } catch (e) {
    // Local progress is best-effort; the server remains the source of truth when available.
  }
}

export function getArcadeProfile(userId?: string | null): ArcadeUserProfile {
  resetForUser(userId);
  return { ...currentProfile };
}

export function updateArcadeProfileOnGameEnd(params: {
  xpEarned: number;
  coinsEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}, userId?: string | null): ArcadeUserProfile {
  resetForUser(userId);
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

  void saveArcadeProfileToStorage(currentProfile, userId);
  return { ...currentProfile };
}

export async function clearArcadeProfileForUser(userId?: string | null): Promise<void> {
  const storageKey = getStorageKey(userId);
  if (storageKey) {
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (e) {
      // Local progress cleanup is best-effort during logout.
    }
  }
  resetForUser(null);
}
