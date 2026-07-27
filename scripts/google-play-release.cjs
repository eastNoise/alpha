const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';
const track = process.env.GOOGLE_PLAY_TRACK || 'production';
const releaseStatus = process.env.GOOGLE_PLAY_RELEASE_STATUS || 'completed';
const appBundlePath = process.env.GOOGLE_PLAY_AAB;

if (!credentialsPath) {
  throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is required.');
}

if (!appBundlePath) {
  throw new Error('GOOGLE_PLAY_AAB is required.');
}

const absoluteBundlePath = path.resolve(appBundlePath);
const appConfig = require(path.join(root, 'app.json'));
const listings = require(path.join(root, 'release/google-play/store-listings.json'));
const releaseNotes = require(path.join(root, 'release/google-play/release-notes.json'));
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const apiBase = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const uploadBase = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3';

function createAssertion() {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
  })}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  return `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`;
}

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      assertion: createAssertion(),
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Google OAuth failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

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

    await request(`${editBase}:validate`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const committed = await request(`${editBase}:commit`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    console.log(JSON.stringify({
      editId: committed.id,
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
