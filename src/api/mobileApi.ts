import { appConfig } from "../config";
import { getMobileSession, invalidateMobileSession } from "../shared/session/sessionStore";
import { resolveTenantHeader, shouldInvalidateSession } from "./mobileApiPolicy";

type GetToken = (options?: { template?: string }) => Promise<string | null>;

type MobileApiOptions = {
  getToken: GetToken;
};

type MobileApiResponse<TData> =
  | { ok: true; data: TData }
  | {
      ok: false;
      error?: { code?: string; message?: string; details?: unknown };
    };

export async function mobileApi<TData>(path: string, options: MobileApiOptions): Promise<TData> {
  const token = await Promise.race([
    options.getToken({ template: "convex" }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Clerk token retrieval timed out.")), 10000),
    ),
  ]);

  if (!token) {
    throw new Error("Unable to get Clerk token. Please sign in again.");
  }

  const tenantSlug = resolveTenantHeader(path, getMobileSession()?.tenantSlug);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (tenantSlug) headers["X-Tenant-Slug"] = tenantSlug;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    let payload: MobileApiResponse<TData> | null = null;
    try {
      payload = (await response.json()) as MobileApiResponse<TData>;
    } catch {
      if (shouldInvalidateSession(response.status)) await invalidateMobileSession();
      throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
    }

    if (!response.ok || !payload || payload.ok !== true) {
      if (shouldInvalidateSession(response.status)) await invalidateMobileSession();
      const errorMessage = payload && "error" in payload ? payload.error?.message : undefined;
      throw new Error(errorMessage || `Request failed (HTTP ${response.status}).`);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The request timed out. Please check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
