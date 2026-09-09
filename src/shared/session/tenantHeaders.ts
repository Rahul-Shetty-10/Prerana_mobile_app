import { getRequiredTenantSlug } from "./sessionStore";

export function getTenantAuthHeaders(authToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${authToken}`,
    "X-Tenant-Slug": getRequiredTenantSlug(),
  };
}
