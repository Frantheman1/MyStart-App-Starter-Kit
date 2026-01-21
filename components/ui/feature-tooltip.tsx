/**
 * Feature Discovery Tooltip
 * 
 * Highlights a feature with an animated tooltip.
 * Perfect for "what's new" or feature announcements.
 * 
 * Usage:
 *   <FeatureTooltip
 *     visible={showTooltip}
 *     title="New Feature!"
 *     description="Check this out"
 *     onDismiss={() => setShowTooltip(false)}
 *   >
 *     <YourComponent />
 *   </FeatureTooltip>
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Text, Button } from './';
import { useTheme } from '@/theme';

export interface FeatureTooltipProps {
  visible: boolean;
  title: string;
  description: string;
  onDismiss: () => void;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: ViewStyle;
}

export function FeatureTooltip({
  visible,
  title,
  description,
  onDismiss,
  children,
  position = 'top',
  style,
}: FeatureTooltipProps) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, pulseAnim, fadeAnim]);

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Highlighted Element with Pulse */}
      <Animated.View
        style={[
          styles.highlightedElement,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltip,
          getTooltipPositionStyle(position),
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadows.xl,
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={[styles.tooltipContent, { padding: theme.spacing[3] }]}>
          <Text variant="h4" style={{ marginBottom: theme.spacing[1] }}>
            {title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            {description}
          </Text>
          <Button variant="primary" size="sm" onPress={onDismiss} fullWidth>
            Got it!
          </Button>
        </View>

        {/* Arrow */}
        <View style={[styles.arrow, getArrowStyle(position, theme.colors.card)]} />
      </Animated.View>
    </View>
  );
}

function getTooltipPositionStyle(position: 'top' | 'bottom' | 'left' | 'right'): ViewStyle {
  switch (position) {
    case 'top':
      return { bottom: '110%', alignSelf: 'center' };
    case 'bottom':
      return { top: '110%', alignSelf: 'center' };
    case 'left':
      return { right: '110%', alignSelf: 'center' };
    case 'right':
      return { left: '110%', alignSelf: 'center' };
  }
}

function getArrowStyle(position: 'top' | 'bottom' | 'left' | 'right', color: string): ViewStyle {
  const baseStyle = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderStyle: 'solid' as const,
  };

  switch (position) {
    case 'top':
      return {
        ...baseStyle,
        bottom: -8,
        alignSelf: 'center',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
      };
    case 'bottom':
      return {
        ...baseStyle,
        top: -8,
        alignSelf: 'center',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      };
    default:
      return baseStyle;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  highlightedElement: {
    // Element will pulse
  },
  tooltip: {
    position: 'absolute',
    maxWidth: 280,
    zIndex: 9999,
  },
  tooltipContent: {
    // Padding applied via theme
  },
  arrow: {
    // Position and style set dynamically
  },
});
