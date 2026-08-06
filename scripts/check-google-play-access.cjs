const { getAccessToken } = require('./google-play-auth.cjs');

const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';

async function main() {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/reviews?maxResults=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
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
