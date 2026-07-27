const crypto = require('crypto');
const fs = require('fs');

const keyPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';

if (!keyPath) {
  console.error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is required.');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
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
const assertion = `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`;

async function main() {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      assertion,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
  const tokenBody = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(`Google OAuth failed (${tokenResponse.status})`);

  const response = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/reviews?maxResults=1`,
    { headers: { Authorization: `Bearer ${tokenBody.access_token}` } },
  );

  if (!response.ok) {
    const body = await response.text();
    console.error(`Google Play access check failed (${response.status}): ${body}`);
    process.exit(1);
  }

  console.log(`Google Play API access verified for ${packageName}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
