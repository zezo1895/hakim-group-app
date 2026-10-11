import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import ar from './translations/ar';
import en from './translations/en';

const LANGUAGE_KEY = 'hakim_app_language';
const translations = { ar, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar'); // Default Arabic
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && translations[saved]) {
        setLanguage(saved);
      }
    } catch (e) {}
    setIsReady(true);
  };

  const changeLanguage = async (lang) => {
    if (!translations[lang]) return;
    setLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    // Note: Full RTL switch requires app restart
    // I18nManager.forceRTL(lang === 'ar');
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['ar']?.[key] || key;
  };

  // Helper to get product field based on language
  const getProductField = (product, fieldAr, fieldEn) => {
    if (!product) return '';
    if (language === 'en' && product[fieldEn]) {
      return product[fieldEn];
    }
    return product[fieldAr] || product[fieldEn] || '';
  };

  const isRTL = language === 'ar';

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, getProductField, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
