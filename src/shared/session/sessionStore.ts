import AsyncStorage from "@react-native-async-storage/async-storage";

export type MobileSession = {
  role: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
};

const SESSION_STORAGE_KEY = "@prerana_session";

let activeSession: MobileSession | null = null;
const listeners = new Set<(session: MobileSession | null) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(activeSession));
}

export function getMobileSession(): MobileSession | null {
  return activeSession;
}

export function setMobileSession(session: MobileSession | null): void {
  activeSession = session;
  notifyListeners();
}

export async function saveMobileSession(session: MobileSession): Promise<void> {
  setMobileSession(session);
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loadMobileSession(): Promise<MobileSession | null> {
  try {
    const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MobileSession;
      if (parsed && typeof parsed === "object" && parsed.tenantSlug && parsed.role) {
        activeSession = parsed;
        notifyListeners();
        return parsed;
      }
    }
  } catch (error) {
    console.error("[SESSION_STORE] Error loading mobile session from storage:", error);
  }
  activeSession = null;
  notifyListeners();
  return null;
}

export async function clearMobileSession(): Promise<void> {
  activeSession = null;
  notifyListeners();
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("[SESSION_STORE] Error clearing mobile session from storage:", error);
  }
}

export function subscribeMobileSession(listener: (session: MobileSession | null) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
