# Google Play Console Final Checklist

## Release artifact

- Current production release: `1.0.3 (3)`
- Current Korean listing name: `ALPHA - 90일 자기통제`
- Package: `com.eastnoise.alpha`
- Version name: `1.0.4`
- Version code: `4`
- AAB: `release/google-play/build/ALPHA-1.0.4-vc4.aab` (local ignored build artifact)
- AAB SHA-256: `3967425b93def1b73a706a7595b58577674cd193ce4f0da399baabeea2c689b8`
- Local validation: the release bundle build and JAR signature verification passed, the signer matches the new upload key, and the merged release manifest has the expected package/version with blocked permissions absent.
- Target SDK: `36`
- Minimum SDK: `24`
- Currently registered upload certificate SHA-256: `2C:6E:F9:25:25:E9:12:0A:D6:D6:A4:F3:83:86:5D:FF:94:44:B5:B0:12:0F:3C:8F:0F:6B:25:E9:BB:43:42:E6`
- Upload key reset: requested on 2026-08-06 with the new certificate; Play Console shows the request as pending. Do not upload the AAB until the reset is approved.

## Store setup

- App or game: App
- Free or paid: Paid
- Category: Productivity
- Price in South Korea: KRW 4,400
- Countries/regions: Select all intended countries before publishing.
- Privacy policy: https://east-noise-web.vercel.app/legal/alpha/privacy
- App website: https://east-noise-web.vercel.app/alpha
- Support: https://east-noise-web.vercel.app/alpha/support
- Store copy: `release/google-play/store-listings.json`
- Release notes: `release/google-play/release-notes.json`
- App icon: `release/google-play/assets/app-icon-512.png`
- Feature graphic: `release/google-play/assets/feature-graphic.png`
- Phone screenshot source: 10 locales x 6 status-neutral Android listing images under `release/google-play/screenshots/` (`1320 x 2640`).
- Console application: 10 locale listings and 60 screenshots were committed through the Developer API on 2026-08-06.
- Asset verification: live icon and feature graphic SHA-256 values match the local source files, so they were not re-uploaded.
- API authentication: use keyless gcloud impersonation with the dedicated ALPHA Play service account; no service-account JSON key is stored locally or in the repository.

## App content answers

- App access: All functionality is available without login or restricted access.
- Ads: No, the app does not contain ads.
- Target audience: Not designed for children. Confirm the selected age group before submission.
- News app: No.
- Government app: No.
- Financial features: None.
- Health apps declaration: Select `Health and fitness > Activity and Fitness` because the app records exercise routines and progress. It does not diagnose, treat, access Health Connect, or collect health data.
- Content rating: The current Korean public rating is `3세 이상`. Answer no to violence, depicted sexual material, gambling, drugs, profanity, and user-generated online content. The routine text includes a non-graphic `포르노 금지` item; review that wording when resubmitting the questionnaire.

## Data safety answers

- Data collected: No.
- Data shared with third parties: No.
- User accounts: None.
- Routine progress, reflections, settings, and selected card images stay on the user's device.
- Photos: The user explicitly chooses an image for a card. Images are processed and stored locally and are not uploaded.
- Notifications: The app schedules local reminders on the device. It does not use remote marketing notifications.
- Permissions: The next build opens the Android system photo picker without requesting broad external-storage permission. Confirm the uploaded AAB no longer lists `READ_EXTERNAL_STORAGE` or `WRITE_EXTERNAL_STORAGE`.
- Data deletion request: Not applicable because there is no account and no server-side user data. Deleting the app removes its local app data, subject to Android backup/restore behavior.
- Security practices: Select the answers that correspond to no transmitted user data. Do not claim server-side encryption for data that never leaves the device.

## Final manual checks

- ASO listing edits are complete. The upload-key reset request is pending; no AAB, release track, or production rollout has changed yet.
- Real-device QA was intentionally skipped for this ASO-only pass and remains unverified.

- After the reset is approved, confirm the registered upload certificate matches the new local certificate before uploading `1.0.4 (4)`.
- Confirm pricing and every country/region before publishing. A published free app cannot later be changed to paid.
- Public checks on 2026-08-06 confirmed `KRW 4,400` and availability in KR. The same listing was publicly available in US, JP, ES, DE, FR, BR, TW, and IT; mainland China did not expose a Google Play sale page.
- The exact Play Console country/region selection is still a console-only check and must be captured before publishing.
- Review the automatically generated permission declaration after uploading the AAB.
- Verify the Data safety preview matches the answers above.
- Verify the content rating and target-audience result.
- Run the closed-testing or production pre-launch report and review crashes, ANRs, accessibility, and screenshots.
- Do not press the final production publish button until the above checks are complete.
