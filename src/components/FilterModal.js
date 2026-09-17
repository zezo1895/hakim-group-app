import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme';

const MATERIALS = [
  { id: 'all', name: 'الكل' },
  { id: 'بلاستيك', name: 'بلاستيك' },
  { id: 'ورق', name: 'ورق' },
  { id: 'فوم', name: 'فوم' },
  { id: 'بلاستيك ميكرويف', name: 'ميكرويف' },
  { id: 'قصدير', name: 'قصدير' },
];

const MATERIAL_NAMES = [
  { id: 'all', name: 'الكل' },
  { id: 'PP', name: 'PP' },
  { id: 'PS', name: 'PS' },
  { id: 'PET', name: 'PET' },
  { id: 'K-RESIN', name: 'K-RESIN' },
  { id: 'كرافت', name: 'كرافت' },
  { id: 'ورق', name: 'ورق' },
  { id: 'فوم امتصاص', name: 'فوم امتصاص' },
  { id: 'فوم عادى', name: 'فوم عادى' },
];

const TEMPERATURES = [
  { id: 'all', name: 'الكل' },
  { id: 'hot', name: t('hot') },
  { id: 'cold', name: t('cold') },
  { id: 'both', name: 'ساخن وبارد' },
];

export default function FilterModal({ visible, onClose, initialMaterial, initialTemp, initialMaterialName, onApply, materialCategories = [] }) {
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial || 'all');
  const [selectedTemp, setSelectedTemp] = useState(initialTemp || 'all');
  const [selectedMaterialName, setSelectedMaterialName] = useState(initialMaterialName || 'all');

  const dynamicMaterials = [
    { id: 'all', name: 'الكل' },
    ...materialCategories.map(cat => ({ id: cat.name, name: cat.name }))
  ];

  useEffect(() => {
    if (visible) {
      setSelectedMaterial(initialMaterial || 'all');
      setSelectedTemp(initialTemp || 'all');
      setSelectedMaterialName(initialMaterialName || 'all');
    }
  }, [visible, initialMaterial, initialTemp, initialMaterialName]);

  const handleApply = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
    onApply(selectedMaterial, selectedTemp, selectedMaterialName);
    onClose();
  };

  const handleReset = () => {
    setSelectedMaterial('all');
    setSelectedTemp('all');
    setSelectedMaterialName('all');
    onApply('all', 'all', 'all');
    onClose();
  };

  const renderChips = (options, selectedValue, onSelect) => (
    <View style={styles.chipsContainer}>
      {options.map((option) => {
        const isSelected = selectedValue === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.chip, isSelected && styles.chipActive]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>تصفية المنتجات</Text>
                <View style={styles.closeBtn} />
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>الخامة</Text>
                  {renderChips(dynamicMaterials, selectedMaterial, setSelectedMaterial)}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>نوع الخامة</Text>
                  {renderChips(MATERIAL_NAMES, selectedMaterialName, setSelectedMaterialName)}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>الاستخدام</Text>
                  {renderChips(TEMPERATURES, selectedTemp, setSelectedTemp)}
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                  <Text style={styles.resetBtnText}>إعادة ضبط</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                  <Text style={styles.applyBtnText}>تطبيق الفلتر</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Add import ScrollView if needed
import { ScrollView } from 'react-native';

const getStyles = (colors, isDark) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SPACING.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chipsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row-reverse',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: colors.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  resetBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
