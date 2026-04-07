# TestFlight Setup — Design Spec

**Date:** 2026-04-07
**Approach:** Manual Capacitor + Xcode build, uploaded to TestFlight

---

## Goal

Get Snapora installable on a friend's iPhone via TestFlight for early feedback. No automation needed at this stage — manual build and upload each time a new build is ready.

---

## Prerequisites (already confirmed)

- Apple Developer Program: enrolled (Vikramaditya Lakhotia)
- Xcode 26.4: installed
- Friend has: iPhone with Apple ID
- Capacitor config: exists with `appId: com.snapora.app`, `appName: Snapora`

---

## Section 1 — Capacitor iOS Setup

Install Capacitor packages and add the iOS platform:

```
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
```

This generates an `ios/` folder — a native Xcode project that wraps the React web app.

Add convenience scripts to `package.json`:
```json
"cap:sync": "npm run build && npx cap sync ios",
"cap:open": "npx cap open ios"
```

Standard build flow (run every time before archiving):
```
npm run cap:sync
npm run cap:open
```

No changes needed to `capacitor.config.ts` — `appId` and `appName` are already correct.

---

## Section 2 — Xcode Signing & App Store Connect

**In Xcode (`App` target → Signing & Capabilities):**
- Team: select Apple Developer account (Vikramaditya Lakhotia)
- Automatically manage signing: on
- Bundle Identifier: `com.snapora.app`
- Version: `1.0`
- Build: `1`

Xcode will auto-generate the provisioning profile and signing certificate. No manual cert management.

**In App Store Connect (one-time):**
1. Go to appstoreconnect.apple.com → My Apps → `+` New App
2. Platform: iOS
3. Bundle ID: `com.snapora.app`
4. Name: `Snapora`
5. SKU: `snapora-001`
6. Primary Language: English

---

## Section 3 — Build, Archive & Upload

From Xcode (each time you want to push a build):
1. Select target device: `Any iOS Device (arm64)`
2. Product → Archive
3. In the Organizer: Distribute App → TestFlight & App Store → Upload
4. Use default options, click through to upload

Upload takes ~5–10 minutes. Apple's automated review takes under an hour. Build then appears in TestFlight.

Increment the Build number (`1` → `2` → `3`) for each subsequent upload.

---

## Section 4 — Inviting Testers

**Internal testers (up to 100, no Apple review needed):**
1. App Store Connect → your app → TestFlight → Internal Testing
2. Add tester by Apple ID email
3. Friend receives email → installs TestFlight app → taps link → installs Snapora

**External testers** (future): requires a brief Apple review, but supports up to 10,000 testers and a public link. Not needed now.

---

## Limitations at This Stage

- The Apple Photos extraction (Python/AppleScript) does not run inside the iOS app — the import flow uses a standard file picker, which works fine on iPhone (friend can pick photos from their camera roll)
- Stripe/Prodigi not integrated — checkout flow is not testable yet
- Friend is testing: onboarding, photo import, book editor, layouts, and overall UX

---

## Future: Adding Automation

Once builds are going out frequently, add Fastlane to automate signing, build, and upload with a single command. GitHub Actions can then trigger Fastlane on every push to `main`. Not needed now.
