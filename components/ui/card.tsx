/**
 * Card Component
 * 
 * A container component with elevation/shadow for grouping content.
 * 
 * Usage:
 *   <Card>
 *     <Text>Card content</Text>
 *   </Card>
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof import('@/theme').spacing;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 4,
  children,
  style,
  ...props
}: CardProps) {
  const theme = useTheme();

  const variantStyles = {
    elevated: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.base,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.surface,
      borderWidth: 0,
    },
  };

  return (
    <View
      {...props}
      style={[
        styles.card,
        variantStyles[variant],
        {
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
