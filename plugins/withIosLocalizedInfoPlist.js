const fs = require('node:fs');
const path = require('node:path');

const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');

const localizedPhotoPermissions = {
  en: 'Allow ALPHA to access your photos so you can personalize card images.',
  ko: '카드 이미지를 원하는 사진으로 꾸미려면 사진 접근을 허용해 주세요.',
  ja: 'カード画像を好きな写真に変更するため、写真へのアクセスを許可してください。',
  es: 'Permite que ALPHA acceda a tus fotos para personalizar las imágenes de las tarjetas.',
  de: 'Erlaube ALPHA den Zugriff auf deine Fotos, um die Kartenbilder anzupassen.',
  fr: 'Autorisez ALPHA à accéder à vos photos pour personnaliser les images des cartes.',
  'zh-Hans': '请允许 ALPHA 访问你的照片，以便自定义卡片图片。',
  'pt-BR': 'Permita que o ALPHA acesse suas fotos para personalizar as imagens dos cartões.',
  'zh-Hant': '請允許 ALPHA 存取你的照片，以便自訂卡片圖片。',
  it: 'Consenti ad ALPHA di accedere alle foto per personalizzare le immagini delle schede.',
};

function addLocalizedFiles(config) {
  return withDangerousMod(config, ['ios', (modConfig) => {
    const appDirectory = path.join(modConfig.modRequest.platformProjectRoot, 'ALPHA');

    for (const [locale, permission] of Object.entries(localizedPhotoPermissions)) {
      const localeDirectory = path.join(appDirectory, `${locale}.lproj`);
      fs.mkdirSync(localeDirectory, { recursive: true });
      fs.writeFileSync(
        path.join(localeDirectory, 'InfoPlist.strings'),
        `"CFBundleDisplayName" = "ALPHA";\n` +
          `"NSPhotoLibraryUsageDescription" = "${permission}";\n`,
      );
    }

    return modConfig;
  }]);
}

function addLocalizedResources(config) {
  return withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    const appGroupKey = project.findPBXGroupKey({ path: 'ALPHA' });
    let variantGroupKey = project.findPBXVariantGroupKey({ name: 'InfoPlist.strings' });

    if (!variantGroupKey) {
      variantGroupKey = project.pbxCreateVariantGroup('InfoPlist.strings');
      project.addToPbxGroup(variantGroupKey, appGroupKey);

      const buildFile = {
        uuid: project.generateUuid(),
        fileRef: variantGroupKey,
        basename: 'InfoPlist.strings',
      };
      project.addToPbxBuildFileSection(buildFile);
      project.addToPbxResourcesBuildPhase(buildFile);
    }

    for (const locale of Object.keys(localizedPhotoPermissions)) {
      project.addKnownRegion(locale);
      const file = project.addFile(
        `ALPHA/${locale}.lproj/InfoPlist.strings`,
        variantGroupKey,
        { lastKnownFileType: 'text.plist.strings' },
      );
      if (!file) continue;

      const fileReferences = project.pbxFileReferenceSection();
      fileReferences[file.fileRef].name = `"${locale}"`;
      fileReferences[`${file.fileRef}_comment`] = locale;
      const child = project.getPBXVariantGroupByKey(variantGroupKey).children
        .find((candidate) => candidate.value === file.fileRef);
      if (child) child.comment = locale;
    }

    return modConfig;
  });
}

module.exports = function withIosLocalizedInfoPlist(config) {
  return addLocalizedFiles(addLocalizedResources(config));
};
