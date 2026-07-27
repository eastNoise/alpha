const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const listingsPath = path.join(root, 'release/google-play/store-listings.json');
const notesPath = path.join(root, 'release/google-play/release-notes.json');
const iconPath = path.join(root, 'release/google-play/assets/app-icon-512.png');
const featurePath = path.join(root, 'release/google-play/assets/feature-graphic.png');
const screenshotsPath = path.join(root, 'release/google-play/screenshots');

const listings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));
const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
const errors = [];

for (const [locale, listing] of Object.entries(listings.localizations)) {
  if ([...listing.title].length > 30) errors.push(`${locale}: title exceeds 30 characters`);
  if ([...listing.shortDescription].length > 80) errors.push(`${locale}: short description exceeds 80 characters`);
  if ([...listing.fullDescription].length > 4000) errors.push(`${locale}: full description exceeds 4000 characters`);
  if (!notes.localizations[locale]) errors.push(`${locale}: release notes missing`);
}

for (const locale of Object.keys(notes.localizations)) {
  if (!listings.localizations[locale]) errors.push(`${locale}: store listing missing`);
}

const imageInfo = (file) => execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', file], { encoding: 'utf8' });
const iconInfo = imageInfo(iconPath);
const featureInfo = imageInfo(featurePath);

if (!/pixelWidth: 512/.test(iconInfo) || !/pixelHeight: 512/.test(iconInfo)) errors.push('App icon must be 512 x 512');
if (!/pixelWidth: 1024/.test(featureInfo) || !/pixelHeight: 500/.test(featureInfo)) errors.push('Feature graphic must be 1024 x 500');
if (!/hasAlpha: no/.test(iconInfo)) errors.push('App icon must not have transparency');
if (!/hasAlpha: no/.test(featureInfo)) errors.push('Feature graphic must not have transparency');
if (fs.statSync(iconPath).size > 1024 * 1024) errors.push('App icon must be 1 MB or smaller');

for (const locale of Object.keys(listings.localizations)) {
  const localePath = path.join(screenshotsPath, locale);
  if (!fs.existsSync(localePath)) {
    errors.push(`${locale}: screenshot directory missing`);
    continue;
  }

  const screenshots = fs.readdirSync(localePath)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort();

  if (screenshots.length !== 5) {
    errors.push(`${locale}: expected 5 screenshots, found ${screenshots.length}`);
  }

  for (const screenshot of screenshots) {
    const screenshotInfo = imageInfo(path.join(localePath, screenshot));
    if (!/pixelWidth: 1320/.test(screenshotInfo) || !/pixelHeight: 2640/.test(screenshotInfo)) {
      errors.push(`${locale}/${screenshot}: screenshot must be 1320 x 2640`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Google Play release assets verified: ${Object.keys(listings.localizations).length} locales, 50 screenshots`);
