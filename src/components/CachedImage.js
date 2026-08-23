import React, { useState, memo } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { imageCache } from '../services/imageCache';
import { COLORS, RADIUS } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const CachedImage = memo(({ uri, style, resizeMode = 'cover', fallbackSource }) => {
  // 1. Resolve path instantly without useEffect delay!
  let resolvedUri = uri;
  if (uri && !uri.startsWith('file://')) {
    const localPath = imageCache.getLocalPath(uri);
    if (localPath) {
      resolvedUri = localPath;
    }
  }

  const [loading, setLoading] = useState(!!resolvedUri);
  const [error, setError] = useState(!resolvedUri);

  return (
    <View style={[styles.container, style]}>
      {loading && !error && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator color={COLORS.primary} size="small" />
        </View>
      )}
      
      {error || !resolvedUri ? (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
        </View>
      ) : (
        <Image
          source={{ uri: resolvedUri }}
          style={styles.image}
          resizeMode={resizeMode}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          fadeDuration={0} // Disable fade animation for instant snap-in
        />
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
