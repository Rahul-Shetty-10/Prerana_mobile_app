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

OTA is appropriate for JavaScript, styling, and bundled asset changes. Changes to Expo/RN versions, native dependencies, permissions, app configuration, icons, or native code require a new native build on both platforms. Never put secrets in an OTA update; `EXPO_PUBLIC_*` values are public by design.

### An update only reaches builds with a matching runtime version

`runtimeVersion.policy` is `fingerprint`, so EAS hashes the native side of the project — dependencies, `app.json`, plugins — and delivers an update only to installed builds carrying that same hash. Change anything native and the hash changes, and the update reaches nobody. It does not fail; it simply never arrives.

Check before publishing. The fingerprint of an installed build is its `Runtime Version`:

```bash
npx eas-cli build:list --platform android --limit 5   # Runtime Version per build
npx eas-cli channel:list                              # what each channel is serving
```

Two builds from the same commit can still differ here: the fingerprint covers the working tree, so uncommitted dependency changes produce a different hash. Build from a clean checkout.

If the installed build's runtime version differs from the current tree's, the only way to reach those users is a new store release.

## Backend coverage

The mobile API implements these routes and no others:

```txt
/session                        /student/library
/student/dashboard              /student/profile
/student/learning-snapshot      /student/chapter-resources
/student/fundamentals/catalog   /student/quiz-attempts   (GET only)
/student/fundamentals/track     /student/content-requests
```

Features that need anything else are gated off in [src/featureFlags.ts](src/featureFlags.ts), which records the route each one waits on. The screens are still in the codebase, so enabling a flag is the only change needed once its route ships. Currently gated:

| Flag | Waiting on |
| --- | --- |
| `assessmentsHub` | `/student/quizzes-home`, `/student/assessment-history`, `/student/quiz-landing` |
| `achievements` | `/student/achievements` |
| `chapterQuizForAllChapters` | any route resolving a chapter's quiz for the signed-in student |

Creating and submitting a quiz attempt goes to `POST /api/student/quiz-attempts`, a web route authenticated with the raw Clerk session token rather than the `convex` template token. That is deliberate: the mobile `/student/quiz-attempts` route is read-only. No route returns a chapter's `quizId`, so a chapter offers a quiz only when [quizIdResolver.ts](src/features/exercise/services/quizIdResolver.ts) has an entry for it, and a chapter without one completes on its resources alone.

## Quality gate

Run these before opening a pull request. CI runs the same sequence on every PR into `main` or `dev`, and EAS runs `release:validate` again before every production build.

```bash
npm ci
npm run typecheck
npm test
npx expo-doctor
npm run ota:validate
EAS_BUILD_PROFILE=production npm run release:validate
npx expo export --platform android --output-dir .expo/export-android
npx expo export --platform ios --output-dir .expo/export-ios
```

Work merges into `dev` first; `dev` is what gets proposed to `main` for a release. Build and release steps for both stores are in [RELEASE_DOCUMENTATION.md](RELEASE_DOCUMENTATION.md).

## API testing

Use an authenticated test client or the running app to verify API routes. Never print or manually copy live session tokens into logs, documentation, or source control.
