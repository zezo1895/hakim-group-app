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

  // Helper to translate material names (فوم, كرتون, بلاستيك, إلخ)
  const translateMaterial = (mat) => {
    if (!mat) return '';
    const trimmed = String(mat).trim();
    if (language === 'ar') {
      if (/foam/i.test(trimmed)) return 'فوم';
      if (/carton/i.test(trimmed) || /cardboard/i.test(trimmed)) return 'كرتون';
      if (/plastic/i.test(trimmed)) return 'بلاستيك';
      if (/paper/i.test(trimmed)) return 'ورق';
      if (/aluminum/i.test(trimmed)) return 'ألومنيوم';
      if (/kraft/i.test(trimmed)) return 'كرافت';
      return trimmed;
    } else {
      if (trimmed.includes('فوم')) return 'Foam';
      if (trimmed.includes('كرتون')) return 'Carton';
      if (trimmed.includes('بلاستيك')) return 'Plastic';
      if (trimmed.includes('ورق')) return 'Paper';
      if (trimmed.includes('ألومنيوم') || trimmed.includes('الومنيوم')) return 'Aluminum';
      if (trimmed.includes('كرافت')) return 'Kraft';
      return trimmed;
    }
  };

  // Helper to translate size descriptions (أونص, مل, ملم, سم, لتر, إلخ)
  const translateSize = (sizeStr) => {
    if (!sizeStr) return '';
    let str = String(sizeStr);
    if (language === 'en') {
      str = str
        .replace(/أونصة|أونص|اونصة|اونص/g, 'oz')
        .replace(/مللي|ملي|مل/g, 'ml')
        .replace(/ملم|مم/g, 'mm')
        .replace(/سنتيمتر|سم/g, 'cm')
        .replace(/لتر/g, 'L')
        .replace(/كجم|كيلو/g, 'kg')
        .replace(/جرام|جم/g, 'g')
        .replace(/قطعة/g, 'pcs')
        .replace(/كبير/g, 'Large')
        .replace(/متوسط/g, 'Medium')
        .replace(/صغير/g, 'Small');
    } else {
      str = str
        .replace(/\boz\b/gi, 'أونص')
        .replace(/\bml\b/gi, 'مل')
        .replace(/\bmm\b/gi, 'مم')
        .replace(/\bcm\b/gi, 'سم')
        .replace(/\bl\b/gi, 'لتر')
        .replace(/\bkg\b/gi, 'كجم')
        .replace(/\bg\b/gi, 'جم')
        .replace(/\bpcs\b/gi, 'قطعة')
        .replace(/\blarge\b/gi, 'كبير')
        .replace(/\bmedium\b/gi, 'متوسط')
        .replace(/\bsmall\b/gi, 'صغير');
    }
    return str;
  };

  // Helper to translate categories (أدوات مائدة, جالون, سلطانية, طبق, علبة, غطاء, كوب, إلخ)
  const categoryDict = {
    'أدوات مائدة': 'Tableware',
    'ادوات مائدة': 'Tableware',
    'جالون': 'Gallon',
    'سلطانية': 'Bowl',
    'طبق': 'Plate',
    'علبة': 'Box',
    'غطاء': 'Lid',
    'أغطية': 'Lids',
    'كوب': 'Cup',
    'أكواب': 'Cups',
    'شاليموه': 'Straw',
    'ملاعق وشوك': 'Cutlery',
    'أكياس': 'Bags',
    'مناديل': 'Tissues',
    'ورقيات': 'Paper Products',
    'قالب': 'Mold / Container',
    'مستديرة': 'Round',
    'مستدير': 'Round',
    'مدور': 'Round',
    'مستطيل': 'Rectangular',
    'مستطيلة': 'Rectangular',
    'مربع': 'Square',
    'مربعة': 'Square',
    'بيضاوي': 'Oval',
    'بيضاوية': 'Oval',
    'مثلث': 'Triangle',
  };

  const translateCategory = (catName) => {
    if (!catName) return '';
    const trimmed = String(catName).trim();
    if (language === 'en') {
      if (categoryDict[trimmed]) return categoryDict[trimmed];
      for (const [arKey, enVal] of Object.entries(categoryDict)) {
        if (trimmed.includes(arKey)) return enVal;
      }
      return trimmed;
    } else {
      for (const [arKey, enVal] of Object.entries(categoryDict)) {
        if (trimmed.toLowerCase() === enVal.toLowerCase()) return arKey;
      }
      return trimmed;
    }
  };

  const isRTL = language === 'ar';

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, getProductField, translateMaterial, translateSize, translateCategory, isRTL }}>
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
