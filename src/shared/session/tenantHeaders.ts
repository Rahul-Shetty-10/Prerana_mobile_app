import { getRequiredTenantSlug } from "./sessionStore.ts";

export function getTenantAuthHeaders(authToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${authToken}`,
    "X-Tenant-Slug": getRequiredTenantSlug(),
  };
}
