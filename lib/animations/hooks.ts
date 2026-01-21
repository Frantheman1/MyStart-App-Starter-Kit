/**
 * Animation Hooks
 * 
 * Easy-to-use animation hooks for common patterns.
 * 
 * Usage:
 *   const fadeAnim = useFadeIn({ duration: 300 });
 *   <Animated.View style={{ opacity: fadeAnim }}>
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

/**
 * Fade In Animation
 */
export function useFadeIn(config: AnimationConfig = {}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: config.duration || 300,
      delay: config.delay || 0,
      easing: config.easing || Easing.out(Easing.ease),
      useNativeDriver: config.useNativeDriver ?? true,
    }).start();
  }, []);

  return opacity;
}

/**
 * Slide In Animation (from direction)
 */
export function useSlideIn(
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  config: AnimationConfig = {}
) {
  const translateX = useRef(new Animated.Value(direction === 'left' ? -100 : direction === 'right' ? 100 : 0)).current;
  const translateY = useRef(new Animated.Value(direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0)).current;

  useEffect(() => {
    const animations = [];
    
    if (direction === 'left' || direction === 'right') {
      animations.push(
        Animated.timing(translateX, {
          toValue: 0,
          duration: config.duration || 400,
          delay: config.delay || 0,
          easing: config.easing || Easing.out(Easing.back(1.2)),
          useNativeDriver: config.useNativeDriver ?? true,
        })
      );
    }
    
    if (direction === 'top' || direction === 'bottom') {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration: config.duration || 400,
          delay: config.delay || 0,
          easing: config.easing || Easing.out(Easing.back(1.2)),
          useNativeDriver: config.useNativeDriver ?? true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, []);

  return { translateX, translateY };
}

/**
 * Scale In Animation (pop effect)
 */
export function useScaleIn(config: AnimationConfig = {}) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: config.delay || 0,
      tension: 50,
      friction: 7,
      useNativeDriver: config.useNativeDriver ?? true,
    }).start();
  }, []);

  return scale;
}

/**
 * Bounce Animation
 */
export function useBounce(config: AnimationConfig & { infinite?: boolean } = {}) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: config.duration || 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: config.useNativeDriver ?? true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: config.duration || 500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: config.useNativeDriver ?? true,
      }),
    ]);

    if (config.infinite) {
      Animated.loop(animation).start();
    } else {
      animation.start();
    }
  }, []);

  return bounceAnim;
}

/**
 * Pulse Animation (breathing effect)
 */
export function usePulse(config: AnimationConfig & { minScale?: number; maxScale?: number } = {}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: config.maxScale || 1.1,
          duration: config.duration || 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
        Animated.timing(pulse, {
          toValue: config.minScale || 0.95,
          duration: config.duration || 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
      ])
    ).start();
  }, []);

  return pulse;
}

/**
 * Shake Animation (for errors)
 */
export function useShake() {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return { shakeAnim, shake };
}

/**
 * Rotate Animation
 */
export function useRotate(config: AnimationConfig & { infinite?: boolean } = {}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: config.duration || 2000,
      easing: Easing.linear,
      useNativeDriver: config.useNativeDriver ?? true,
    });

    if (config.infinite) {
      Animated.loop(animation).start();
    } else {
      animation.start();
    }
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return spin;
}

/**
 * Wiggle Animation (attention grabber)
 */
export function useWiggle() {
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  const wiggle = () => {
    wiggleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wiggleAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(wiggleAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(wiggleAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
      Animated.timing(wiggleAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(wiggleAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const rotate = wiggleAnim.interpolate({
    inputRange: [-5, 5],
    outputRange: ['-5deg', '5deg'],
  });

  return { wiggleAnim, wiggle, rotate };
}

/**
 * Float Animation (hover effect)
 */
export function useFloat(config: AnimationConfig = {}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: config.duration || 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: config.duration || 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: config.useNativeDriver ?? true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return translateY;
}

/**
 * Stagger Children Animation
 */
export function useStagger(count: number, config: AnimationConfig = {}) {
  const animations = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const staggerTime = config.delay || 100;
    const animationList = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: config.duration || 300,
        delay: index * staggerTime,
        easing: config.easing || Easing.out(Easing.ease),
        useNativeDriver: config.useNativeDriver ?? true,
      })
    );

    Animated.parallel(animationList).start();
  }, []);

  return animations;
}
