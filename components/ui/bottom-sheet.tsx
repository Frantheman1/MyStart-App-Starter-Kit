/**
 * Bottom Sheet Component
 * 
 * A popular mobile pattern for slide-up panels.
 * 
 * Usage:
 *   <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)}>
 *     <Text>Sheet content</Text>
 *   </BottomSheet>
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Heights as percentages (e.g., [0.3, 0.6, 0.9])
  closeOnDragDown?: boolean;
  closeOnPressBackdrop?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [0.5], // Default: 50% of screen height
  closeOnDragDown = true,
  closeOnPressBackdrop = true,
}: BottomSheetProps) {
  const theme = useTheme();
  const [translateY] = React.useState(new Animated.Value(SCREEN_HEIGHT));
  const [backdropOpacity] = React.useState(new Animated.Value(0));

  const maxHeight = SCREEN_HEIGHT * Math.max(...snapPoints);

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const openSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => closeOnDragDown,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5 && closeOnDragDown;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > maxHeight * 0.3) {
        onClose();
      } else {
        openSheet();
      }
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeOnPressBackdrop ? onClose : undefined}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.colors.overlay,
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: theme.borderRadius.xl,
              borderTopRightRadius: theme.borderRadius.xl,
              maxHeight,
              transform: [{ translateY }],
              ...theme.shadows.xl,
            },
          ]}
        >
          {/* Drag Handle */}
          {closeOnDragDown && (
            <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});
