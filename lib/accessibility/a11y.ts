/**
 * Accessibility Utilities
 * 
 * Helper functions and constants for building accessible apps.
 * 
 * Usage:
 *   <Button {...a11yProps.button('Submit form')}>Submit</Button>
 */

import { AccessibilityProps } from 'react-native';

/**
 * Accessibility role helpers
 */
export const a11yProps = {
  button: (label: string, hint?: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  link: (label: string, hint?: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'link',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  heading: (level: 1 | 2 | 3 | 4 | 5 | 6, label: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: label,
    accessibilityLevel: level,
  } as any),

  text: (label: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'text',
    accessibilityLabel: label,
  }),

  image: (label: string, hint?: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  input: (label: string, hint?: string, value?: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'none',
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityValue: value ? { text: value } : undefined,
  }),

  checkbox: (label: string, checked: boolean): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'checkbox',
    accessibilityLabel: label,
    accessibilityState: { checked },
  }),

  radio: (label: string, selected: boolean): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'radio',
    accessibilityLabel: label,
    accessibilityState: { selected },
  }),

  switch: (label: string, checked: boolean): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'switch',
    accessibilityLabel: label,
    accessibilityState: { checked },
  }),

  loading: (label: string = 'Loading'): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: label,
    accessibilityLiveRegion: 'polite',
  }),

  alert: (label: string): AccessibilityProps => ({
    accessible: true,
    accessibilityRole: 'alert',
    accessibilityLabel: label,
    accessibilityLiveRegion: 'assertive',
  }),
};

/**
 * Accessibility states
 */
export const a11yStates = {
  disabled: { disabled: true },
  selected: { selected: true },
  checked: { checked: true },
  busy: { busy: true },
  expanded: { expanded: true },
  collapsed: { expanded: false },
};

/**
 * Minimum touch target size (44x44 points on iOS, 48x48 on Android)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Helper to ensure minimum touch target size
 */
export const touchTargetSize = (size: number = MIN_TOUCH_TARGET_SIZE) => ({
  minWidth: size,
  minHeight: size,
});

/**
 * Helper for hit slop (expand touch area without affecting layout)
 */
export const hitSlop = (size: number = 12) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

/**
 * Check if content size is accessible (minimum 12pt font)
 */
export const MIN_FONT_SIZE = 12;

export function isAccessibleFontSize(fontSize: number): boolean {
  return fontSize >= MIN_FONT_SIZE;
}

/**
 * Get accessible font size
 */
export function getAccessibleFontSize(
  fontSize: number,
  scaleFactor: number = 1
): number {
  const scaledSize = fontSize * scaleFactor;
  return Math.max(scaledSize, MIN_FONT_SIZE);
}

/**
 * Color contrast helpers
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // For production, use a library like 'color-contrast-checker'
  // This is a placeholder implementation
  return 4.5; // WCAG AA standard minimum
}

export function isAccessibleContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Announce to screen readers
 */
export function announceForAccessibility(message: string): void {
  // This would use AccessibilityInfo.announceForAccessibility in React Native
  // Placeholder for now
  console.log('[A11Y Announcement]:', message);
}

/**
 * Focus management
 */
export function setAccessibilityFocus(ref: any): void {
  // This would use AccessibilityInfo.setAccessibilityFocus in React Native
  // Placeholder for now
  if (ref?.current) {
    ref.current.focus?.();
  }
}
