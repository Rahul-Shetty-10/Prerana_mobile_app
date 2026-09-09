# Prerana Mobile Android Release Documentation

This is the living release record for publishing Prerana Mobile to Google Play. Update the pending sections as the company EAS account, package ID, credentials, builds, testing, and Play Console release are completed.

## 1. Repository baseline

- Repository: `https://github.com/Rahul-Shetty-10/Prerana_mobile_app.git`
- Branch: `main`
- Baseline commit at handoff: `b02c6eb`
- App technology: Expo / React Native
- Expo SDK: 57
- Production build profile: `production` in `eas.json`
- Current worktree validation: `npm run typecheck` passes
- Dependency validation: `npm ci --ignore-scripts` passes after refreshing `package-lock.json`

## 2. Changes completed during release preparation

- Cloned the repository into the workspace.
- Installed project dependencies.
- Installed the EAS CLI globally.
- Refreshed `package-lock.json` because the original lockfile was missing optional `lightningcss` platform packages required by `npm ci`.
- Confirmed the Expo configuration resolves successfully.
- Confirmed the TypeScript check passes.
- Multi-tenant session and request isolation have been implemented in the mobile client; backend contract work remains separately tracked.

## 3. Environment variables

The production environment must contain these values:

```env
EXPO_PUBLIC_API_BASE_URL=https://app.smartguru.in/api/mobile/v1
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<real production Clerk publishable key>
# Do not set EXPO_PUBLIC_TENANT_SLUG. Tenant selection is backend-driven.
```

Do not commit `.env` or paste the real Clerk key into source control. For an EAS build, add these variables to the EAS `production` environment. The Clerk project and backend must use the matching production configuration and the `convex` JWT template.

## 4. Company ownership and identifiers — pending confirmation

These values must be confirmed before the first Play Console release:

- Company EAS account/owner: `PENDING`
- Company EAS project ID: `PENDING`
- Permanent Android application ID: `PENDING`
- Play Console app name: `PENDING`
- Google Play developer account: `PENDING`
- Android signing owner/credentials: `PENDING`

The current application ID is `com.darshu_2228.preranamobile`. This is an intern/personal-looking identifier and should be replaced with a company-approved reverse-domain identifier before the first Play Console app is created. Do not invent a replacement. Once the first app is uploaded, the package name is effectively permanent and cannot be casually changed.

After the company approves the new ID, update `expo.android.package` in `app.json`, reconnect the project to the company EAS project, and regenerate/verify Android credentials before building.

## 5. Recommended EAS build flow

After the company EAS account and identifiers are ready:

```bash
eas login
eas project:info
eas build --platform android --profile production
```

The production profile is configured to produce an Android App Bundle (`.aab`) and auto-increment the Android version code. Download the completed `.aab` from the EAS build page or from the CLI output.

Before the first build, confirm that the EAS project shown by `eas project:info` belongs to the company account and that its Android application identifier matches `app.json`.

## 6. Signing

For a brand-new Play Console app, EAS can create and manage the Android keystore. The senior/company owner must approve this choice and retain access to the credentials.

If the company already has a keystore for this application ID, use that existing upload/signing setup. Never replace an existing production keystore without explicit approval.

## 7. Play Console first release

1. In Play Console, choose **Create app**.
2. Use the approved app name, default language, app/game type, free/paid status, and support email.
3. Ensure the package name matches the built `.aab` exactly.
4. Configure Play App Signing.
5. Complete the store listing, screenshots, privacy policy, content rating, target audience, Data Safety, and declarations.
6. Upload the `.aab` to Internal testing first.
7. Install and test the internal release on a real Android device.
8. Fix any Play Console warnings or policy issues.
9. Promote to closed/open testing or production according to the company release plan.

## 8. Release verification checklist

- [ ] Correct company EAS account is active.
- [ ] Correct company EAS project ID is in `app.json`.
- [ ] Approved company Android application ID is in `app.json`.
- [ ] Production environment variables are configured in EAS.
- [ ] Clerk production login works.
- [ ] Backend `/session` returns a student session.
- [ ] Dashboard loads from the production API.
- [ ] Subjects and chapter resources load.
- [ ] Quiz/exercise flow works.
- [ ] Library and profile load.
- [ ] Arcade screens open.
- [ ] Android production build completes.
- [ ] `.aab` package name matches the Play Console app.
- [ ] Internal testing installation succeeds.
- [ ] Sign-out and relaunch work.
- [ ] Play Console declarations and store listing are complete.
- [ ] Release is submitted/published.

## 9. Release record

- EAS build ID: `PENDING`
- EAS build URL: `PENDING`
- `.aab` filename: `PENDING`
- Version name: `PENDING`
- Version code: `PENDING`
- SHA-256/upload certificate: `PENDING`
- Play Console app URL: `PENDING`
- Internal testing date: `PENDING`
- Production publication date: `PENDING`
- Final status: `PENDING`

## 10. Reference documentation

- Expo Android submission: https://docs.expo.dev/submit/android/
- Expo Android production build: https://docs.expo.dev/tutorial/eas/android-production-build/
- Google Play app setup: https://support.google.com/googleplay/android-developer/answer/9859152
- Google Play release preparation: https://support.google.com/googleplay/android-developer/answer/9859348
