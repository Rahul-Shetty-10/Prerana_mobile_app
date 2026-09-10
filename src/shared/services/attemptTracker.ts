import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMobileSession } from "../session/sessionStore";
import { getUserStorageKey } from "./userStorage";

export const ATTEMPT_STORAGE_KEY_PREFIX = "@prerana_attempts_";

export interface AttemptStats {
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

function getStorageKey(userId: string): string | null {
  return getMobileSession()?.userId === userId
    ? getUserStorageKey(ATTEMPT_STORAGE_KEY_PREFIX)
    : null;
}

export async function getAttemptStats(userId: string): Promise<AttemptStats> {
  if (!userId) return { questionsAttempted: 0, correctAnswers: 0, incorrectAnswers: 0 };
  try {
    const storageKey = getStorageKey(userId);
    if (!storageKey) return { questionsAttempted: 0, correctAnswers: 0, incorrectAnswers: 0 };
    const json = await AsyncStorage.getItem(storageKey);
    if (json) {
      return JSON.parse(json);
    }
  } catch (e) {
    console.warn("Failed to get attempt stats", e);
  }
  return { questionsAttempted: 0, correctAnswers: 0, incorrectAnswers: 0 };
}

export async function recordQuestionAttempt(userId: string, isCorrect: boolean): Promise<void> {
  if (!userId) return;
  try {
    const stats = await getAttemptStats(userId);
    stats.questionsAttempted += 1;
    if (isCorrect) {
      stats.correctAnswers += 1;
    } else {
      stats.incorrectAnswers += 1;
    }
    const storageKey = getStorageKey(userId);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save attempt stats", e);
  }
}

export async function recordBatchAttempts(userId: string, correctCount: number, incorrectCount: number): Promise<void> {
  if (!userId) return;
  try {
    const stats = await getAttemptStats(userId);
    stats.questionsAttempted += (correctCount + incorrectCount);
    stats.correctAnswers += correctCount;
    stats.incorrectAnswers += incorrectCount;
    const storageKey = getStorageKey(userId);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save batch attempt stats", e);
  }
}

export function calculateAccuracy(stats: AttemptStats): number {
  if (stats.questionsAttempted === 0) return 0;
  return Math.round((stats.correctAnswers / stats.questionsAttempted) * 100);
}

export async function clearAllAttemptsForUser(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const storageKey = getStorageKey(userId);
    if (storageKey) await AsyncStorage.removeItem(storageKey);
  } catch (e) {}
}
