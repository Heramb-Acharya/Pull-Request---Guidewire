import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';

const resources = {
  English: { translation: en },
  Hindi: { translation: hi },
  Tamil: { translation: ta },
  Telugu: { translation: te },
  Kannada: { translation: kn }
};

const savedLang = localStorage.getItem('rakshak_lang') || 'English';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'English',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
