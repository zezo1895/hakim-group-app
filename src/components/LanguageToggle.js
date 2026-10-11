import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
      activeOpacity={0.8}
      onPress={handleToggle}
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <View style={[styles.badge, isArabic && styles.badgeActive]}>
        <Text style={[styles.badgeText, isArabic && styles.badgeTextActive]}>ع</Text>
      </View>
      <View style={[styles.badge, !isArabic && styles.badgeActive]}>
        <Text style={[styles.badgeText, !isArabic && styles.badgeTextActive]}>EN</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  badgeActive: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  badgeTextActive: {
    color: COLORS.white,
  },
});
