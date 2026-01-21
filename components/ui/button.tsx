/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * 
 * Usage:
 *   <Button variant="primary" size="md" onPress={() => {}}>
 *     Press me
 *   </Button>
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/theme';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
  };

  const variantTextStyles = {
    primary: { color: theme.colors.background },
    secondary: { color: theme.colors.text },
    outline: { color: theme.colors.primary },
    ghost: { color: theme.colors.primary },
    danger: { color: theme.colors.background },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      minHeight: 32,
    },
    md: {
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      minHeight: 44,
    },
    lg: {
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[6],
      minHeight: 52,
    },
  };

  const sizeTextStyles = {
    sm: { fontSize: theme.typography.fontSize.sm },
    md: { fontSize: theme.typography.fontSize.base },
    lg: { fontSize: theme.typography.fontSize.lg },
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={isDisabled || isLoading ? undefined : onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        (isDisabled || isLoading) && { opacity: theme.opacity.disabled },
        { borderRadius: theme.borderRadius.base },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variantTextStyles[variant].color}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantTextStyles[variant],
            sizeTextStyles[size],
            { fontWeight: theme.typography.fontWeight.semibold },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
