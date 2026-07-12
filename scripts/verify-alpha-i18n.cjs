const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const outputDirectory = mkdtempSync(join(tmpdir(), 'alpha-i18n-'));
const tsc = resolve('node_modules/.bin/tsc');

try {
  execFileSync(tsc, [
    '--module', 'commonjs',
    '--target', 'es2020',
    '--moduleResolution', 'node',
    '--skipLibCheck',
    '--outDir', outputDirectory,
    'src/types.ts',
    'src/data.ts',
    'src/i18n/localizedContent.ts',
    'src/i18n/mottos.ts',
  ], { stdio: 'inherit' });

  const { courseStages } = require(join(outputDirectory, 'data.js'));
  const { localizedContent } = require(join(outputDirectory, 'i18n/localizedContent.js'));
  const { localizedMottos } = require(join(outputDirectory, 'i18n/mottos.js'));
  const locales = ['ko', 'en', 'ja', 'es', 'de', 'fr', 'zh'];
  const levels = ['BASIC', 'STANDARD', 'HARD'];
  const routineIds = new Set(
    levels.flatMap((level) => courseStages[level].flatMap((stage) => stage.addedRoutines.map((routine) => routine.id))),
  );
  const englishUiKeys = Object.keys(localizedContent.en.ui);

  for (const locale of locales) {
    const content = localizedContent[locale];
    assert.ok(content, `Missing locale: ${locale}`);
    for (const key of englishUiKeys) {
      assert.equal(typeof content.ui[key], 'string', `${locale} missing UI key ${key}`);
      assert.ok(content.ui[key].trim(), `${locale} has empty UI key ${key}`);
    }
    for (const id of routineIds) {
      assert.ok(content.routines[id]?.trim(), `${locale} missing routine ${id}`);
    }
    for (const level of levels) {
      assert.equal(content.stages[level].length, 4, `${locale} ${level} stage count`);
      assert.equal(localizedMottos[locale][level].length, 30, `${locale} ${level} motto count`);
      for (const motto of localizedMottos[locale][level]) assert.ok(motto.trim());
    }
  }

  console.log('ALPHA localization verification passed: 7 locales, 90 mottos each.');
} finally {
  rmSync(outputDirectory, { force: true, recursive: true });
}
