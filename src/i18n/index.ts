import { getLocales } from 'expo-localization';
import { createContext, useContext } from 'react';

import { CourseLevel, SupportedLanguage } from '../types';
import { localizedContent } from './localizedContent';
import { localizedMottos } from './mottos';

export type AppLocale = Exclude<SupportedLanguage, 'system'>;

export const supportedLanguages: SupportedLanguage[] = [
  'system',
  'ko',
  'en',
  'ja',
  'es',
  'de',
  'fr',
  'zh',
  'pt-BR',
  'zh-Hant',
  'it',
];

const localeTags: Record<AppLocale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
  zh: 'zh-CN',
  'pt-BR': 'pt-BR',
  'zh-Hant': 'zh-TW',
  it: 'it-IT',
};

const taglines: Record<AppLocale, string> = {
  ko: '90일로 네 인생을\n다시 세워라.',
  en: 'Rebuild your life in 90 days.',
  ja: '90日で、人生を立て直せ。',
  es: 'Reconstruye tu vida en 90 días.',
  de: 'Baue dein Leben in 90 Tagen neu auf.',
  fr: 'Rebâtis ta vie en 90 jours.',
  zh: '用90天，重塑你的人生。',
  'pt-BR': 'Reconstrua sua vida em 90 dias.',
  'zh-Hant': '用90天，重塑你的人生。',
  it: 'Ricostruisci la tua vita in 90 giorni.',
};

const courseNames: Record<AppLocale, (level: CourseLevel) => string> = {
  ko: (level) => `${level} 과정`,
  en: (level) => level,
  ja: (level) => `${level} コース`,
  es: (level) => `Curso ${level}`,
  de: (level) => `${level}-Kurs`,
  fr: (level) => `Parcours ${level}`,
  zh: (level) => `${level}课程`,
  'pt-BR': (level) => `Curso ${level}`,
  'zh-Hant': (level) => `${level}課程`,
  it: (level) => `Corso ${level}`,
};

const dayLabels: Record<AppLocale, (day: number) => string> = {
  ko: (day) => `Day ${day}`,
  en: (day) => `Day ${day}`,
  ja: (day) => `Day ${day}`,
  es: (day) => `Día ${day}`,
  de: (day) => `Tag ${day}`,
  fr: (day) => `Jour ${day}`,
  zh: (day) => `第${day}天`,
  'pt-BR': (day) => `Dia ${day}`,
  'zh-Hant': (day) => `第${day}天`,
  it: (day) => `Giorno ${day}`,
};

type DeviceLocale = ReturnType<typeof getLocales>[number];

function supportedLocaleFor(deviceLocale?: DeviceLocale): AppLocale {
  const languageCode = deviceLocale?.languageCode;
  if (languageCode === 'ko') return 'ko';
  if (languageCode === 'ja') return 'ja';
  if (languageCode === 'es') return 'es';
  if (languageCode === 'de') return 'de';
  if (languageCode === 'fr') return 'fr';
  if (languageCode === 'pt') return 'pt-BR';
  if (languageCode === 'it') return 'it';
  if (languageCode === 'zh') {
    const traditionalRegions = new Set(['TW', 'HK', 'MO']);
    const isTraditional =
      deviceLocale?.languageScriptCode === 'Hant' ||
      traditionalRegions.has(deviceLocale?.regionCode ?? '') ||
      deviceLocale?.languageTag.includes('Hant');
    return isTraditional ? 'zh-Hant' : 'zh';
  }
  return 'en';
}

export function resolveLocale(language: SupportedLanguage = 'system'): AppLocale {
  if (language !== 'system') return language;
  return supportedLocaleFor(getLocales()[0]);
}

export function interpolate(template: string, values: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function createI18n(language: SupportedLanguage = 'system') {
  const locale = resolveLocale(language);
  const content = localizedContent[locale];
  return {
    locale,
    localeTag: localeTags[locale],
    tagline: taglines[locale],
    courseName(level: CourseLevel) {
      return courseNames[locale](level);
    },
    day(day: number) {
      return dayLabels[locale](day);
    },
    dayRange(start: number, end: number) {
      if (locale === 'zh' || locale === 'zh-Hant') return `第${start}-${end}天`;
      if (locale === 'es') return `Días ${start}-${end}`;
      if (locale === 'de') return `Tag ${start}-${end}`;
      if (locale === 'fr') return `Jours ${start}-${end}`;
      if (locale === 'pt-BR') return `Dias ${start}-${end}`;
      if (locale === 'it') return `Giorni ${start}-${end}`;
      return `Day ${start} - ${end}`;
    },
    dayCount(count: number) {
      const key = count === 1 ? 'dayOne' : 'days';
      return interpolate(content.ui[key] ?? localizedContent.en.ui[key], { count });
    },
    t(key: keyof typeof localizedContent.en.ui, values?: Record<string, string | number>) {
      return interpolate(content.ui[key] ?? localizedContent.en.ui[key], values);
    },
    languageName(value: SupportedLanguage) {
      return content.languages[value];
    },
    category(value: string) {
      return content.categories[value] ?? value;
    },
    scope(value: string) {
      return content.scopes[value] ?? value;
    },
    routine(id: string, fallback: string) {
      return content.routines[id] ?? fallback;
    },
    stage(level: CourseLevel, stageIndex: number) {
      return content.stages[level][Math.max(0, Math.min(3, stageIndex))];
    },
    motto(level: CourseLevel, day: number) {
      return localizedMottos[locale][level][Math.max(1, Math.min(30, day)) - 1];
    },
    date(dateKey: string) {
      const [year, month, day] = dateKey.split('-').map(Number);
      return new Intl.DateTimeFormat(localeTags[locale], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(year, month - 1, day)));
    },
  };
}

export type I18n = ReturnType<typeof createI18n>;

export const I18nContext = createContext<I18n>(createI18n('en'));

export function useI18n() {
  return useContext(I18nContext);
}
