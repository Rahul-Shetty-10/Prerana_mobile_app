let activeUserId: string | null = null;

export function setActiveUserId(userId?: string | null): void {
  activeUserId = userId ?? null;
}

export function getUserStorageKey(baseKey: string): string | null {
  return activeUserId ? `${baseKey}:${encodeURIComponent(activeUserId)}` : null;
}
