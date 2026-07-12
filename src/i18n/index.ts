import { getLocales } from 'expo-localization';
import { createContext, useContext } from 'react';

import { CourseLevel, SupportedLanguage } from '../types';
import { localizedContent } from './localizedContent';
import { localizedMottos } from './mottos';

export type AppLocale = Exclude<SupportedLanguage, 'system'>;

export const supportedLanguages: SupportedLanguage[] = ['system', 'ko', 'en', 'ja', 'es', 'de', 'fr', 'zh'];

const localeTags: Record<AppLocale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

const taglines: Record<AppLocale, string> = {
  ko: '흔들려도, 이어가라.',
  en: 'Waver. Keep going.',
  ja: '揺れても、進み続けろ。',
  es: 'Aunque dudes, sigue.',
  de: 'Wanke. Geh weiter.',
  fr: 'Vacille. Continue.',
  zh: '可以动摇，但要继续。',
};

const courseNames: Record<AppLocale, (level: CourseLevel) => string> = {
  ko: (level) => `${level} 과정`,
  en: (level) => level,
  ja: (level) => `${level} コース`,
  es: (level) => `Curso ${level}`,
  de: (level) => `${level}-Kurs`,
  fr: (level) => `Parcours ${level}`,
  zh: (level) => `${level}课程`,
};

const dayLabels: Record<AppLocale, (day: number) => string> = {
  ko: (day) => `Day ${day}`,
  en: (day) => `Day ${day}`,
  ja: (day) => `Day ${day}`,
  es: (day) => `Día ${day}`,
  de: (day) => `Tag ${day}`,
  fr: (day) => `Jour ${day}`,
  zh: (day) => `第${day}天`,
};

function supportedLocaleFor(languageCode?: string | null): AppLocale {
  if (languageCode === 'ko') return 'ko';
  if (languageCode === 'ja') return 'ja';
  if (languageCode === 'es') return 'es';
  if (languageCode === 'de') return 'de';
  if (languageCode === 'fr') return 'fr';
  if (languageCode === 'zh') return 'zh';
  return 'en';
}

export function resolveLocale(language: SupportedLanguage = 'system'): AppLocale {
  if (language !== 'system') return language;
  return supportedLocaleFor(getLocales()[0]?.languageCode);
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
      if (locale === 'zh') return `第${start}-${end}天`;
      if (locale === 'es') return `Días ${start}-${end}`;
      if (locale === 'de') return `Tag ${start}-${end}`;
      if (locale === 'fr') return `Jours ${start}-${end}`;
      return `Day ${start} - ${end}`;
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
