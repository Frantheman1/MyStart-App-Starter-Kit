/**
 * Animation Utilities
 * 
 * Helper functions for complex animations.
 */

import { Animated, Easing } from 'react-native';

/**
 * Create a sequence of animations
 */
export function createSequence(animations: Animated.CompositeAnimation[]) {
  return Animated.sequence(animations);
}

/**
 * Create parallel animations
 */
export function createParallel(animations: Animated.CompositeAnimation[]) {
  return Animated.parallel(animations);
}

/**
 * Create a loop animation
 */
export function createLoop(animation: Animated.CompositeAnimation, iterations?: number) {
  return Animated.loop(animation, { iterations });
}

/**
 * Delay an animation
 */
export function delay(duration: number) {
  return Animated.delay(duration);
}

/**
 * Interpolate with common patterns
 */
export function interpolateRotation(animValue: Animated.Value, rotations: number = 1) {
  return animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * rotations}deg`],
  });
}

export function interpolateScale(animValue: Animated.Value, minScale: number = 0, maxScale: number = 1) {
  return animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [minScale, maxScale],
  });
}

export function interpolateTranslate(
  animValue: Animated.Value,
  from: number,
  to: number
) {
  return animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
}

export function interpolateOpacity(animValue: Animated.Value, minOpacity: number = 0, maxOpacity: number = 1) {
  return animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [minOpacity, maxOpacity],
  });
}

/**
 * Custom easing functions
 */
export const customEasing = {
  // Material Design standard
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  
  // Material Design decelerate
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  
  // Material Design accelerate
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  
  // iOS-like
  ios: Easing.bezier(0.42, 0, 0.58, 1),
  
  // Smooth
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
  
  // Bounce
  bounce: Easing.bounce,
  
  // Elastic
  elastic: Easing.elastic(1),
  
  // Sharp
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
};

/**
 * Spring presets
 */
export const springPresets = {
  gentle: { tension: 50, friction: 7 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 30, friction: 10 },
  bouncy: { tension: 300, friction: 10 },
};

/**
 * Create a spring animation
 */
export function createSpring(
  value: Animated.Value | Animated.ValueXY,
  toValue: number | { x: number; y: number },
  preset: keyof typeof springPresets = 'gentle'
) {
  return Animated.spring(value, {
    toValue,
    ...springPresets[preset],
    useNativeDriver: true,
  });
}

/**
 * Create a timing animation with preset
 */
export function createTiming(
  value: Animated.Value,
  toValue: number,
  duration: number = 300,
  easing: keyof typeof customEasing = 'standard'
) {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: customEasing[easing],
    useNativeDriver: true,
  });
}

/**
 * Animate value from current to target
 */
export function animateValue(
  value: Animated.Value,
  toValue: number,
  config?: {
    duration?: number;
    easing?: (value: number) => number;
    delay?: number;
    useNativeDriver?: boolean;
  }
) {
  return Animated.timing(value, {
    toValue,
    duration: config?.duration || 300,
    easing: config?.easing || Easing.out(Easing.ease),
    delay: config?.delay || 0,
    useNativeDriver: config?.useNativeDriver ?? true,
  });
}

/**
 * Create stagger animations
 */
export function createStagger(
  animations: Animated.CompositeAnimation[],
  staggerTime: number = 100
) {
  return Animated.stagger(staggerTime, animations);
}
