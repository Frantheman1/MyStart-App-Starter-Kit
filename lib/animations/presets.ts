/**
 * Animation Presets
 * 
 * Pre-configured animations for common use cases.
 */

import { Easing } from 'react-native';
import { AnimationConfig } from './hooks';

/**
 * Quick animations (< 200ms)
 */
export const quickAnimation: AnimationConfig = {
  duration: 150,
  easing: Easing.out(Easing.ease),
  useNativeDriver: true,
};

/**
 * Standard animations (200-400ms)
 */
export const standardAnimation: AnimationConfig = {
  duration: 300,
  easing: Easing.out(Easing.ease),
  useNativeDriver: true,
};

/**
 * Slow animations (> 400ms)
 */
export const slowAnimation: AnimationConfig = {
  duration: 500,
  easing: Easing.out(Easing.ease),
  useNativeDriver: true,
};

/**
 * Bouncy entrance
 */
export const bouncyEntrance: AnimationConfig = {
  duration: 400,
  easing: Easing.out(Easing.back(1.5)),
  useNativeDriver: true,
};

/**
 * Smooth entrance
 */
export const smoothEntrance: AnimationConfig = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  useNativeDriver: true,
};

/**
 * Elastic bounce
 */
export const elasticBounce: AnimationConfig = {
  duration: 600,
  easing: Easing.elastic(2),
  useNativeDriver: true,
};

/**
 * Sharp snap
 */
export const sharpSnap: AnimationConfig = {
  duration: 200,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};

/**
 * Gentle float
 */
export const gentleFloat: AnimationConfig = {
  duration: 2000,
  easing: Easing.inOut(Easing.sin),
  useNativeDriver: true,
};

/**
 * Button press (scale down)
 */
export const buttonPress = {
  scale: 0.95,
  duration: 100,
  easing: Easing.out(Easing.ease),
};

/**
 * Card tap (subtle scale)
 */
export const cardTap = {
  scale: 0.98,
  duration: 150,
  easing: Easing.out(Easing.ease),
};

/**
 * Modal entrance
 */
export const modalEntrance: AnimationConfig = {
  duration: 400,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
  useNativeDriver: true,
};

/**
 * Page transition
 */
export const pageTransition: AnimationConfig = {
  duration: 350,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
  useNativeDriver: true,
};

/**
 * Notification slide
 */
export const notificationSlide: AnimationConfig = {
  duration: 300,
  easing: Easing.out(Easing.back(1)),
  useNativeDriver: true,
};

/**
 * Attention seeker (pulse + scale)
 */
export const attentionSeeker: AnimationConfig = {
  duration: 500,
  easing: Easing.inOut(Easing.ease),
  useNativeDriver: true,
};
