# Prerana Mobile Release Documentation

Living release record for publishing Prerana Mobile to Google Play and the App Store. Update the pending sections as builds, testing, and store releases are completed.

## 1. Repository baseline

- Repository: `https://github.com/Rahul-Shetty-10/Prerana_mobile_app.git`
- Release branch: `main`
- Integration branch: `dev`
- App technology: Expo / React Native
- Expo SDK: 57
- Node: 22.x, npm: 10.x (enforced by `engines` and pinned in each EAS build profile)
- Production build profile: `production` in `eas.json`

## 2. Application identifiers

These are configured and must not be changed casually. Once an app exists in either store, its identifier is effectively permanent.

| Item | Value |
| --- | --- |
| EAS owner | `ellipsonic1` |
| EAS project ID | `d10db3ee-05c5-4a6b-b750-e7177a77a458` |
| Android application ID | `com.ellipsonic.prerana` |
| iOS bundle identifier | `com.ellipsonic.prerana` |
| App Store Connect app ID | `6812982050` |
| App name | Prerana |
| Version name | `1.0.0` (`expo.version` in `app.json`) |

Build numbers (`android.versionCode`, `ios.buildNumber`) are deliberately absent from `app.json`. `eas.json` sets `cli.appVersionSource: "remote"`, so EAS stores and auto-increments them; values in app config would be ignored.

## 3. Environment variables

The EAS `production` environment must contain:

```env
EXPO_PUBLIC_API_BASE_URL=https://app.smartguru.in/api/mobile/v1
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<production Clerk publishable key, pk_live_...>
EXPO_PUBLIC_STORAGE_BASE_URL=https://murshidaudio.s3.ap-south-1.amazonaws.com
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://prerana.smartguru.in/privacy-policy
EXPO_PUBLIC_TERMS_URL=https://prerana.smartguru.in/terms-and-conditions
EXPO_PUBLIC_ACCOUNT_DELETION_URL=https://prerana.smartguru.in/delete-account
EXPO_PUBLIC_PRIVACY_EMAIL=<privacy contact address>
EXPO_PUBLIC_SUPPORT_EMAIL=<support contact address>
```

Do not set `EXPO_PUBLIC_TENANT_SLUG`. Tenant selection is backend-driven, and `scripts/validate-release.mjs` fails the production build if that variable is present.

`EXPO_PUBLIC_*` values are inlined into the JavaScript bundle and are public by design. Never place a secret in one. Do not commit `.env`.

## 4. Pre-build verification

`npm run eas-build-pre-install` runs `scripts/validate-release.mjs` on every EAS build, so a misconfigured production environment fails before the native build starts.

Run the full gate locally before raising a release PR:

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

CI (`.github/workflows/pr-checks.yml`) runs the same sequence on every pull request into `main` or `dev`.

## 5. Build flow

```bash
eas login
eas project:info          # confirm owner and project ID match section 2
eas build --platform android --profile production   # .aab
eas build --platform ios --profile production       # .ipa
```

Other profiles: `preview` (internal distribution), `apk` (installable Android APK for manual testing), `development` (dev client).

iOS builds require an Apple Developer Program membership on the company account and an App Store Connect API key or Apple ID with access to app `6812982050`. EAS can manage the distribution certificate and provisioning profile.

## 6. Signing

- **Android** — EAS manages the upload keystore. The company owner must retain access to these credentials. Never replace an existing production keystore without explicit approval.
- **iOS** — EAS manages the distribution certificate and provisioning profile against the company Apple Developer account.

## 7. Over-the-air updates

The app ships with `expo-updates`. `runtimeVersion.policy` is `fingerprint`, and each build profile maps to a matching EAS Update channel.

OTA is appropriate for JavaScript, styling, and bundled asset changes only. Changes to the Expo SDK, React Native, native dependencies, permissions, app configuration, or icons require a new native build. See the README for the publishing commands.

An update reaches an installed build only when their runtime versions match. Because the policy is `fingerprint`, that hash covers the native side of the project, including the working tree at build time — two builds from the same commit can differ if one was made with uncommitted dependency changes. Confirm with `eas build:list` before publishing; if the installed build's runtime version differs from the current tree, those users can only be reached by a new store release.

Android build history for reference:

| versionCode | Commit | Channel | Runtime version | OTA-capable |
| --- | --- | --- | --- | --- |
| 2 | `1b44baf` | none | none | No — predates `expo-updates` |
| 4 | `8fdd55b` | `production` | `3af85efa…` | Yes |
| 5 | `8fdd55b` | `production` | `6be97348…` | Yes |
| 5 (apk) | `18ba6f6` | `apk` | `85d6cb7e…` | Yes |

