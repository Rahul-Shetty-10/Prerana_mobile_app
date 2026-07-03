# Prerana Mobile App

Expo starter for the Prerana 2.0 student mobile client. The app signs in with Clerk and mints the `convex` JWT template token.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill:

```txt
EXPO_PUBLIC_API_BASE_URL=https://<staging-url>/api/mobile/v1
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
EXPO_PUBLIC_TENANT_SLUG=seed-tenant-alpha
```

Use a deployed staging API for normal development. A local laptop URL only works while the laptop and Next.js server are running.

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

Then send:

```http
Authorization: Bearer <token>
X-Tenant-Slug: seed-tenant-alpha
```

Mobile developers should not receive `CLERK_SECRET_KEY`, Convex dashboard access, deploy keys, database credentials, or manually minted JWTs.

This mobile app is student-only. Teacher, parent, school-admin, and super-admin workflows stay in the web app.

## Local Token Test

After login, the signed-in screen is intentionally blank. For local Postman testing, open the browser or Expo console and copy the log:

```txt
[Prerana mobile dev] Use this Bearer token for Postman testing: <token>
[Prerana mobile dev] X-Tenant-Slug: seed-tenant-alpha
```

Use it in Postman:

```http
Authorization: Bearer <token>
X-Tenant-Slug: seed-tenant-alpha
Content-Type: application/json
```

Then test:

```txt
GET /session
GET /student/dashboard
GET /student/learning-snapshot
```

Do not keep console token logging enabled in a production app.
