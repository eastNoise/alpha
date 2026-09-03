const crypto = require('node:crypto');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const androidPublisherScope = 'https://www.googleapis.com/auth/androidpublisher';
const defaultServiceAccount =
  'alpha-play-console-submit@eastnoise-alpha-play.iam.gserviceaccount.com';

function createAssertion(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    iss: credentials.client_email,
    scope: androidPublisherScope,
  })}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  return `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`;
}

async function tokenFromKeyFile(credentialsPath) {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      assertion: createAssertion(credentials),
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

function tokenFromImpersonation(serviceAccount) {
  return execFileSync(
    'gcloud',
    [
      'auth',
      'print-access-token',
      `--impersonate-service-account=${serviceAccount}`,
      `--scopes=${androidPublisherScope}`,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  ).trim();
}

async function getAccessToken() {
  if (process.env.GOOGLE_PLAY_ACCESS_TOKEN) {
    return process.env.GOOGLE_PLAY_ACCESS_TOKEN.trim();
  }
  if (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
    return tokenFromKeyFile(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON);
  }
  return tokenFromImpersonation(
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT || defaultServiceAccount,
  );
}

module.exports = { getAccessToken };
