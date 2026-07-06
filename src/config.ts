export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://app.smartguru.in/api/mobile/v1",
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  tenantSlug: process.env.EXPO_PUBLIC_TENANT_SLUG ?? "seed-tenant-alpha",
} as const;
