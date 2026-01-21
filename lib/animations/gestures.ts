/**
 * Gesture-based Animations
 * 
 * Animations triggered by user gestures.
 */

import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

/**
 * Swipeable hook (swipe to dismiss)
 */
export function useSwipeable(onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const threshold = 50;

        // Determine swipe direction
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          // Horizontal swipe
          if (Math.abs(gesture.dx) > threshold) {
            onSwipe?.(gesture.dx > 0 ? 'right' : 'left');
          }
        } else {
          // Vertical swipe
          if (Math.abs(gesture.dy) > threshold) {
            onSwipe?.(gesture.dy > 0 ? 'down' : 'up');
          }
        }

        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return { pan, panResponder };
}

/**
 * Draggable hook
 */
export function useDraggable(onDragEnd?: (x: number, y: number) => void) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        onDragEnd?.(gesture.moveX, gesture.moveY);
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  return { pan, panResponder, resetPosition };
}

/**
 * Press animation hook (scale down on press)
 */
export function usePressAnimation(scale: number = 0.95) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return { scaleAnim, animateIn, animateOut };
}

/**
 * Long press animation (continuous scale)
 */
export function useLongPressAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }),
    ]).start();
  };

  const resetAnimation = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return { scaleAnim, startAnimation, resetAnimation };
}
