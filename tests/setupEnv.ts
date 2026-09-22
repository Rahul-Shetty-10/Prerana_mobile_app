/**
 * Loaded via `node --import` before any test module, so `appConfig` - which
 * reads `process.env` at import time, the way Metro inlines EXPO_PUBLIC_* vars
 * at build time - sees a configured API origin.
 *
 * Production code must never assume a default API origin: without one,
 * `isTrustedApiResourceUrl` fails closed and no request carries a Clerk token.
 * Tests therefore supply the origin explicitly instead.
 */
process.env.EXPO_PUBLIC_API_BASE_URL ||= "https://app.smartguru.in/api/mobile/v1";
process.env.EXPO_PUBLIC_STORAGE_BASE_URL ||= "https://murshidaudio.s3.ap-south-1.amazonaws.com";
