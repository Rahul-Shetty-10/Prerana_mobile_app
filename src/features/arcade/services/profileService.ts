import { ArcadeUserProfile } from "../types";
import { MOCK_ARCADE_PROFILE } from "../constants";

// In-memory profile state for the local session
let currentProfile: ArcadeUserProfile = { ...MOCK_ARCADE_PROFILE };

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

  return { ...currentProfile };
}
