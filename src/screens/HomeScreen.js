import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../theme';
import { isTablet, getProductColumns } from '../utils/responsive';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import SyncProgress from '../components/SyncProgress';
import AdminPasswordModal from '../components/AdminPasswordModal';
import FilterModal from '../components/FilterModal';

import { useProducts } from '../hooks/useProducts';
import { syncService } from '../services/syncService';
import { api } from '../api/client';

export default function HomeScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const tablet = isTablet(windowWidth);
  const { 
    productTypes, 
    materialCategories,
    filteredProducts, 
    isLoading, 
    refresh, 
    filterByCategory, 
    setAdvancedFilters,
    searchProducts,
    activeCategory,
    activeMaterial,
    activeTemp,
    searchQuery
  } = useProducts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ progress: 0, message: '', stage: 'data' });
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  const pressTimeoutRef = useRef(null);

  const sidebarWidth = tablet ? 200 : 0;
  const contentPadding = SPACING.md;
  const availableWidth = windowWidth - sidebarWidth - (contentPadding * 2);
  const numColumns = getProductColumns(windowWidth);
  const totalGap = SPACING.md * (numColumns - 1);
  const cardWidth = Math.max(0, Math.floor((availableWidth - totalGap) / numColumns));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncService.fullSync(({ stage, current, total, message }) => {
    });
    await refresh();
    setIsRefreshing(false);
  };

  const handleCategorySelect = (categoryId) => {
    filterByCategory(categoryId);
  };

  const handleSearch = (query) => {
    console.log(`[HomeScreen] handleSearch triggered with: "${query}"`);
    searchProducts(query);
    if (query.trim().length > 2 && api && api.logSearch) {
      console.log(`[HomeScreen] Logging search to analytics: "${query}"`);
      api.logSearch(query).catch(() => {});
    }
  };

  const handleProductPress = (product) => {
    navigation.push('ProductDetail', {
      productId: product.id,
      productName: product.name,
    });
  };

  const handleLogoPressIn = () => {
    pressTimeoutRef.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAdminModalVisible(true);
    }, 2000);
  };

  const handleLogoPressOut = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
  };

  const handleAdminSuccess = () => {
    setAdminModalVisible(false);
    navigation.navigate('Admin');
  };

  const handleApplyFilters = (material, temp) => {
    setAdvancedFilters(material, temp);
  };

  const hasActiveAdvancedFilters = activeMaterial !== 'all' || activeTemp !== 'all';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Pressable 
            onPressIn={handleLogoPressIn}
            onPressOut={handleLogoPressOut}
          >
            <Image 
              source={require('../../assets/app-icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <SearchBar 
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="ابحث عن منتج..."
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, hasActiveAdvancedFilters && styles.filterBtnActive]} 
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color={hasActiveAdvancedFilters ? COLORS.white : COLORS.primary} />
            {hasActiveAdvancedFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.mainContainer, { flexDirection: tablet ? 'row' : 'column' }]}>
        <Sidebar 
          categories={productTypes}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
        <View style={styles.listContainer}>
          <FlatList
            key={numColumns}
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.flatListContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onPress={() => handleProductPress(item)} 
                width={cardWidth}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>لا توجد منتجات تطابق بحثك</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
      
      <AdminPasswordModal 
        visible={adminModalVisible}
        onClose={() => setAdminModalVisible(false)}
        onSuccess={handleAdminSuccess}
      />

      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialMaterial={activeMaterial}
        initialTemp={activeTemp}
        onApply={handleApplyFilters}
        materialCategories={materialCategories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Uses new off-white
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 239, 234, 0.8)',
    ...SHADOWS.small,
    elevation: 4,
    zIndex: 10, // Ensure shadow casts over list
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logo: {
    height: 44, // Slightly larger for premium feel
    width: 140,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#FAFCFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.small,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E02424', // Elegant red
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl, // Extra space at bottom
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: SPACING.md,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
