const path = require('node:path');

const { getAccessToken } = require('./google-play-auth.cjs');

const root = path.resolve(__dirname, '..');
const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';
const command = process.argv[2] || 'inspect';
const language = process.argv[3] || 'ko-KR';
const listings = require(path.join(root, 'release/google-play/store-listings.json'));
const apiBase = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

if (!['inspect', 'apply'].includes(command)) {
  throw new Error('Usage: node scripts/google-play-listing.cjs <inspect|apply> [language]');
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

function summary(listing) {
  return {
    fullDescriptionLength: listing.fullDescription.length,
    shortDescription: listing.shortDescription,
    title: listing.title,
  };
}

async function createEdit(accessToken) {
  return request(`${apiBase}/applications/${packageName}/edits`, accessToken, {
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

async function main() {
  const localListing = listings.localizations[language];
  if (!localListing) {
    throw new Error(`Missing local Google Play listing for ${language}.`);
  }

  const accessToken = await getAccessToken();
  const edit = await createEdit(accessToken);
  const editBase = `${apiBase}/applications/${packageName}/edits/${edit.id}`;
  const listingUrl = `${editBase}/listings/${language}`;
  let verifyBase = null;

  try {
    const before = await request(listingUrl, accessToken);
    if (command === 'inspect') {
      console.log(JSON.stringify({ before: summary(before), language, packageName }, null, 2));
      await request(editBase, accessToken, { method: 'DELETE' });
      return;
    }

    await request(listingUrl, accessToken, {
      body: JSON.stringify({
        fullDescription: localListing.fullDescription,
        shortDescription: localListing.shortDescription,
        title: localListing.title,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });
    await request(`${editBase}:validate`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    await request(`${editBase}:commit`, accessToken, {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const verifyEdit = await createEdit(accessToken);
    verifyBase = `${apiBase}/applications/${packageName}/edits/${verifyEdit.id}`;
    const after = await request(`${verifyBase}/listings/${language}`, accessToken);
    await request(verifyBase, accessToken, { method: 'DELETE' });
    verifyBase = null;

    const expected = summary(localListing);
    const actual = summary(after);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Google Play listing readback mismatch: ${JSON.stringify({ actual, expected })}`);
    }
    console.log(JSON.stringify({ after: actual, before: summary(before), language, packageName }, null, 2));
  } catch (error) {
    if (verifyBase) {
      await request(verifyBase, accessToken, { method: 'DELETE' }).catch(() => {});
    }
    await request(editBase, accessToken, { method: 'DELETE' }).catch(() => {});
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
