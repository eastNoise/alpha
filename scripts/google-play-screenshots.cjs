const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';
const command = process.argv[2] || 'inspect';
const language = process.argv[3] || 'ko-KR';
const screenshotsRoot = process.argv[4] || 'release/google-play/screenshots';
const imageType = 'phoneScreenshots';

if (!credentialsPath) {
  throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is required.');
}

if (!['inspect', 'upload'].includes(command)) {
  throw new Error('Usage: node scripts/google-play-screenshots.cjs <inspect|upload> [language] [screenshots-root]');
}

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
  const responseText = await response.text();
  const body = responseText ? JSON.parse(responseText) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed (${response.status}): ${responseText}`);
  }
  return body;
}

function screenshotPaths() {
  const directory = path.resolve(screenshotsRoot, language);
  const files = fs.readdirSync(directory)
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .sort()
    .map((name) => path.join(directory, name));
  if (files.length < 2 || files.length > 8) {
    throw new Error(`${language} must have between 2 and 8 phone screenshots; found ${files.length}.`);
  }
  return files;
}

async function main() {
  const accessToken = await getAccessToken();
  const edit = await request(`${apiBase}/applications/${packageName}/edits`, accessToken, {
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const imagesUrl = `${apiBase}/applications/${packageName}/edits/${edit.id}/listings/${language}/${imageType}`;

  try {
    const before = await request(imagesUrl, accessToken);
    if (command === 'inspect') {
      console.log(JSON.stringify({
        editId: edit.id,
        imageType,
        images: before.images || [],
        language,
        packageName,
      }, null, 2));
      await request(`${apiBase}/applications/${packageName}/edits/${edit.id}`, accessToken, { method: 'DELETE' });
      return;
    }

    const files = screenshotPaths();
    await request(imagesUrl, accessToken, { method: 'DELETE' });

    const uploaded = [];
    for (const file of files) {
      const extension = path.extname(file).toLowerCase();
      const contentType = extension === '.png' ? 'image/png' : 'image/jpeg';
      const image = await request(`${uploadBase}/applications/${packageName}/edits/${edit.id}/listings/${language}/${imageType}?uploadType=media`, accessToken, {
        body: fs.readFileSync(file),
        headers: { 'Content-Type': contentType },
        method: 'POST',
      });
      uploaded.push({ file: path.basename(file), ...image });
      console.log(`${language}: uploaded ${path.basename(file)}`);
    }

    const verified = await request(imagesUrl, accessToken);
    if ((verified.images || []).length !== files.length) {
      throw new Error(`Expected ${files.length} uploaded images, found ${(verified.images || []).length}.`);
    }

    await request(`${apiBase}/applications/${packageName}/edits/${edit.id}:validate`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const committed = await request(`${apiBase}/applications/${packageName}/edits/${edit.id}:commit`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    console.log(JSON.stringify({
      editId: committed.id,
      imageType,
      language,
      packageName,
      previousCount: (before.images || []).length,
      uploaded,
    }, null, 2));
  } catch (error) {
    await request(`${apiBase}/applications/${packageName}/edits/${edit.id}`, accessToken, { method: 'DELETE' }).catch(() => {});
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
