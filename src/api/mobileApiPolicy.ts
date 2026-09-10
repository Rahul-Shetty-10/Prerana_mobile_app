export function isSessionRequest(path: string): boolean {
  return path.split("?")[0] === "/session";
}

export function resolveTenantHeader(path: string, activeTenantSlug: string | null | undefined): string | null {
  if (isSessionRequest(path)) return null;
  if (!activeTenantSlug) {
    throw new Error("An active backend-validated tenant session is required.");
  }
  return activeTenantSlug;
}

export function shouldInvalidateSession(status: number): boolean {
  return status === 401 || status === 403;
}
