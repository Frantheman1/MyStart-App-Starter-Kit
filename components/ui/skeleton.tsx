/**
 * Skeleton Loader Component
 * 
 * Animated placeholder for loading states.
 * 
 * Usage:
 *   <Skeleton width={200} height={20} />
 *   <Skeleton variant="circle" size={50} />
 *   <Skeleton variant="rect" width="100%" height={100} />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number;
  size?: number; // For circle variant
  style?: ViewStyle;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  size,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const getSkeletonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.border,
    };

    switch (variant) {
      case 'circle':
        return {
          ...baseStyle,
          width: size || 50,
          height: size || 50,
          borderRadius: (size || 50) / 2,
        };
      case 'rect':
        return {
          ...baseStyle,
          width: width !== undefined ? width : '100%',
          height: height || 100,
          borderRadius: theme.borderRadius.base,
        } as ViewStyle;
      case 'text':
      default:
        return {
          ...baseStyle,
          width: width !== undefined ? width : 200,
          height: height || 16,
          borderRadius: theme.borderRadius.sm,
        } as ViewStyle;
    }
  };

  return (
    <Animated.View style={[getSkeletonStyle(), { opacity }, style]} />
  );
}

/**
 * Pre-built skeleton patterns
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const theme = useTheme();
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={16}
          style={{ marginBottom: theme.spacing[2] }}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[4],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton variant="circle" size={50} />
        <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: theme.spacing[1] }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <SkeletonText lines={3} />
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});
