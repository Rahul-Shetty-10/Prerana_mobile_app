# Prerana Mobile — Play Store compliance checklist

This checklist is an engineering release record, not legal advice. The app owner must confirm the actual data practices of the backend, Clerk project, hosting provider, and any school/tenant agreements before completing Play Console declarations.

## Automated verification — 8 September 2026

- Passed: TypeScript compile check (`npm run typecheck`).
- Passed: Expo Doctor, 21/21 checks, on Expo SDK 57 / React Native 0.86.3.
- Passed: Android Hermes JavaScript export with the local `.env` loaded.
- Passed: unauthenticated API reachability check; `/api/mobile/v1/session` returned the expected `401` rather than a network failure.
- Passed: generated Android manifest contains no microphone or foreground-service recording permission; legacy storage and overlay permissions are blocked.
- Blocked intentionally: release validator rejects `seed-tenant-alpha` and missing legal/support environment values.
- Not executed here: signed EAS AAB, real Clerk sign-in, authenticated backend routes, Android-device/emulator flows, deletion confirmation, and Play Console review.

## Required engineering work

- [ ] Replace the seed tenant with the real production tenant, unless the owner explicitly confirms that `seed-tenant-alpha` is the production tenant.
- [ ] Configure the production values in EAS Environment `production`:
  `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_TENANT_SLUG`,
  `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_ACCOUNT_DELETION_URL`,
  `EXPO_PUBLIC_PRIVACY_EMAIL`, and `EXPO_PUBLIC_SUPPORT_EMAIL`.
- [ ] Make the hosted privacy policy reference Prerana Mobile, its developer/legal entity, Clerk, the SmartGuru API, data retention, student/child handling, and support contact.
- [ ] Publish a dedicated account-deletion web page. It must clearly identify Prerana Mobile and let a user request deletion outside the app. The current privacy-policy URL is only a temporary link until that page is published.
- [ ] Ensure the backend implements deletion of the Clerk account, backend profile, quiz attempts/answers, progress, and any tenant copies, or clearly documents legally required retention.
- [ ] Confirm that the in-app “Delete Account & Data” action reaches the same deletion workflow and requires appropriate identity verification.
- [ ] Complete Play Console Data safety, Data deletion, Target audience, Content rating, App access, Ads, and privacy-policy declarations from verified production behavior.
- [ ] Build a signed Android App Bundle with the production EAS profile and run Play Internal Testing before production rollout.

## Data inventory to verify with the backend owner

The mobile client handles or stores:

- Account/authentication: Clerk session tokens, email, and account identity.
- Student profile: name, email, enrollment/class/board/workspace, and optional avatar URL.
- Learning activity: subjects, chapters, quiz answers, attempts, scores, completion, study time, and review data.
- Local app state: theme preference, recent learning location, chapter milestones, attempt counters, active-learning time, and arcade progress.
- Content files: approved images, audio, PDF/slide resources, flashcards, and tables downloaded from the API.

The client does not intentionally request location, contacts, camera, microphone recording, phone number, advertising ID, or background playback. Clerk and the backend are third-party/service providers whose actual collection and retention must be included in the policy and Play declarations.

## Negative/edge-case acceptance tests

- Missing or invalid production configuration stops the release and shows no demo data.
- Signed-out, expired, wrong-tenant, non-student, 401, 403, 429, 5xx, timeout, offline, malformed JSON, and empty-data responses show an actionable error or empty state.
- Account switching cannot display prior user progress, profile, attempts, or arcade state.
- Account deletion removes server data, invalidates sessions, clears local storage, and is confirmed by a fresh sign-in attempt.
- Quiz creation is idempotent or safely recoverable after timeout/retry; submit cannot duplicate an attempt.
- Protected media works with authentication; missing media never displays a demo asset.
- Android back, rotation/configuration changes, relaunch, process death, and interrupted downloads do not corrupt progress.
- Accessibility labels, keyboard focus on web, readable contrast, and large-text layouts are checked on supported devices.

## Play Console items the owner must provide

- Legal developer name, address, support email, and verified developer account.
- Public privacy-policy URL and public account-deletion URL.
- Accurate target audience/age groups. If children are included, apply Google Play Families requirements and confirm Clerk/SDK suitability for child-directed use.
- Accurate Data safety answers, including account data, student profile data, learning activity, authentication, sharing, deletion, encryption in transit, and retention.
- Content rating questionnaire, app-access instructions for reviewers, screenshots, store description, app category, and contact details.
- Target API compliance: new Play submissions from 31 August 2026 require Android API 36 or higher.
