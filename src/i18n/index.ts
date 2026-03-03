import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enProjections from './locales/en/projections.json';
import enTour from './locales/en/tour.json';
import enNodes from './locales/en/nodes.json';

import esARCommon from './locales/es-AR/common.json';
import esARProjections from './locales/es-AR/projections.json';
import esARTour from './locales/es-AR/tour.json';
import esARNodes from './locales/es-AR/nodes.json';

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es-AR', label: 'Español (AR)' },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]['code'];

/**
 * Lazy-load the help namespace (only needed when the Instructions drawer opens).
 */
export async function loadHelpNamespace(lang: string): Promise<void> {
  if (i18n.hasResourceBundle(lang, 'help')) return;

  let bundle: Record<string, unknown>;
  if (lang === 'es-AR') {
    bundle = (await import('./locales/es-AR/help.json')).default;
  } else {
    bundle = (await import('./locales/en/help.json')).default;
  }
  i18n.addResourceBundle(lang, 'help', bundle);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        projections: enProjections,
        tour: enTour,
        nodes: enNodes,
      },
      'es-AR': {
        common: esARCommon,
        projections: esARProjections,
        tour: esARTour,
        nodes: esARNodes,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'projections', 'tour', 'nodes'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bokari-language',
      caches: ['localStorage'],
      // Map generic "es" or "es-419" to our supported "es-AR"
      convertDetectedLanguage: (lng: string) => {
        if (lng.startsWith('es')) return 'es-AR';
        return lng;
      },
    },
  });

export default i18n;
