import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearActiveStorageIdentity,
  clearScopedStorageForIdentity,
  setActiveStorageIdentity,
} from "../services/userStorage";
import {
  isValidStoredSession,
  type MobileSession,
} from "./sessionValidation";

export type { MobileSession } from "./sessionValidation";

const SESSION_STORAGE_KEY_PREFIX = "@prerana_session:";
const LEGACY_SESSION_STORAGE_KEY = "@prerana_session";

let activeSession: MobileSession | null = null;
const listeners = new Set<(session: MobileSession | null) => void>();

function getSessionStorageKey(userId: string): string {
  return `${SESSION_STORAGE_KEY_PREFIX}${encodeURIComponent(userId)}`;
}

function notifyListeners() {
  listeners.forEach((listener) => listener(activeSession));
}

export function getMobileSession(): MobileSession | null {
  return activeSession;
}

export function getRequiredTenantSlug(): string {
  const tenantSlug = activeSession?.tenantSlug;
  if (!tenantSlug) {
    throw new Error("An active backend-validated tenant session is required.");
  }
  return tenantSlug;
}

export function setMobileSession(session: MobileSession | null): void {
  activeSession = session;
  if (session) {
    setActiveStorageIdentity(session.userId, session.tenantId);
  } else {
    clearActiveStorageIdentity();
  }
  notifyListeners();
}

export async function saveMobileSession(session: MobileSession): Promise<void> {
  setMobileSession(session);
  await AsyncStorage.setItem(getSessionStorageKey(session.userId), JSON.stringify(session));
  await AsyncStorage.removeItem(LEGACY_SESSION_STORAGE_KEY).catch(() => undefined);
}

/** Reads a cached candidate. It never activates the tenant before revalidation. */
export async function loadMobileSession(userId: string): Promise<MobileSession | null> {
  if (!userId) return null;
  try {
    const stored = await AsyncStorage.getItem(getSessionStorageKey(userId));
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isValidStoredSession(parsed, userId) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearMobileSession(userId?: string | null): Promise<void> {
  const sessionToClear = activeSession && (!userId || activeSession.userId === userId) ? activeSession : null;
  if (sessionToClear) {
    await clearScopedStorageForIdentity(sessionToClear.userId, sessionToClear.tenantId);
    setMobileSession(null);
  } else if (!userId) {
    setMobileSession(null);
  }

  try {
    if (userId) {
      await AsyncStorage.removeItem(getSessionStorageKey(userId));
    } else {
      await AsyncStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage cleanup failures during sign-out/invalidation.
  }
}

export async function invalidateMobileSession(): Promise<void> {
  const session = activeSession;
  if (session) {
    await clearScopedStorageForIdentity(session.userId, session.tenantId);
  }
  setMobileSession(null);
  try {
    if (session) await AsyncStorage.removeItem(getSessionStorageKey(session.userId));
    await AsyncStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures during invalidation.
  }
}

export function subscribeMobileSession(listener: (session: MobileSession | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