## 8. Store submission

### Google Play

1. Confirm the `.aab` package name matches `com.ellipsonic.prerana`.
2. Configure Play App Signing.
3. Complete the store listing, screenshots, privacy policy, content rating, target audience, Data Safety, and declarations. Store listing icon source art is in `assets/store/`.
4. Upload to Internal testing first and install on a real device.
5. Resolve any Play Console warnings, then promote to closed/open testing or production.

### App Store

1. Confirm the `.ipa` bundle identifier matches `com.ellipsonic.prerana`.
2. `eas submit --platform ios --profile production` uploads to App Store Connect app `6812982050`.
3. Complete the App Store listing, screenshots for every required device size, privacy nutrition labels, and the account deletion declaration (the app exposes `EXPO_PUBLIC_ACCOUNT_DELETION_URL`).
4. Distribute via TestFlight and test on a real device before submitting for review.
5. Submit for review.

App icons carry no alpha channel, which the App Store requires.

## 9. Known backend gaps in this release

These features are gated off in `src/featureFlags.ts` because the backend does not serve them. Nothing in the app links to them, so there are no dead ends, but they are absent from the shipped build. Turn the flag on and rebuild once the route exists.

| Gated | Missing route | User-visible effect |
| --- | --- | --- |
| Quizzes Home, Assessment History, Quiz Landing | `/student/quizzes-home`, `/student/assessment-history`, `/student/quiz-landing` | The "View Quizzes" shortcut is not shown in the subject workspace. |
| Profile achievements | `/student/achievements` | The achievements section shows its empty state. |
| Chapter quizzes beyond the mapped chapter | none resolves a chapter's `quizId` | "Quiz Yourself" appears only on chapters listed in `quizIdResolver.ts`. Other chapters complete on their resources alone. |

The single highest-value backend change for this app is an endpoint returning a chapter's quiz for the signed-in student — the Convex query `assessments/quizzes:getStudentChapterQuiz` already implements the logic, or `/student/chapter-resources` could include the `quizId`. That alone would restore quizzes across every chapter.

## 10. Release verification checklist

- [ ] `dev` merged to `main` and CI green on the merge commit.
- [ ] Correct EAS account active and project ID matches section 2.
- [ ] Production environment variables configured in EAS; `EXPO_PUBLIC_TENANT_SLUG` absent.
- [ ] Clerk production login works.
- [ ] Backend `/session` returns a student session and rejects multiple memberships.
- [ ] Dashboard loads from the production API.
- [ ] Subjects and chapter resources load; all eight resource types render.
- [ ] Chapter completion requires every resource the chapter offers, plus the quiz where the chapter has one.
- [ ] A chapter with no quiz completes once all its resources have been viewed.
- [ ] "Quiz Yourself" appears only on chapters that can actually start a quiz.
- [ ] Dashboard, Profile, and the subject workspace report the same completed-chapter count.
- [ ] Fundamentals exercise flow works end to end (the quiz path that does not depend on a quizId map).
- [ ] Library featured resources open the correct tab.
- [ ] Arcade screens open.
- [ ] Sign-out, account switch, and relaunch work without leaking the previous tenant's data.
- [ ] Android production build completes; `.aab` package name matches Play Console.
- [ ] iOS production build completes; `.ipa` bundle ID matches App Store Connect.
- [ ] Internal testing / TestFlight installation succeeds on real devices.
- [ ] OTA preview update publishes and applies on a relaunch.
- [ ] Store declarations and listings complete.
- [ ] Release submitted/published.

## 11. Release record

- Android EAS build ID: `PENDING`
- Android build URL: `PENDING`
- `.aab` filename: `PENDING`
- iOS EAS build ID: `PENDING`
- iOS build URL: `PENDING`
- `.ipa` filename: `PENDING`
- Version name: `PENDING`
- Android version code: `PENDING`
- iOS build number: `PENDING`
- SHA-256/upload certificate: `PENDING`
- Play Console app URL: `PENDING`
- App Store Connect URL: `PENDING`
- Internal testing / TestFlight date: `PENDING`
- Production publication date: `PENDING`
- Final status: `PENDING`

## 12. Reference documentation

- Expo Android production build: https://docs.expo.dev/tutorial/eas/android-production-build/
- Expo iOS production build: https://docs.expo.dev/tutorial/eas/ios-production-build/
- Expo Android submission: https://docs.expo.dev/submit/android/
- Expo iOS submission: https://docs.expo.dev/submit/ios/
- EAS app versions: https://docs.expo.dev/build-reference/app-versions/
- EAS Update: https://docs.expo.dev/eas-update/introduction/
- Google Play app setup: https://support.google.com/googleplay/android-developer/answer/9859152
