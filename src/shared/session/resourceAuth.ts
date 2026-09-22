import { appConfig } from "../../config.ts";
import { shouldInvalidateSession } from "../../api/mobileApiPolicy.ts";
import { getTenantAuthHeaders } from "./tenantHeaders.ts";

/**
 * Clerk credentials are sent only to the configured API origin. External or
 * signed asset URLs must authorize themselves and must never receive a Clerk
 * token in a request header.
 */
export function isTrustedApiResourceUrl(resourceUrl: string): boolean {
  // Fail closed: without a configured API origin there is no origin we can
  // vouch for, so no request may carry Clerk credentials.
  const apiBase = appConfig.apiBaseUrl?.trim();
  if (!apiBase) return false;
  try {
    const apiUrl = new URL(apiBase);
    const targetUrl = new URL(resourceUrl, apiBase);
    return targetUrl.origin === apiUrl.origin;
  } catch {
    return false;
  }
}

export function getResourceRequestHeaders(
  resourceUrl: string,
  authToken?: string,
): Record<string, string> | undefined {
  if (!authToken || !isTrustedApiResourceUrl(resourceUrl)) return undefined;
  return getTenantAuthHeaders(authToken);
}

export function shouldInvalidateResourceResponse(resourceUrl: string, status: number): boolean {
  return isTrustedApiResourceUrl(resourceUrl) && shouldInvalidateSession(status);
}
