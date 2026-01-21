/**
 * Theme Configuration
 * 
 * Combines design tokens into light and dark themes.
 * 
 * Usage:
 *   import { useTheme } from '@/theme';
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }} />
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, typography, spacing, borderRadius, shadows, opacity } from './tokens';

export type Theme = {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    error: string;
    errorLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    overlay: string;
  };
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  opacity: typeof opacity;
};

export const lightTheme: Theme = {
  colors: {
    primary: colors.primary[500],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[700],
    background: colors.neutral[0],
    surface: colors.neutral[50],
    card: colors.neutral[0],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    textTertiary: colors.neutral[400],
    border: colors.neutral[200],
    borderLight: colors.neutral[100],
    error: colors.error.main,
    errorLight: colors.error.light,
    success: colors.success.main,
    successLight: colors.success.light,
    warning: colors.warning.main,
    warningLight: colors.warning.light,
    info: colors.info.main,
    infoLight: colors.info.light,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  opacity,
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.primary[400],
    primaryLight: colors.primary[800],
    primaryDark: colors.primary[300],
    background: colors.neutral[950],
    surface: colors.neutral[900],
    card: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[300],
    textTertiary: colors.neutral[500],
    border: colors.neutral[700],
    borderLight: colors.neutral[800],
    error: colors.error.light,
    errorLight: colors.error.main,
    success: colors.success.light,
    successLight: colors.success.main,
    warning: colors.warning.light,
    warningLight: colors.warning.main,
    info: colors.info.light,
    infoLight: colors.info.main,
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  opacity,
};

// Hook to get the current theme
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
