import React, { useState, useEffect } from 'react';
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

const TEMPERATURES = [
  { id: 'all', name: 'الكل' },
  { id: 'hot', name: 'ساخن' },
  { id: 'cold', name: 'بارد' },
  { id: 'both', name: 'ساخن وبارد' },
];

export default function FilterModal({ visible, onClose, initialMaterial, initialTemp, onApply, materialCategories = [] }) {
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial || 'all');
  const [selectedTemp, setSelectedTemp] = useState(initialTemp || 'all');

  const dynamicMaterials = [
    { id: 'all', name: 'الكل' },
    ...materialCategories.map(cat => ({ id: cat.name, name: cat.name }))
  ];

  useEffect(() => {
    if (visible) {
      setSelectedMaterial(initialMaterial || 'all');
      setSelectedTemp(initialTemp || 'all');
    }
  }, [visible, initialMaterial, initialTemp]);

  const handleApply = () => {
    onApply(selectedMaterial, selectedTemp);
    onClose();
  };

  const handleReset = () => {
    setSelectedMaterial('all');
    setSelectedTemp('all');
    onApply('all', 'all');
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
                  <Ionicons name="close" size={24} color={COLORS.text} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
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
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row-reverse',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
