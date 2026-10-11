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
import { useLanguage } from '../i18n';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, productName } = route.params;
  const { t, getProductField, translateMaterial, translateSize, isRTL } = useLanguage();
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

  const windowDim = Dimensions.get('window');
  const carouselHeight = Math.min(Math.max(windowDim.height * 0.48, 360), 550);

  const currentProductName = product ? getProductField(product, 'name', 'name_en') : productName;

  const renderHeader = () => (
    <View style={[styles.header, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={COLORS.primary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{currentProductName}</Text>
      <View style={[styles.backButton, { backgroundColor: 'transparent' }]} />
    </View>
  );

  const getTemperatureDescription = (temp) => {
    if (temp === 'hot') return t('hotDescription');
    if (temp === 'cold') return t('coldDescription');
    if (temp === 'both') return t('bothDescription');
    return t('notSpecified');
  };

  const getTemperatureTitle = (temp) => {
    if (temp === 'hot') return t('hot');
    if (temp === 'cold') return t('cold');
    if (temp === 'both') return t('hotAndCold');
    return t('notSpecified');
  };

  if (isLoading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!product) return <View style={styles.loadingCenter}><Text>{t('dataNotAvailable')}</Text></View>;

  const SCREEN_WIDTH = Dimensions.get('window').width;
  
  let productImages = product?.images ? [...product.images] : (product?.image_url ? [{ url: product.image_url }] : []);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel 
          images={productImages} 
          height={carouselHeight} 
          onImagePress={(url, index) => setFullscreenIndex(index)}
        />
        
        <View style={[
          styles.contentContainer, 
          { 
            alignItems: isRTL ? 'flex-start' : 'flex-end',
          }
        ]}>
          <Text style={[
            styles.mainTitle, 
            { 
              textAlign: isRTL ? 'right' : 'left', 
              writingDirection: isRTL ? 'rtl' : 'ltr',
              alignSelf: isRTL ? 'flex-start' : 'flex-end', 
              width: '100%' 
            }
          ]}>
            {getProductField(product, 'name', 'name_en')}
          </Text>
          
          <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
            <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {t('size')}
            </Text>
            <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {translateSize(product.size) || t('notSpecified')}
            </Text>
          </View>

          <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
            <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {t('temperature')} ({getTemperatureTitle(product.temp)})
            </Text>
            <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {getTemperatureDescription(product.temp)}
            </Text>
          </View>

          <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
            <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {t('productCode')}
            </Text>
            <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {product.code}
            </Text>
          </View>

          <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
            <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {t('materialCategory')}
            </Text>
            <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {translateMaterial(product.material_category) || t('notSpecified')}
            </Text>
          </View>

          <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
            <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {t('materialDetail')}
            </Text>
            <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {translateMaterial(product.material_name) || t('notSpecified')}
            </Text>
          </View>

          {product.notes && (
            <View style={[styles.sectionBlock, { alignItems: isRTL ? 'flex-start' : 'flex-end', width: '100%' }]}>
              <Text style={[styles.blockTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                {t('notes')}
              </Text>
              <Text style={[styles.blockValue, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                {product.notes}
              </Text>
            </View>
          )}
        </View>

        {lids.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('compatibleLids')}</Text>
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
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('otherSizes')}</Text>
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
    marginBottom: 6, 
    fontWeight: '500'
  },
  blockValue: { 
    fontSize: FONT_SIZES.md, 
    color: COLORS.text, 
    fontWeight: '700', 
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
