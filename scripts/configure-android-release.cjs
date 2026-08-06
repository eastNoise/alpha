const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const buildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  throw new Error('android/app/build.gradle is missing. Run Expo prebuild first.');
}

let source = fs.readFileSync(buildGradlePath, 'utf8');

const propertiesBlock = `
def alphaSigningProperties = new Properties()
def alphaSigningPropertiesPath = System.getenv("ALPHA_ANDROID_SIGNING_PROPERTIES")
def isAlphaReleaseTask = gradle.startParameter.taskNames.any {
    it.toLowerCase().contains("release")
}
if (alphaSigningPropertiesPath) {
    def alphaSigningPropertiesFile = file(alphaSigningPropertiesPath)
    if (!alphaSigningPropertiesFile.exists()) {
        throw new GradleException("Android signing properties not found: " + alphaSigningPropertiesPath)
    }
    alphaSigningPropertiesFile.withInputStream { alphaSigningProperties.load(it) }
} else if (isAlphaReleaseTask) {
    throw new GradleException("ALPHA_ANDROID_SIGNING_PROPERTIES is required for a release build.")
}
`;

if (!source.includes('def alphaSigningProperties = new Properties()')) {
  source = source.replace(
    'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()\n',
    `def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()\n${propertiesBlock}`,
  );
}

source = source.replace(
  /(\s*resourceConfigurations \+= \[[^\n]+\]\n)(?:\s*resourceConfigurations \+= \[[^\n]+\]\n)+/,
  '$1',
);

source = source
  .replaceAll('"zh-CN"', '"zh-rCN"')
  .replaceAll('"pt-BR"', '"pt-rBR"')
  .replaceAll('"zh-TW"', '"zh-rTW"');

if (!source.includes('storeFile file(alphaSigningProperties["storeFile"])')) {
  source = source.replace(
    /    signingConfigs \{\n(\s+debug \{[\s\S]*?\n\s+\})\n    \}/,
    `    signingConfigs {\n$1\n        release {\n            if (!alphaSigningProperties.isEmpty()) {\n                storeFile file(alphaSigningProperties["storeFile"])\n                storePassword alphaSigningProperties["storePassword"]\n                keyAlias alphaSigningProperties["keyAlias"]\n                keyPassword alphaSigningProperties["keyPassword"]\n            }\n        }\n    }`,
  );
}

source = source.replace(
  /(\s+release \{\n)(?:\s+\/\/ Caution![^\n]*\n\s+\/\/ see [^\n]*\n)?\s+signingConfig signingConfigs\.debug/,
  '$1            signingConfig signingConfigs.release',
);

if (!source.includes('signingConfig signingConfigs.release')) {
  throw new Error('Could not configure the Android release signing config.');
}

fs.writeFileSync(buildGradlePath, source);
console.log('Configured Android release signing.');
