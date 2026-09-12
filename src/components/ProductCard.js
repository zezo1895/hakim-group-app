import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from './CachedImage';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';

const ProductCard = memo(({ product, onPress, width }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const imageUrl = product.images && product.images.length > 0
    ? [...product.images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.url
    : product.thumbnail || product.image_url || null;

  const getTemperatureText = (temp) => {
    if (temp === 'hot') return 'ساخن';
    if (temp === 'cold') return 'بارد';
    if (temp === 'both') return 'ساخن / بارد';
    return '';
  };

  const tempText = getTemperatureText(product.temp);

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress && onPress(product)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, width && { width }, { transform: [{ scale: scaleValue }] }]}>
        
        {/* Image Area */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <CachedImage uri={imageUrl} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.fallbackIcon}>
              <Ionicons name="cube-outline" size={60} color={COLORS.textLight} />
            </View>
          )}
          
          {/* Type Badge Floating */}
          {product.type_name && (
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{product.type_name}</Text>
            </View>
          )}
        </View>
        
        {/* Details Area */}
        <View style={styles.detailsContainer}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.code}>{product.code}</Text>
          
          {/* Elegant Badges */}
          <View style={styles.badgesRow}>
            {product.material_category && (
              <View style={[styles.badge, styles.materialBadge]}>
                <Text style={[styles.badgeText, styles.materialBadgeText]}>{product.material_category}</Text>
              </View>
            )}
            
            {tempText ? (
              <View style={[styles.badge, product.temp === 'hot' ? styles.hotBadge : product.temp === 'cold' ? styles.coldBadge : styles.bothBadge]}>
                <Text style={[styles.badgeText, product.temp === 'hot' ? styles.hotBadgeText : product.temp === 'cold' ? styles.coldBadgeText : styles.bothBadgeText]}>
                  {tempText}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: 'rgba(232, 239, 234, 0.5)', // Extremely subtle elegant border
    marginBottom: SPACING.md,
  },
  imageContainer: {
    width: '100%',
    height: 220, // Taller image container
    backgroundColor: '#FAFCFB',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 239, 234, 0.8)',
  },
  image: {
    width: '95%',  // Make image fill more space
    height: '95%',
  },
  fallbackIcon: {
    opacity: 0.15,
  },
  typeTag: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  typeTagText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 22,
  },
  code: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  badgesRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Material Badge (Elegant gray/green)
  materialBadge: {
    backgroundColor: '#F0F4F2',
    borderColor: '#E2EBE5',
  },
  materialBadgeText: {
    color: COLORS.textSecondary,
  },
  // Temperature Badges
  hotBadge: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEE2E2',
  },
  hotBadgeText: {
    color: '#E02424',
  },
  coldBadge: {
    backgroundColor: '#F0F7FF',
    borderColor: '#DBEAFE',
  },
  coldBadgeText: {
    color: '#1C64F2',
  },
  bothBadge: {
    backgroundColor: '#F5F3FF',
    borderColor: '#EDE9FE',
  },
  bothBadgeText: {
    color: '#6D28D9',
  }
});

export default ProductCard;
