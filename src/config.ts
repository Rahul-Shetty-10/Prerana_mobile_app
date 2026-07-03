export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/mobile/v1",
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  tenantSlug: process.env.EXPO_PUBLIC_TENANT_SLUG ?? "ves-model-convent",
} as const;
