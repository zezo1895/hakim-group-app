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

// Mapping of main material category to its specific sub-materials
const CATEGORY_MATERIALS_MAP = {
  'بلاستيك': ['PP', 'PS', 'PET', 'K-RESIN'],
  'فوم': ['فوم امتصاص', 'فوم عادى'],
  'كرتون': ['ورق', 'كرافت'],
};

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

  // Build clean main categories list: الكل, بلاستيك, فوم, كرتون
  const categoriesList = [
    { id: 'all', name: t('all') },
    { id: 'بلاستيك', name: translateMaterial('بلاستيك') },
    { id: 'فوم', name: translateMaterial('فوم') },
    { id: 'كرتون', name: translateMaterial('كرتون') },
  ];

  // Dynamically compute sub-materials based on selected main category
  const getSubMaterials = () => {
    const rawList = (selectedMaterial !== 'all' && CATEGORY_MATERIALS_MAP[selectedMaterial])
      ? CATEGORY_MATERIALS_MAP[selectedMaterial]
      : ['PP', 'PS', 'PET', 'K-RESIN', 'ورق', 'كرافت', 'فوم امتصاص', 'فوم عادى'];

    return [
      { id: 'all', name: t('all') },
      ...rawList.map(mat => ({
        id: mat,
        name: translateMaterial(mat)
      }))
    ];
  };

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

  const handleSelectMaterial = (materialId) => {
    setSelectedMaterial(materialId);
    // If selecting a category, reset sub-material if not applicable
    if (materialId !== 'all') {
      const allowed = CATEGORY_MATERIALS_MAP[materialId] || [];
      if (!allowed.includes(selectedMaterialName)) {
        setSelectedMaterialName('all');
      }
    }
  };

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
                {/* 1. Main Category: بلاستيك / فوم / كرتون */}
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
                  {renderChips(categoriesList, selectedMaterial, handleSelectMaterial)}
                </View>

                {/* 2. Sub-material type: PP, PS, PET, K-RESIN when Plastic is chosen */}
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
                  {renderChips(getSubMaterials(), selectedMaterialName, setSelectedMaterialName)}
                </View>

                {/* 3. Usage / Temperature: ساخن / بارد / ساخن وبارد */}
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
