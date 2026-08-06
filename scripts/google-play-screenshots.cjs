const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { getAccessToken } = require('./google-play-auth.cjs');

const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.eastnoise.alpha';
const command = process.argv[2] || 'inspect';
const language = process.argv[3] || 'ko-KR';
const imageSource = process.argv[4] || 'release/google-play/screenshots';
const imageType = process.argv[5] || 'phoneScreenshots';

if (!['inspect', 'upload'].includes(command)) {
  throw new Error(
    'Usage: node scripts/google-play-screenshots.cjs <inspect|upload> ' +
      '[language] [image-source] [image-type]',
  );
}

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
  const responseText = await response.text();
  const body = responseText ? JSON.parse(responseText) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed (${response.status}): ${responseText}`);
  }
  return body;
}

function imagePaths() {
  const resolvedSource = path.resolve(imageSource);
  const sourceStat = fs.statSync(resolvedSource);
  const files = (sourceStat.isFile()
    ? [resolvedSource]
    : fs.readdirSync(path.join(resolvedSource, language))
        .filter((name) => /\.(jpe?g|png)$/i.test(name))
        .sort()
        .map((name) => path.join(resolvedSource, language, name)));
  if (imageType.endsWith('Screenshots') && (files.length < 2 || files.length > 8)) {
    throw new Error(`${language} must have between 2 and 8 phone screenshots; found ${files.length}.`);
  }
  if (!imageType.endsWith('Screenshots') && files.length !== 1) {
    throw new Error(`${imageType} requires exactly one image; found ${files.length}.`);
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

    const files = imagePaths();
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
    const localHashes = files.map((file) =>
      crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    );
    const remoteHashes = (verified.images || []).map((image) => image.sha256);
    if (JSON.stringify(remoteHashes) !== JSON.stringify(localHashes)) {
      throw new Error(`${language} ${imageType} SHA-256 readback mismatch.`);
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
