import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SyncProgress = memo(({ progress = 0, message = '', stage = '' }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  // Circle configuration
  const size = 220;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  // Interpolate the progress value to dashoffset
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      
      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/app-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandNameArabic}>حكيم جروب</Text>
      </View>

      {/* Circular Progress Area */}
      <View style={styles.progressSection}>
        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              stroke={COLORS.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Animated Progress Circle */}
            <AnimatedCircle
              stroke={COLORS.primary}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              originX={size / 2}
              originY={size / 2}
            />
          </Svg>
          
          {/* Percentage Text in center of circle */}
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
        
        {/* Shadow effect behind circle (optional, based on design) */}
        <View style={styles.circleShadow} />
      </View>

      {/* Status Texts below circle */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>Syncing Data Status</Text>
        <Text style={styles.messageText}>{message || 'جاري مزامنة البيانات...'}</Text>
      </View>

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFB', // Very subtle off-white to make it less plain
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  brandNameArabic: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary, // Assuming Hakim Blue is secondary
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 42,
    fontWeight: '300', // Light font weight for elegance
    color: COLORS.primary, // Hakim Green
  },
  circleShadow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 18,
    color: '#8A9A90', // Elegant grayish green
  },
});

export default SyncProgress;
