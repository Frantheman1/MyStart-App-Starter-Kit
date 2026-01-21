/**
 * Loader Component
 * 
 * Loading indicators with different sizes and variants.
 * 
 * Usage:
 *   <Loader size="lg" />
 *   <Loader fullScreen text="Loading..." />
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  text?: string;
  style?: ViewStyle;
}

export function Loader({
  size = 'md',
  color,
  fullScreen = false,
  text,
  style,
}: LoaderProps) {
  const theme = useTheme();

  const sizeMap = {
    sm: 'small' as const,
    md: 'large' as const,
    lg: 'large' as const,
  };

  const loaderColor = color || theme.colors.primary;

  const content = (
    <View style={[styles.content, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={sizeMap[size]} color={loaderColor} />
      {text && (
        <Text
          variant="body"
          color="secondary"
          style={{ marginTop: theme.spacing[2] }}
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreenContainer,
          { backgroundColor: theme.colors.background },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  fullScreen: {
    // Additional styles for full screen mode
  },
});
