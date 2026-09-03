const fs = require('node:fs');
const path = require('node:path');

const { getAccessToken } = require('./google-play-auth.cjs');

const root = path.resolve(__dirname, '..');
const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';
const track = process.env.GOOGLE_PLAY_TRACK || 'production';
const releaseStatus = process.env.GOOGLE_PLAY_RELEASE_STATUS || 'completed';
const changesNotSentForReview =
  process.env.GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW === 'true';
const appBundlePath = process.env.GOOGLE_PLAY_AAB;

if (!appBundlePath) {
  throw new Error('GOOGLE_PLAY_AAB is required.');
}

const absoluteBundlePath = path.resolve(appBundlePath);
const appConfig = require(path.join(root, 'app.json'));
const listings = require(path.join(root, 'release/google-play/store-listings.json'));
const releaseNotes = require(path.join(root, 'release/google-play/release-notes.json'));
const apiBase = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const uploadBase = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3';

async function request(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed (${response.status}): ${text}`);
  }
  return body;
}

async function main() {
  const accessToken = await getAccessToken();
  const edit = await request(`${apiBase}/applications/${packageName}/edits`, accessToken, {
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const editBase = `${apiBase}/applications/${packageName}/edits/${edit.id}`;

  try {
    const bundle = await request(
      `${uploadBase}/applications/${packageName}/edits/${edit.id}/bundles?uploadType=media`,
      accessToken,
      {
        body: fs.readFileSync(absoluteBundlePath),
        headers: { 'Content-Type': 'application/octet-stream' },
        method: 'POST',
      },
    );

    for (const [language, listing] of Object.entries(listings.localizations)) {
      await request(`${editBase}/listings/${language}`, accessToken, {
        body: JSON.stringify({
          fullDescription: listing.fullDescription,
          shortDescription: listing.shortDescription,
          title: listing.title,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });
    }

    const release = {
      name: `${appConfig.expo.version} (${bundle.versionCode})`,
      releaseNotes: Object.entries(releaseNotes.localizations).map(([language, text]) => ({
        language,
        text,
      })),
      status: releaseStatus,
      versionCodes: [String(bundle.versionCode)],
    };

    await request(`${editBase}/tracks/${track}`, accessToken, {
      body: JSON.stringify({ releases: [release], track }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });

    const reviewQuery = changesNotSentForReview
      ? '?changesNotSentForReview=true'
      : '';

    if (!changesNotSentForReview) {
      await request(`${editBase}:validate`, accessToken, {
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    }

    const committed = await request(`${editBase}:commit${reviewQuery}`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    console.log(JSON.stringify({
      editId: committed.id,
      changesNotSentForReview,
      packageName,
      releaseName: release.name,
      status: releaseStatus,
      track,
      versionCode: bundle.versionCode,
    }, null, 2));
  } catch (error) {
    await request(editBase, accessToken, { method: 'DELETE' }).catch(() => {});
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
