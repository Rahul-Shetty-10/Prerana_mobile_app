import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMobileSession } from "../session/sessionStore";
import { getUserStorageKey } from "../services/userStorage";

export const ACTIVE_LEARNING_KEY_PREFIX = "@prerana_active_learning_";

function getStorageKey(userId: string): string {
  if (getMobileSession()?.userId !== userId) return "";
  return getUserStorageKey(ACTIVE_LEARNING_KEY_PREFIX) ?? "";
}

export async function getActiveLearningSeconds(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const storageKey = getStorageKey(userId);
    if (!storageKey) return 0;
    const val = await AsyncStorage.getItem(storageKey);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
}

export async function addActiveLearningSeconds(userId: string, seconds: number): Promise<void> {
  if (!userId || seconds <= 0) return;
  try {
    const current = await getActiveLearningSeconds(userId);
    const storageKey = getStorageKey(userId);
    if (storageKey) await AsyncStorage.setItem(storageKey, (current + seconds).toString());
  } catch (e) {
    console.warn("Failed to save active learning time", e);
  }
}

export async function clearActiveLearningForUser(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const storageKey = getStorageKey(userId);
    if (storageKey) await AsyncStorage.removeItem(storageKey);
  } catch (e) {}
}

export function useActiveLearningTracker() {
  const { userId } = useAuth();
  const isFocused = useIsFocused();
  const sessionStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Only track if we have a user
    if (!userId) return;

    let appStateListener: { remove: () => void } | null = null;
    let isActiveSession = false;

    const startSession = () => {
      if (!isActiveSession) {
        sessionStartTimeRef.current = Date.now();
        isActiveSession = true;
      }
    };

    const stopSessionAndSave = () => {
      if (isActiveSession && sessionStartTimeRef.current) {
        const elapsedSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
        if (elapsedSeconds > 0) {
          addActiveLearningSeconds(userId, elapsedSeconds);
        }
        sessionStartTimeRef.current = null;
        isActiveSession = false;
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isFocused) {
        startSession();
      } else if (nextAppState.match(/inactive|background/)) {
        stopSessionAndSave();
      }
    };

    if (isFocused && AppState.currentState === "active") {
      startSession();
    } else {
      stopSessionAndSave();
    }

    appStateListener = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      appStateListener?.remove();
      stopSessionAndSave();
    };
  }, [isFocused, userId]);
}
