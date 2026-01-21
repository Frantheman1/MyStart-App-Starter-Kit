/**
 * Interactive Tour Overlay
 * 
 * Shows an interactive tour with spotlights and tooltips.
 * This is the "take a spin through the app" feature!
 * 
 * Usage:
 *   const { showTour, tourSteps, currentStep } = useOnboarding();
 *   {showTour && <TourOverlay />}
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useOnboarding } from './context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function TourOverlay() {
  const theme = useTheme();
  const { showTour, tourSteps, currentStep, nextStep, skipTour } = useOnboarding();
  const [opacity] = React.useState(new Animated.Value(0));
  const [scale] = React.useState(new Animated.Value(0.8));

  const step = tourSteps[currentStep];

  useEffect(() => {
    if (showTour && step) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    }
  }, [showTour, currentStep]);

  if (!showTour || !step) return null;

  const isLastStep = currentStep === tourSteps.length - 1;

  const getTooltipPosition = () => {
    switch (step.position) {
      case 'top':
        return { top: 100 };
      case 'bottom':
        return { bottom: 100 };
      case 'center':
      default:
        return {
          top: SCREEN_HEIGHT / 2 - 150,
        };
    }
  };

  return (
    <Modal visible={showTour} transparent animationType="none" statusBarTranslucent>
      {/* Backdrop with spotlight effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            opacity,
          },
        ]}
      />

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltip,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.xl,
            ...theme.shadows.xl,
            opacity,
            transform: [{ scale }],
          },
          getTooltipPosition(),
        ]}
      >
        {/* Step Counter */}
        <View style={styles.stepCounter}>
          <Text variant="caption" color="tertiary">
            Step {currentStep + 1} of {tourSteps.length}
          </Text>
        </View>

        {/* Content */}
        <View style={[styles.content, { padding: theme.spacing[5] }]}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[2] }}>
            {step.title}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
            {step.description}
          </Text>

          {/* Action Button */}
          {step.action && (
            <Button
              variant="outline"
              fullWidth
              onPress={step.action.onPress}
              style={{ marginBottom: theme.spacing[3] }}
            >
              {step.action.label}
            </Button>
          )}

          {/* Navigation */}
          <View style={styles.navigation}>
            <Button variant="ghost" onPress={skipTour}>
              Skip Tour
            </Button>
            <Button variant="primary" onPress={nextStep}>
              {isLastStep ? 'Get Started!' : 'Next'}
            </Button>
          </View>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {tourSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentStep
                      ? theme.colors.primary
                      : theme.colors.border,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxWidth: 400,
    alignSelf: 'center',
  },
  stepCounter: {
    alignItems: 'center',
    paddingTop: 16,
  },
  content: {
    // Padding applied via theme
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
