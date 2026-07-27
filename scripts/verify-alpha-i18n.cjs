const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { existsSync, mkdtempSync, readFileSync, rmSync } = require('node:fs');
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
  const locales = ['ko', 'en', 'ja', 'es', 'de', 'fr', 'zh', 'pt-BR', 'zh-Hant', 'it'];
  const levels = ['BASIC', 'STANDARD', 'HARD'];
  const routineIds = new Set(
    levels.flatMap((level) => courseStages[level].flatMap((stage) => stage.addedRoutines.map((routine) => routine.id))),
  );
  const englishUiKeys = Object.keys(localizedContent.en.ui);
  const singularDayLabels = {
    ko: '{count}일',
    en: '{count} day',
    ja: '{count}日',
    es: '{count} día',
    de: '{count} Tag',
    fr: '{count} jour',
    zh: '{count}天',
    'pt-BR': '{count} dia',
    'zh-Hant': '{count}天',
    it: '{count} giorno',
  };
  const cropEditorLabels = {
    ko: ['적용', '사진 맞추기'],
    en: ['Apply', 'Adjust image'],
    ja: ['適用', '画像を調整'],
    es: ['Aplicar', 'Ajustar imagen'],
    de: ['Anwenden', 'Bild anpassen'],
    fr: ['Appliquer', 'Ajuster l’image'],
    zh: ['应用', '调整图片'],
    'pt-BR': ['Aplicar', 'Ajustar imagem'],
    'zh-Hant': ['套用', '調整圖片'],
    it: ['Applica', 'Regola immagine'],
  };
  const nativeLocaleDirectories = {
    ko: 'ko', en: 'en', ja: 'ja', es: 'es', de: 'de', fr: 'fr', zh: 'zh-Hans',
    'pt-BR': 'pt-BR', 'zh-Hant': 'zh-Hant', it: 'it',
  };

  for (const locale of locales) {
    const content = localizedContent[locale];
    assert.ok(content, `Missing locale: ${locale}`);
    for (const key of englishUiKeys) {
      assert.equal(typeof content.ui[key], 'string', `${locale} missing UI key ${key}`);
      assert.ok(content.ui[key].trim(), `${locale} has empty UI key ${key}`);
    }
    assert.equal(content.ui.dayOne, singularDayLabels[locale], `${locale} singular day label`);
    assert.equal(content.ui.apply, cropEditorLabels[locale][0], `${locale} crop apply label`);
    assert.equal(content.ui.adjustCardImage, cropEditorLabels[locale][1], `${locale} crop title`);
    assert.ok(content.ui.cropImageInstruction.trim(), `${locale} crop instruction`);
    for (const id of routineIds) {
      assert.ok(content.routines[id]?.trim(), `${locale} missing routine ${id}`);
    }
    for (const level of levels) {
      assert.equal(content.stages[level].length, 4, `${locale} ${level} stage count`);
      assert.equal(localizedMottos[locale][level].length, 30, `${locale} ${level} motto count`);
      for (const [index, motto] of localizedMottos[locale][level].entries()) {
        assert.ok(motto.trim(), `${locale} ${level} day ${index + 1} empty motto`);
        assert.ok(
          motto.split('\n').length <= 3,
          `${locale} ${level} day ${index + 1} exceeds three designed lines`,
        );
      }
    }

    const nativeStringsPath = resolve(
      'ios', 'ALPHA', `${nativeLocaleDirectories[locale]}.lproj`, 'InfoPlist.strings',
    );
    assert.ok(existsSync(nativeStringsPath), `${locale} missing native InfoPlist.strings`);
    const nativeStrings = readFileSync(nativeStringsPath, 'utf8');
    assert.match(nativeStrings, /"NSPhotoLibraryUsageDescription"\s*=\s*".+";/u,
      `${locale} missing native photo permission copy`);
  }

  const localizedHardDay26 = {
    ko: '자신을 돌아보아 옳다면\n천만 명이 막아서도\n나아가라.',
    en: 'Own your choice\nthrough the hardest moment.\nThat is what a man does.',
    ja: '苦しい瞬間まで\n自分の選択に責任を持て。\nそれが男だ。',
    es: 'Responde por tu elección\nhasta en el momento más duro.\nEso es ser un hombre.',
    de: 'Steh bis zum härtesten Moment\nfür deine Entscheidung ein.\nDas macht einen Mann aus.',
    fr: 'Assume ton choix\njusqu’au moment le plus dur.\nC’est cela, être un homme.',
    zh: '在最艰难的时刻，\n也要为自己的选择负责。\n这才是男人。',
    'pt-BR': 'Assuma sua escolha\naté no momento mais difícil.\nIsso é ser homem.',
    'zh-Hant': '在最艱難的時刻，\n也要為自己的選擇負責。\n這才是男人。',
    it: 'Rispondi della tua scelta\nanche nel momento più duro.\nQuesto fa un uomo.',
  };
  const localizedStandardDay27 = {
    ko: '자신은 자신의 주인이며\n자신은 자신의 피난처다.',
    en: 'Even if everyone stands against you,\nwalk on if you know you are right.',
    ja: '誰もが立ちはだかっても\n自分が正しいなら歩き続けろ。',
    es: 'Aunque todos se interpongan,\nsi sabes que es correcto,\nsigue caminando.',
    de: 'Auch wenn sich alle gegen dich stellen:\nGeh weiter, wenn du weißt, dass es richtig ist.',
    fr: 'Même si tous te barrent la route,\navance si tu sais que c’est juste.',
    zh: '即使所有人都挡在面前，\n只要你确信是对的，就继续走。',
    'pt-BR': 'Mesmo que todos se oponham,\ncontinue se souber que está certo.',
    'zh-Hant': '即使所有人都擋在面前，\n只要你確信是對的，就繼續走。',
    it: 'Anche se tutti ti si oppongono,\ncontinua se sai di avere ragione.',
  };
  for (const locale of locales) {
    assert.equal(localizedMottos[locale].HARD[25], localizedHardDay26[locale], `${locale} HARD day 26`);
    assert.equal(
      localizedMottos[locale].STANDARD[26],
      localizedStandardDay27[locale],
      `${locale} STANDARD day 27`,
    );
  }

  const iosInfoPlist = readFileSync(resolve('ios', 'ALPHA', 'Info.plist'), 'utf8');
  assert.match(iosInfoPlist, /<key>CFBundleAllowMixedLocalizations<\/key>\s*<true\/>/u,
    'iOS mixed localization support is disabled');

  console.log('ALPHA localization verification passed: 10 locales, 90 mottos each, native permission copy.');
} finally {
  rmSync(outputDirectory, { force: true, recursive: true });
}
