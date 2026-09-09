export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "",
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? "",
  accountDeletionUrl: process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL ?? "",
  privacyEmail: process.env.EXPO_PUBLIC_PRIVACY_EMAIL ?? "",
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "",
  /** Optional public asset origin for relative backend resource paths. */
  storageBaseUrl: process.env.EXPO_PUBLIC_STORAGE_BASE_URL ?? "",
} as const;
