import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import ar from './locales/ar.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  ar: { translation: ar },
  en: { translation: en }
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang) {
        callback(storedLang);
        return;
      }
      callback('ar'); // Default language
    } catch (error) {
      console.log('Error reading language', error);
      callback('ar');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  
  const isRTL = lang === 'ar';
  
  // If RTL layout needs to be flipped
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Reload the app for RTL changes to take effect
    Updates.reloadAsync();
  }
};

export default i18n;
