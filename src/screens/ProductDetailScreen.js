import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme';
import { isTablet } from '../utils/responsive';
import { api } from '../api/client';
import { syncService } from '../services/syncService';
import ProductCard from '../components/ProductCard';
import ImageCarousel from '../components/ImageCarousel';
import CachedImage from '../components/CachedImage';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, productName } = route.params;
  const tablet = isTablet();

  const [product, setProduct] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [lids, setLids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  useEffect(() => {
    async function fetchProductDetails() {
      setIsLoading(true);
      try {
        if (api && api.incrementView) {
          api.incrementView(productId).catch(() => {});
        }
        
        let details = null;
        try {
          if (api && api.getProduct) {
            details = await api.getProduct(productId);
          }
        } catch (apiErr) {
          console.log('Failed to fetch API');
        }

        if (!details) {
          const localData = await syncService.getLocalData();
          if (localData && localData.products) {
            const prod = localData.products.find(p => String(p.id) === String(productId));
            if (prod) {
              details = prod;
            }
          }
        }
        
        if (details) {
          const productData = details.data ? details.data : details;
          setProduct(productData);
          setSiblings(productData.siblings || []);
          setLids(productData.lids || []);
        }
      } catch (err) {} finally {
        setIsLoading(false);
      }
    }
    fetchProductDetails();
  }, [productId]);

  const carouselHeight = tablet ? 400 : 300;

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{productName}</Text>
      <View style={styles.backButton} style={{ backgroundColor: 'transparent' }} />
    </View>
  );

  const getTemperatureDescription = (temp) => {
    if (temp === 'hot') return 'يستخدم للمنتجات الساخنة';
    if (temp === 'cold') return 'يستخدم للمنتجات الباردة';
    if (temp === 'both') return 'يستخدم للمنتجات الساخنة والباردة معاً';
    return 'غير محدد';
  };

  const getTemperatureTitle = (temp) => {
    if (temp === 'hot') return 'ساخن';
    if (temp === 'cold') return 'بارد';
    if (temp === 'both') return 'ساخن وبارد';
    return 'غير محدد';
  };

  if (isLoading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!product) return <View style={styles.loadingCenter}><Text>بيانات غير متاحة</Text></View>;

  const SCREEN_WIDTH = Dimensions.get('window').width;
  
  let productImages = product?.images ? [...product.images] : (product?.image_url ? [{ url: product.image_url }] : []);
  // بناءً على طلبك: استبعاد آخر صورة من كل المنتجات إذا كان هناك أكثر من صورة
  if (productImages.length > 1) {
    productImages.pop();
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel 
          images={productImages} 
          height={carouselHeight} 
          onImagePress={(url, index) => setFullscreenIndex(index)}
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>{product.name}</Text>
          
          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>المقاس</Text>
            <Text style={styles.blockValue}>{product.size || 'غير محدد'}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>درجة الاستخدام ({getTemperatureTitle(product.temp)})</Text>
            <Text style={styles.blockValue}>{getTemperatureDescription(product.temp)}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>كود المنتج</Text>
            <Text style={styles.blockValue}>{product.code}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>فئة الخامة</Text>
            <Text style={styles.blockValue}>{product.material_category || 'غير محدد'}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>خامة تفصيلية</Text>
            <Text style={styles.blockValue}>{product.material_name || 'غير محدد'}</Text>
          </View>

          {product.notes && (
            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>ملاحظات</Text>
              <Text style={styles.blockValue}>{product.notes}</Text>
            </View>
          )}
        </View>

        {lids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الأغطية المتوافقة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {lids.map(item => (
                <View key={item.id} style={styles.horizontalCard}>
                  <ProductCard product={item} onPress={() => navigation.push('ProductDetail', { productId: item.id, productName: item.name })} width={200} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {siblings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مقاسات أخرى</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {siblings.map(item => (
                <View key={item.id} style={styles.horizontalCard}>
                  <ProductCard product={item} onPress={() => navigation.push('ProductDetail', { productId: item.id, productName: item.name })} width={200} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      {/* Fullscreen Swiping Image Modal */}
      <Modal visible={fullscreenIndex !== null} transparent={true} animationType="fade" onRequestClose={() => setFullscreenIndex(null)}>
        <View style={styles.modalBackground}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setFullscreenIndex(null)}>
              <Ionicons name="close" size={36} color="#FFF" />
            </TouchableOpacity>
            
            {fullscreenIndex !== null && (
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: fullscreenIndex * SCREEN_WIDTH, y: 0 }}
              >
                {productImages.map((img, idx) => (
                  <View key={idx} style={{ width: SCREEN_WIDTH, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <CachedImage uri={img.url} style={styles.fullscreenImage} resizeMode="contain" />
                  </View>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFCFB' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(232, 239, 234, 0.8)',
    ...SHADOWS.small,
    zIndex: 10
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: '#F0F4F2',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backButtonText: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: FONT_SIZES.lg, 
    fontWeight: '700', 
    color: COLORS.text,
    paddingHorizontal: SPACING.md
  },
  
  scrollContent: { paddingBottom: SPACING.xxl },
  
  contentContainer: { 
    padding: SPACING.xl, 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.md, 
    marginTop: -30, // Overlap effect
    borderRadius: RADIUS.lg, 
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: 'rgba(232, 239, 234, 0.5)',
  },
  mainTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: COLORS.text, 
    textAlign: 'right', 
    marginBottom: SPACING.xl, 
    lineHeight: 34
  },
  
  sectionBlock: { 
    marginBottom: SPACING.md, 
    paddingBottom: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F4F2' 
  },
  blockTitle: { 
    fontSize: FONT_SIZES.sm, 
    color: COLORS.textSecondary, 
    textAlign: 'right', 
    marginBottom: 6, 
    fontWeight: '500'
  },
  blockValue: { 
    fontSize: FONT_SIZES.md, 
    color: COLORS.text, 
    fontWeight: '700', 
    textAlign: 'right' 
  },
  
  section: { 
    marginTop: SPACING.xl 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: COLORS.text, 
    marginHorizontal: SPACING.lg, 
    marginBottom: SPACING.md, 
    textAlign: 'right' 
  },
  horizontalScroll: { 
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg, // Give room for shadows
  },
  horizontalCard: { 
    marginRight: SPACING.md 
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  }
});
