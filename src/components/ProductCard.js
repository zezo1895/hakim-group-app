import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from './CachedImage';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';

const ProductCard = memo(({ product, onPress, width }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
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
    : null;

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress && onPress(product)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, width && { width }, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <CachedImage uri={imageUrl} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
            </View>
          )}
          {product.type_name && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.type_name}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.code}>{product.code}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: SPACING.md,
    alignItems: 'flex-end',
  },
  name: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  code: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'right',
  },
});

export default ProductCard;
