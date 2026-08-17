import React, { useState, memo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from './CachedImage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../theme';
import { isTablet } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImageCarousel = memo(({ images = [], height = 300 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const carouselWidth = isTablet() ? SCREEN_WIDTH * 0.6 : SCREEN_WIDTH;

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { height }]}>
        <Ionicons name="image-outline" size={60} color={COLORS.border} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: carouselWidth * images.length }}
        inverted
      >
        {images.map((img, index) => (
          <View key={index} style={{ width: carouselWidth, height }}>
            <CachedImage 
              uri={img.url} 
              style={styles.image} 
              resizeMode="contain" 
            />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  placeholderContainer: {
    width: '100%',
    backgroundColor: COLORS.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  dotsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  counterContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  counterText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  }
});

export default ImageCarousel;
