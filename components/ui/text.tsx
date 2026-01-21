/**
 * Text Component
 * 
 * A themed text component with consistent typography.
 * 
 * Usage:
 *   <Text variant="h1">Heading</Text>
 *   <Text variant="body" color="secondary">Body text</Text>
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'body',
  color,
  weight,
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const theme = useTheme();

  const variantStyles = {
    h1: {
      fontSize: theme.typography.fontSize['4xl'],
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.bold,
    },
    h2: {
      fontSize: theme.typography.fontSize['3xl'],
      lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.bold,
    },
    h3: {
      fontSize: theme.typography.fontSize['2xl'],
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    h4: {
      fontSize: theme.typography.fontSize.xl,
      lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    bodyLarge: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    overline: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.medium,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
  };

  const colorStyles = {
    primary: { color: theme.colors.text },
    secondary: { color: theme.colors.textSecondary },
    tertiary: { color: theme.colors.textTertiary },
    error: { color: theme.colors.error },
    success: { color: theme.colors.success },
    warning: { color: theme.colors.warning },
  };

  const weightStyles = weight ? { fontWeight: theme.typography.fontWeight[weight] } : {};

  return (
    <RNText
      {...props}
      style={[
        styles.text,
        variantStyles[variant],
        color && colorStyles[color],
        weightStyles,
        { textAlign: align },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    // Default styles
  },
});
