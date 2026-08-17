import React, { useState, useEffect, memo } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { imageCache } from '../services/imageCache';
import { COLORS, RADIUS } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const CachedImage = memo(({ uri, style, resizeMode = 'cover', fallbackSource }) => {
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = () => {
      if (!uri) {
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
        return;
      }

      setLoading(true);
      setError(false);

      if (uri.startsWith('file://')) {
        if (isMounted) {
          setSource({ uri });
          setLoading(false);
        }
        return;
      }

      const localPath = imageCache.getLocalPath(uri);
      if (isMounted) {
        if (localPath) {
          setSource({ uri: localPath });
        } else {
          setSource({ uri });
        }
        // Image component's onLoad will set loading to false
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator color={COLORS.primary} size="small" />
        </View>
      )}
      
      {error || (!loading && !source) ? (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
        </View>
      ) : (
        source && (
          <Image
            source={source}
            style={[styles.image, style]}
            resizeMode={resizeMode}
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    zIndex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
  }
});

export default CachedImage;
