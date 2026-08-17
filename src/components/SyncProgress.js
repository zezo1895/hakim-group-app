import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';

const SyncProgress = memo(({ progress = 0, message = '', stage = '' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);

  const widthInterpolation = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressFill, { width: widthInterpolation }]} />
        </View>

        <Text style={styles.percentageText}>
          {Math.round(progress * 100)}%
        </Text>
        
        <Text style={styles.messageText}>{message || 'جاري تحميل البيانات...'}</Text>
        {stage ? <Text style={styles.stageText}>{stage}</Text> : null}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  percentageText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  stageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default SyncProgress;
