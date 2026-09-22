# Prerana Mobile App

Expo starter for the Prerana 2.0 student mobile client. The app signs in with Clerk and mints the `convex` JWT template token.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill:

```txt
EXPO_PUBLIC_API_BASE_URL=https://app.smartguru.in/api/mobile/v1
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
```

Tenant selection is backend-driven. The app sends the authenticated Clerk token to `GET /session` without a tenant header. The backend resolves the user's student membership and returns the validated tenant. Do not configure `EXPO_PUBLIC_TENANT_SLUG` or hardcode a tenant in the app.

Use a deployed staging API for normal development. A local laptop URL only works while the laptop and Next.js server are running.

Do not use a production `pk_live_...` Clerk key on Expo web localhost. Clerk production keys are domain-restricted. For Expo web local testing, use a development `pk_test_...` key and a backend configured with that same Clerk project. Use the live key from the production domain or native mobile build.

## Run

```bash
npm install
npm run start
```

## Auth Contract

The app must call:

```ts
const token = await getToken({ template: "convex" });
```

Then send the token to `GET /session` without a tenant header. After the backend returns and validates the user's single active student membership, send:

```http
Authorization: Bearer <short-lived-Clerk-token>
X-Tenant-Slug: <backend-validated-tenant>
```

This app enforces one active student membership per Clerk user. If the backend returns zero, invalid, or multiple memberships, the app refuses to enter the learning workspace. A tenant header is only an additional routing hint; the backend must verify membership from the Clerk identity on every request.

Mobile developers should not receive `CLERK_SECRET_KEY`, Convex dashboard access, deploy keys, database credentials, or manually minted JWTs.

This mobile app is student-only. Teacher, parent, school-admin, and super-admin workflows stay in the web app.

The server-side response and authorization requirements are documented in [BACKEND_MULTI_TENANT_CONTRACT.md](BACKEND_MULTI_TENANT_CONTRACT.md).

## Over-the-air updates

The app is configured for EAS Update. The `production` build uses the `production` channel and the `preview` build uses the `preview` channel. OTA updates are downloaded by an installed OTA-enabled build and are applied when the app next restarts; the embedded bundle remains the fallback if an update is unavailable.

Publish a preview update only after the local checks pass:

```bash
npm run ota:validate
npm run ota:preview -- --message "Describe the change"
```

Publish to production only after testing the preview build:

```bash
npm run ota:production -- --message "Describe the change"
```

The current AAB that was built before `expo-updates` was added cannot receive OTA updates. A new OTA-enabled Android build must be installed or released first. OTA is appropriate for JavaScript, styling, and bundled asset changes. Changes to Expo/RN versions, native dependencies, permissions, app configuration, or native code require a new Android build. Never put secrets in an OTA update; `EXPO_PUBLIC_*` values are public by design.

## API testing

Use an authenticated test client or the running app to verify API routes. Never print or manually copy live session tokens into logs, documentation, or source control.
