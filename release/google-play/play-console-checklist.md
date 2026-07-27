# Google Play Console Final Checklist

## Release artifact

- App name: `ALPHA: REFORGE`
- Package: `com.eastnoise.alpha`
- Version name: `1.0.1`
- Version code: `2`
- AAB: `/Users/ustone/Downloads/ALPHA-1.0.1-vc2.aab`
- AAB SHA-256: `f43882bf50d95f6c03ba85b65756ff8e70c03d13269be6729a433de623af734f`
- Target SDK: `36`
- Minimum SDK: `24`
- Upload certificate SHA-256: `2C:6E:F9:25:25:E9:12:0A:D6:D6:A4:F3:83:86:5D:FF:94:44:B5:B0:12:0F:3C:8F:0F:6B:25:E9:BB:43:42:E6`

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
- Phone screenshots: upload the 10 locales x 5 status-neutral Android listing images under `release/google-play/screenshots/` (`1320 x 2640`).

## App content answers

- App access: All functionality is available without login or restricted access.
- Ads: No, the app does not contain ads.
- Target audience: Not designed for children. Confirm the selected age group before submission.
- News app: No.
- Government app: No.
- Financial features: None.
- Health features: General habit and routine tracking only; no diagnosis, treatment, or medical advice.
- Content rating: Answer no to violence, sexual content, gambling, drugs, profanity, and user-generated online content. Submit the questionnaire and verify the generated rating.

## Data safety answers

- Data collected: No.
- Data shared with third parties: No.
- User accounts: None.
- Routine progress, reflections, settings, and selected card images stay on the user's device.
- Photos: The user explicitly chooses an image for a card. Images are processed and stored locally and are not uploaded.
- Notifications: The app schedules local reminders on the device. It does not use remote marketing notifications.
- Data deletion request: Not applicable because there is no account and no server-side user data. Deleting the app removes its local app data, subject to Android backup/restore behavior.
- Security practices: Select the answers that correspond to no transmitted user data. Do not claim server-side encryption for data that never leaves the device.

## Final manual checks

- Confirm Play App Signing during the first AAB upload.
- Confirm pricing and every country/region before publishing. A published free app cannot later be changed to paid.
- Review the automatically generated permission declaration after uploading the AAB.
- Verify the Data safety preview matches the answers above.
- Verify the content rating and target-audience result.
- Run the closed-testing or production pre-launch report and review crashes, ANRs, accessibility, and screenshots.
- Do not press the final production publish button until the above checks are complete.
