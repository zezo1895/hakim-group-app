import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';
import { isTablet } from '../utils/responsive';
import { api } from '../api/client';
import { syncService } from '../services/syncService';
import ImageCarousel from '../components/ImageCarousel';
import ProductCard from '../components/ProductCard';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, productName } = route.params;
  const { width: windowWidth } = useWindowDimensions();
  const tablet = isTablet(windowWidth);
  
  const [product, setProduct] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [lids, setLids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          console.log('Failed to fetch from API, trying local data', apiErr);
        }

        if (!details) {
          const localData = await syncService.getLocalData();
          if (localData && localData.products) {
            const prod = localData.products.find(p => String(p.id) === String(productId));
            if (prod) {
              details = { data: prod };
            }
          }
        }
        
        if (details && details.data) {
          setProduct(details.data);
          setSiblings(details.data.siblings || []);
          setLids(details.data.lids || []);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [productId]);

  const carouselHeight = tablet ? 400 : 300;

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{productName}</Text>
      <View style={styles.backButton} />
    </View>
  );

  const getTemperatureText = (temp) => {
    if (temp === 'hot') return 'ساخن';
    if (temp === 'cold') return 'بارد';
    if (temp === 'both') return 'ساخن وبارد';
    return temp || 'غير محدد';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {renderHeader()}
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {renderHeader()}
        <View style={styles.loadingCenter}>
          <Text style={styles.errorText}>تعذر تحميل تفاصيل المنتج</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel images={product.images || [{ url: product.image_url }]} height={carouselHeight} />
        
        <View style={[styles.infoCard, SHADOWS.medium]}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.code && (
             <View style={styles.badge}>
               <Text style={styles.badgeText}>{product.code}</Text>
             </View>
          )}
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>النوع:</Text>
              <Text style={styles.detailValue}>{product.type_name || 'غير محدد'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>الخامة:</Text>
              <Text style={styles.detailValue}>{product.material_name || 'غير محدد'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>المقاس:</Text>
              <Text style={styles.detailValue}>{product.size || 'غير محدد'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>الاستخدام:</Text>
              <Text style={styles.detailValue}>{getTemperatureText(product.temperature)}</Text>
            </View>
          </View>

          {product.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>ملاحظات:</Text>
              <Text style={styles.notesText}>{product.notes}</Text>
            </View>
          )}
        </View>

        {siblings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مقاسات أخرى</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {siblings.map(item => (
                <View key={item.id} style={styles.horizontalCard}>
                  <ProductCard 
                    product={item} 
                    onPress={() => navigation.push('ProductDetail', { productId: item.id, productName: item.name })} 
                    width={150} 
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {lids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الأغطية المتوافقة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {lids.map(item => (
                <View key={item.id} style={styles.horizontalCard}>
                  <ProductCard 
                    product={item} 
                    onPress={() => navigation.push('ProductDetail', { productId: item.id, productName: item.name })} 
                    width={150} 
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: FONT_SIZES.md, color: COLORS.error },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  scrollContent: { paddingBottom: SPACING.xxl },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  productName: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'right', writingDirection: 'rtl' },
  badge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.md,
  },
  badgeText: { color: COLORS.primary, fontWeight: 'bold', fontSize: FONT_SIZES.sm },
  detailsContainer: { marginTop: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  detailLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, fontWeight: 'bold', textAlign: 'right', writingDirection: 'rtl' },
  detailValue: { fontSize: FONT_SIZES.md, color: COLORS.text, textAlign: 'left' },
  notesContainer: { marginTop: SPACING.lg, padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md },
  notesTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'right', writingDirection: 'rtl' },
  notesText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'right', writingDirection: 'rtl' },
  section: { marginTop: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, textAlign: 'right', writingDirection: 'rtl' },
  horizontalScroll: { paddingHorizontal: SPACING.md },
  horizontalCard: { marginRight: SPACING.md },
});
