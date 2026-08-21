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
  const dayCloseLabels = {
    ko: ['오늘 마감', '아직 {count}개 남았다.', '이대로 마감하면 오늘은 미완성으로 기록된다.', '돌아가기', '미완성으로 마감', '오늘의 기준을 지켰다.'],
    en: ['Close today', 'You still have {count} left.', 'Closing now will record today as incomplete.', 'Go back', 'Close as incomplete', "You held today's standard."],
    ja: ['今日を締める', 'まだ{count}件残っている。', 'このまま締めると、今日は未完了として記録される。', '戻る', '未完了で締める', '今日の基準を守った。'],
    es: ['Cerrar el día', 'Aún quedan {count}.', 'Si cierras ahora, hoy quedará registrado como incompleto.', 'Volver', 'Cerrar como incompleto', 'Cumpliste el estándar de hoy.'],
    de: ['Tag abschließen', 'Noch {count} offen.', 'Wenn du jetzt abschließt, wird der heutige Tag als unvollständig gespeichert.', 'Zurück', 'Unvollständig abschließen', 'Du hast deinen heutigen Standard gehalten.'],
    fr: ['Clore la journée', 'Il en reste encore {count}.', 'Si tu clos maintenant, cette journée sera enregistrée comme incomplète.', 'Retour', 'Clore comme incomplète', 'Tu as respecté l’exigence du jour.'],
    zh: ['结束今天', '还有 {count} 项未完成。', '现在结束，今天将被记录为未完成。', '返回', '按未完成结束', '你守住了今天的标准。'],
    'pt-BR': ['Encerrar o dia', 'Ainda faltam {count}.', 'Se encerrar agora, o dia será registrado como incompleto.', 'Voltar', 'Encerrar como incompleto', 'Você manteve o padrão de hoje.'],
    'zh-Hant': ['結束今天', '還有 {count} 項未完成。', '現在結束，今天將記錄為未完成。', '返回', '以未完成結束', '你守住了今天的標準。'],
    it: ['Chiudi la giornata', 'Ne restano ancora {count}.', 'Se chiudi ora, oggi verrà registrato come incompleto.', 'Indietro', 'Chiudi come incompleto', 'Hai rispettato lo standard di oggi.'],
  };
  const shareAppLabels = {
    ko: '친구에게 앱 공유하기',
    en: 'Share ALPHA with a friend',
    ja: '友達にアプリを共有',
    es: 'Compartir la app con un amigo',
    de: 'App mit einem Freund teilen',
    fr: 'Partager l’app avec un ami',
    zh: '把应用分享给朋友',
    'pt-BR': 'Compartilhar o app com um amigo',
    'zh-Hant': '把 App 分享給朋友',
    it: 'Condividi l’app con un amico',
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
    assert.deepEqual(
      [
        content.ui.closeDayAction,
        content.ui.incompleteCloseTitle,
        content.ui.incompleteCloseCopy,
        content.ui.returnToRoutines,
        content.ui.closeIncomplete,
        content.ui.resultCompleteCopy,
      ],
      dayCloseLabels[locale],
      `${locale} day-close labels`,
    );
    assert.equal(content.ui.shareApp, shareAppLabels[locale], `${locale} share label`);
    assert.ok(content.ui.shareAppTitle.trim(), `${locale} missing share title`);
    assert.ok(content.ui.shareAppMessage.trim(), `${locale} missing share message`);
    assert.doesNotMatch(content.ui.shareAppMessage, /https?:\/\//u, `${locale} share link must remain unset`);
    assert.ok(content.ui.shareFailedToast.trim(), `${locale} missing share failure message`);
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
