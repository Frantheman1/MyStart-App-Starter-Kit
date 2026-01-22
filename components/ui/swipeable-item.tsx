/**
 * Swipeable List Item
 * 
 * Swipe to reveal actions (delete, edit, etc.)
 * 
 * Usage:
 *   <SwipeableItem
 *     onSwipeLeft={() => console.log('Swiped left')}
 *     leftActions={<Button>Delete</Button>}
 *   >
 *     <YourContent />
 *   </SwipeableItem>
 */

import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SwipeableItemProps {
  children: React.ReactNode;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeComplete?: () => void;
  swipeThreshold?: number;
  style?: ViewStyle;
}

export function SwipeableItem({
  children,
  leftActions,
  rightActions,
  onSwipeLeft,
  onSwipeRight,
  onSwipeComplete,
  swipeThreshold = 100,
  style,
}: SwipeableItemProps) {
  const theme = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        const shouldSwipeLeft = dx < -swipeThreshold && leftActions;
        const shouldSwipeRight = dx > swipeThreshold && rightActions;

        if (shouldSwipeLeft) {
          Animated.spring(translateX, {
            toValue: -SCREEN_WIDTH * 0.3,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          onSwipeLeft?.();
          onSwipeComplete?.();
        } else if (shouldSwipeRight) {
          Animated.spring(translateX, {
            toValue: SCREEN_WIDTH * 0.3,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          onSwipeRight?.();
          onSwipeComplete?.();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const leftActionsWidth = leftActions ? SCREEN_WIDTH * 0.3 : 0;
  const rightActionsWidth = rightActions ? SCREEN_WIDTH * 0.3 : 0;

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {/* Background Actions */}
      <View style={styles.actionsContainer}>
        {leftActions && (
          <Animated.View
            style={[
              styles.leftActions,
              {
                width: leftActionsWidth,
                opacity: translateX.interpolate({
                  inputRange: [-leftActionsWidth, 0],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            {leftActions}
          </Animated.View>
        )}
        {rightActions && (
          <Animated.View
            style={[
              styles.rightActions,
              {
                width: rightActionsWidth,
                opacity: translateX.interpolate({
                  inputRange: [0, rightActionsWidth],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            {rightActions}
          </Animated.View>
        )}
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.card,
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 4,
  },
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftActions: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  rightActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    marginLeft: 'auto',
  },
  content: {
    padding: 16,
    borderRadius: 8,
  },
});
