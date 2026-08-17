import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Pressable, 
  useWindowDimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, FONT_SIZES } from '../theme';
import { isTablet, getProductColumns } from '../utils/responsive';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import SyncProgress from '../components/SyncProgress';
import AdminPasswordModal from '../components/AdminPasswordModal';

import { useProducts } from '../hooks/useProducts';
import { syncService } from '../services/syncService';
import { api } from '../api/client';

export default function HomeScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const tablet = isTablet(windowWidth);
  const { 
    productTypes, 
    filteredProducts, 
    isLoading, 
    refresh, 
    filterByCategory, 
    searchProducts,
    activeCategory,
    searchQuery
  } = useProducts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ progress: 0, message: '', stage: 'data' });
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  
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
      // Background sync, no full screen UI needed for pull-to-refresh
    });
    await refresh();
    setIsRefreshing(false);
  };

  const handleCategorySelect = (categoryId) => {
    filterByCategory(categoryId);
  };

  const handleSearch = (query) => {
    searchProducts(query);
    if (query.trim().length > 2 && api && api.logSearch) {
      api.logSearch(query).catch(() => {});
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id, productName: product.name });
  };

  const handleAdminAccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdminModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onLongPress={handleAdminAccess} delayLongPress={5000} style={styles.logoContainer}>
        <Image 
          source={require('../../assets/app-icon.png')} // Adjust if path changes
          style={styles.logo}
          resizeMode="contain"
          defaultSource={{ uri: 'https://via.placeholder.com/100x36?text=Logo' }}
        />
      </Pressable>
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={searchProducts}
          onSearch={handleSearch}
          placeholder="ابحث عن منتج أو كود..."
        />
      </View>
    </View>
  );

  if (isSyncing) {
    return <SyncProgress {...syncProgress} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <View style={[styles.mainContainer, { flexDirection: tablet ? 'row' : 'column' }]}>
        <Sidebar 
          categories={productTypes}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
        <View style={styles.listContainer}>
          <FlatList
            key={numColumns} // Force re-render when columns change
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.flatListContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onPress={() => handleProductPress(item)} 
                width={cardWidth} 
              />
            )}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              !isLoading && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>لا توجد منتجات</Text>
                </View>
              )
            }
          />
        </View>
      </View>
      <AdminPasswordModal 
        visible={adminModalVisible}
        onClose={() => setAdminModalVisible(false)}
        onSuccess={() => {
          setAdminModalVisible(false);
          navigation.navigate('Admin');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    marginRight: SPACING.md,
  },
  logo: {
    width: 100,
    height: 36,
  },
  searchContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  columnWrapper: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
