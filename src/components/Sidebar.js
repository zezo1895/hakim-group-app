import React, { memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';
import { isTablet } from '../utils/responsive';

const Sidebar = memo(({ categories = [], activeCategory, onSelectCategory }) => {
  const allCategories = [{ id: 'all', name: 'الكل' }, ...categories];

  const renderTabletItem = ({ item }) => {
    const isActive = activeCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.tabletItem, isActive && styles.tabletItemActive]}
        onPress={() => onSelectCategory(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabletItemText, isActive && styles.tabletItemTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMobileItem = ({ item }) => {
    const isActive = activeCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.mobileItem, isActive && styles.mobileItemActive]}
        onPress={() => onSelectCategory(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.mobileItemText, isActive && styles.mobileItemTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isTablet()) {
    return (
      <View style={styles.tabletContainer}>
        <View style={styles.tabletHeader}>
          <Text style={styles.tabletHeaderText}>الأقسام</Text>
        </View>
        <FlatList
          data={allCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTabletItem}
          contentContainerStyle={styles.tabletListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.mobileContainer}>
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMobileItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mobileListContent}
        inverted={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  tabletContainer: {
    width: 200,
    backgroundColor: '#FAFCFB',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: '100%',
  },
  tabletHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabletHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  tabletListContent: {
    padding: SPACING.sm,
  },
  tabletItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  tabletItemActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  tabletItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontWeight: '500',
  },
  tabletItemTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  mobileContainer: {
    height: 64,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
    ...SHADOWS.small,
    elevation: 4, // for android
    zIndex: 10,
  },
  mobileListContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  mobileItem: {
    height: 40,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mobileItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.small,
  },
  mobileItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  mobileItemTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default Sidebar;
