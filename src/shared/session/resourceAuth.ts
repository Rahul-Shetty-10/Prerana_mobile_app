import { appConfig } from "../../config";
import { shouldInvalidateSession } from "../../api/mobileApiPolicy";
import { getTenantAuthHeaders } from "./tenantHeaders";

/**
 * Clerk credentials are sent only to the configured API origin. External or
 * signed asset URLs must authorize themselves and must never receive a Clerk
 * token in a request header.
 */
export function isTrustedApiResourceUrl(resourceUrl: string): boolean {
  try {
    const apiUrl = new URL(appConfig.apiBaseUrl);
    const targetUrl = new URL(resourceUrl, appConfig.apiBaseUrl);
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
