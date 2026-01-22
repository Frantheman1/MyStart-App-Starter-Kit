/**
 * Keyboard Aware Components
 * 
 * Components that adjust when keyboard appears.
 */

import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useKeyboard, dismissKeyboard } from './keyboard';

export interface KeyboardAwareViewProps {
  children: ReactNode;
  style?: ViewStyle;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
}

/**
 * Keyboard avoiding view wrapper
 */
export function KeyboardAwareView({
  children,
  style,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
}: KeyboardAwareViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

/**
 * ScrollView that dismisses keyboard on scroll
 */
export interface KeyboardAwareScrollViewProps {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onScrollBeginDrag?: () => void;
  [key: string]: any;
}

export function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  onScrollBeginDrag,
  ...props
}: KeyboardAwareScrollViewProps) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      onScrollBeginDrag={() => {
        dismissKeyboard();
        onScrollBeginDrag?.();
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
