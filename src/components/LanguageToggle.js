import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';

export default function LanguageToggle({ style }) {
  const { language, changeLanguage } = useLanguage();

  const handleToggle = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    changeLanguage(nextLang);
  };

  const isArabic = language === 'ar';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleToggle}
      style={[styles.button, style]}
    >
      <Ionicons name="globe-outline" size={17} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.langCode}>{isArabic ? 'English' : 'عربي'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#D0E6D8',
    ...SHADOWS.small,
  },
  icon: {
    marginRight: 5,
  },
  langCode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
