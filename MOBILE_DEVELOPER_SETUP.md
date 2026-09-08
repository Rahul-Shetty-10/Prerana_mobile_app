# Prerana Student Mobile App Handoff

## What Was Done

Student-only read API is exposed for mobile. The Expo starter app uses Clerk login and calls the deployed backend with a Clerk `convex` JWT.

## Step 1: Clone The App

```bash
git clone https://github.com/Rahul-Shetty-10/Prerana_mobile_app.git
cd Prerana_mobile_app
```

## Step 2: Ask For The `.env` Values

Ask the project owner for these values:

```env
EXPO_PUBLIC_API_BASE_URL=https://app.smartguru.in/api/mobile/v1
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<provided-by-owner>
EXPO_PUBLIC_TENANT_SLUG=<staging-or-production-tenant-from-owner>
```

Create `.env`:

```bash
copy .env.example .env
```

For macOS/Linux:

```bash
cp .env.example .env
```

Paste the values into `.env`.

.env or .env.local
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Basic Checks

```bash
npm run typecheck
npx expo-doctor
```

Both commands should pass before starting feature work.

## Step 5: Start The App

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

Note: production Clerk `pk_live_...` keys may not work on localhost web because Clerk restricts live keys to the production domain. Use native mobile testing or ask the owner for a development Clerk key if local web testing is required.

## Step 6: Login And Confirm Token Flow

Login using the student credentials provided by the project owner.

Inside a React component or custom hook, get Clerk's `getToken` function:

```ts
import { useAuth } from "@clerk/expo";

const { getToken } = useAuth();
```

Then pass `getToken` into the API helper. Inside the helper/request function, create the token:

```ts
const token = await getToken({ template: "convex" });
```

Every API call must send:

```http
Authorization: Bearer <token>
X-Tenant-Slug: <configured-tenant>
Content-Type: application/json
```

Do not hardcode this token. It expires.

## Step 7: Test The API With An Authenticated Client

Base URL:

```txt
https://app.smartguru.in/api/mobile/v1
```

First test:

```txt
GET https://app.smartguru.in/api/mobile/v1/session
```

Expected:

```json
{
  "ok": true,
  "data": {
    "role": "student",
    "tenantSlug": "<configured-tenant>"
  }
}
```

Second test:

```txt
GET https://app.smartguru.in/api/mobile/v1/student/dashboard
```

If these pass, start building the app screens.

## Step 8: Use This API Helper Pattern

```ts
type GetToken = (options?: { template?: string }) => Promise<string | null>;

async function mobileApi(path: string, getToken: GetToken) {
  const token = await getToken({ template: "convex" });
  if (!token) {
    throw new Error("Unable to get Clerk token");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Slug": TENANT_SLUG,
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();

  if (!response.ok || !body.ok) {
    throw new Error(body.error?.message || "Request failed");
  }

  return body.data;
}
```

Example usage from a screen:

```ts
const { getToken } = useAuth();
const dashboard = await mobileApi("/student/dashboard", getToken);
```

## Available API Endpoints

All endpoints are read-only.

Base URL:

```txt
https://app.smartguru.in/api/mobile/v1
```

### 1. Session

```txt
GET /session
```

Use for app boot and role check.

### 2. Student Dashboard

```txt
GET /student/dashboard
```

Use for the student home/dashboard screen.

### 3. Learning Snapshot

```txt
GET /student/learning-snapshot
```

Use for subject and chapter listing.

### 4. Chapter Resources

```txt
GET /student/chapter-resources?subjectId=<subjectId>&chapterId=<chapterId>
```

Required:

```txt
subjectId
chapterId
```

Use for resources inside one chapter.

### 5. Saved Library

```txt
GET /student/library
```

Optional:

```txt
sourceKind=study_lab
sourceKind=approved_resource
```

Use for saved resources.

### 6. Content Requests

```txt
GET /student/content-requests
```

Optional:

```txt
subjectId
chapterId
```

Use for the student's missing-content request history.

### 7. Profile

```txt
GET /student/profile
```

Use for student profile/settings data.

### 8. Quiz Attempts

```txt
GET /student/quiz-attempts?attemptId=<attemptId>
```

Optional:

```txt
questionId
```

Use for quiz attempt review.

## Suggested Screen Mapping

```txt
Login                       Clerk login
Startup/session check        GET /session
Dashboard                    GET /student/dashboard
Subjects                     GET /student/learning-snapshot
Chapter details              GET /student/chapter-resources
Saved resources              GET /student/library
Content request history      GET /student/content-requests
Profile                      GET /student/profile
Quiz review                  GET /student/quiz-attempts
```

## Important Rules

Only build student screens.

Only use:

```txt
GET
OPTIONS
```

Do not build create, edit, delete, admin, teacher, parent, approval, or publishing flows from this API.

## Common Errors

`401 UNAUTHENTICATED`

Token is missing, expired, copied with quotes, or not created using the `convex` template.

`403 ROUTE_FORBIDDEN`

Logged-in user is not a student in the configured tenant.

`400 VALIDATION_ERROR`

Required query params are missing.

`500 SERVER_ERROR`

Backend deployment/config issue. Share the endpoint, tenant slug, time, and response body with the project owner.
