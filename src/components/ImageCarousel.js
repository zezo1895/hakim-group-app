import React, { useState, useRef, memo } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from './CachedImage';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme';

const ImageCarousel = memo(({ images = [], height = 320, onImagePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(Dimensions.get('window').width);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { height }]}>
        <Ionicons name="image-outline" size={60} color={COLORS.border} />
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, { height }]}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: layoutWidth,
          offset: layoutWidth * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.95}
            style={[styles.slide, { width: layoutWidth, height }]}
            onPress={() => onImagePress && onImagePress(item.url, index)}
          >
            <CachedImage
              uri={item.url}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      />

      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {/* Elegant modern pill dots */}
          <View style={styles.dotsPill}>
            {images.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive && styles.activeDot
                  ]}
                />
              );
            })}
          </View>

          {/* Floating counter badge */}
          <View style={styles.counterBadge}>
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
    backgroundColor: '#F8FAF9',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholderContainer: {
    width: '100%',
    backgroundColor: '#F0F4F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 42, // Positioned safely above the overlapping detail sheet
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  dotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ImageCarousel;
