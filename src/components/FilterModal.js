import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { useLanguage } from '../i18n';

const RAW_MATERIAL_NAMES = [
  { id: 'all', isAll: true },
  { id: 'PP', name: 'PP' },
  { id: 'PS', name: 'PS' },
  { id: 'PET', name: 'PET' },
  { id: 'K-RESIN', name: 'K-RESIN' },
  { id: 'كرافت', name: 'كرافت' },
  { id: 'ورق', name: 'ورق' },
  { id: 'فوم امتصاص', name: 'فوم امتصاص' },
  { id: 'فوم عادى', name: 'فوم عادى' },
];

export default function FilterModal({ 
  visible, 
  onClose, 
  initialMaterial, 
  initialTemp, 
  initialMaterialName, 
  onApply, 
  materialCategories = [] 
}) {
  const { t, translateMaterial, isRTL } = useLanguage();

  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial || 'all');
  const [selectedTemp, setSelectedTemp] = useState(initialTemp || 'all');
  const [selectedMaterialName, setSelectedMaterialName] = useState(initialMaterialName || 'all');

  const dynamicMaterials = [
    { id: 'all', name: t('all') },
    ...materialCategories.map(cat => ({ 
      id: cat.name, 
      name: translateMaterial(cat.name) 
    }))
  ];

  const materialNamesList = RAW_MATERIAL_NAMES.map(item => ({
    id: item.id,
    name: item.isAll ? t('all') : translateMaterial(item.name || item.id)
  }));

  const temperaturesList = [
    { id: 'all', name: t('all') },
    { id: 'hot', name: t('hot') },
    { id: 'cold', name: t('cold') },
    { id: 'both', name: t('hotAndCold') },
  ];

  useEffect(() => {
    if (visible) {
      setSelectedMaterial(initialMaterial || 'all');
      setSelectedTemp(initialTemp || 'all');
      setSelectedMaterialName(initialMaterialName || 'all');
    }
  }, [visible, initialMaterial, initialTemp, initialMaterialName]);

  const handleApply = () => {
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
    <View style={[styles.chipsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
              <View style={[styles.header, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('filterTitle')}</Text>
                <View style={styles.closeBtn} />
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.section}>
                  <Text style={[
                    styles.sectionTitle, 
                    { 
                      textAlign: isRTL ? 'right' : 'left',
                      writingDirection: isRTL ? 'rtl' : 'ltr'
                    }
                  ]}>
                    {t('materialCategoryFilter')}
                  </Text>
                  {renderChips(dynamicMaterials, selectedMaterial, setSelectedMaterial)}
                </View>

                <View style={styles.section}>
                  <Text style={[
                    styles.sectionTitle, 
                    { 
                      textAlign: isRTL ? 'right' : 'left',
                      writingDirection: isRTL ? 'rtl' : 'ltr'
                    }
                  ]}>
                    {t('materialNameFilter')}
                  </Text>
                  {renderChips(materialNamesList, selectedMaterialName, setSelectedMaterialName)}
                </View>

                <View style={styles.section}>
                  <Text style={[
                    styles.sectionTitle, 
                    { 
                      textAlign: isRTL ? 'right' : 'left',
                      writingDirection: isRTL ? 'rtl' : 'ltr'
                    }
                  ]}>
                    {t('temperatureFilter')}
                  </Text>
                  {renderChips(temperaturesList, selectedTemp, setSelectedTemp)}
                </View>
              </ScrollView>

              <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity 
                  style={[
                    styles.resetBtn, 
                    isRTL ? { marginLeft: SPACING.md, marginRight: 0 } : { marginRight: SPACING.md, marginLeft: 0 }
                  ]} 
                  onPress={handleReset}
                >
                  <Text style={styles.resetBtnText}>{t('resetFilter')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                  <Text style={styles.applyBtnText}>{t('applyFilter')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

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
  },
  chipsContainer: {
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
  },
  resetBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
