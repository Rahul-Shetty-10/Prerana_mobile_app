import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorageKeyForIdentity, type StorageIdentity } from "./storageScope";

export type { StorageIdentity } from "./storageScope";

let activeIdentity: StorageIdentity | null = null;

export function setActiveStorageIdentity(userId?: string | null, tenantId?: string | null): void {
  activeIdentity = userId && tenantId ? { userId, tenantId } : null;
}

export function clearActiveStorageIdentity(): void {
  activeIdentity = null;
}

export function getActiveStorageIdentity(): StorageIdentity | null {
  return activeIdentity;
}

export function getUserStorageKey(baseKey: string): string | null {
  return activeIdentity
    ? getStorageKeyForIdentity(baseKey, activeIdentity.userId, activeIdentity.tenantId)
    : null;
}

export async function clearScopedStorageForIdentity(userId: string, tenantId: string): Promise<void> {
  if (!userId || !tenantId) return;
  try {
    const suffix = `:${encodeURIComponent(userId)}:${encodeURIComponent(tenantId)}`;
    const keys = await AsyncStorage.getAllKeys();
    const scopedKeys = keys.filter((key) => key.endsWith(suffix));
    if (scopedKeys.length > 0) {
      await AsyncStorage.multiRemove(scopedKeys);
    }
  } catch {
    // Local cleanup is best-effort; the backend remains the source of truth.
  }
}

export async function clearScopedStorageForUser(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const userMarker = `:${encodeURIComponent(userId)}:`;
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter((key) => key.includes(userMarker));
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
    }
  } catch {
    // Local cleanup is best-effort; the backend remains the source of truth.
  }
}
