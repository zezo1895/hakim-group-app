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
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    ...SHADOWS.md,
    height: '100%',
  },
  tabletHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabletHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
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
  },
  tabletItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabletItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'right',
  },
  tabletItemTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  mobileContainer: {
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
  },
  mobileListContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  mobileItem: {
    height: 44,
    paddingHorizontal: SPACING.lg,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  mobileItemActive: {
    backgroundColor: COLORS.primary,
  },
  mobileItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  mobileItemTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default Sidebar;
