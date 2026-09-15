import { appConfig } from "../../config.ts";
import { shouldInvalidateSession } from "../../api/mobileApiPolicy.ts";
import { getTenantAuthHeaders } from "./tenantHeaders.ts";

/**
 * Clerk credentials are sent only to the configured API origin. External or
 * signed asset URLs must authorize themselves and must never receive a Clerk
 * token in a request header.
 */
export function isTrustedApiResourceUrl(resourceUrl: string): boolean {
  try {
    const apiBase = appConfig.apiBaseUrl.trim() || "https://app.smartguru.in/api/mobile/v1";
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
