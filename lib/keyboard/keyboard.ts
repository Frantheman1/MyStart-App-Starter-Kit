/**
 * Keyboard Utilities
 * 
 * Handle keyboard show/hide, dismiss on scroll, and keyboard-aware components.
 * 
 * Usage:
 *   import { useKeyboard } from '@/lib/keyboard';
 *   const { isVisible, height } = useKeyboard();
 */

import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';
import { logger } from '@/lib/logging/logger';

export interface KeyboardState {
  isVisible: boolean;
  height: number;
}

/**
 * Hook to track keyboard visibility and height
 */
export function useKeyboard(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardState({
          isVisible: true,
          height: event.endCoordinates.height,
        });
        logger.debug('Keyboard shown', { height: event.endCoordinates.height });
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardState({
          isVisible: false,
          height: 0,
        });
        logger.debug('Keyboard hidden');
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardState;
}

/**
 * Dismiss keyboard
 */
export function dismissKeyboard(): void {
  Keyboard.dismiss();
  logger.debug('Keyboard dismissed');
}

/**
 * Hook that dismisses keyboard on scroll
 */
export function useDismissKeyboardOnScroll() {
  return {
    onScrollBeginDrag: () => {
      dismissKeyboard();
    },
  };
}

/**
 * Hook that dismisses keyboard on press outside
 */
export function useDismissKeyboardOnPress() {
  return {
    onPress: () => {
      dismissKeyboard();
    },
  };
}
