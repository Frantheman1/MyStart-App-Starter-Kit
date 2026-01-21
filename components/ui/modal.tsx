/**
 * Modal Component
 * 
 * A full-screen or centered modal overlay.
 * 
 * Usage:
 *   <Modal visible={isOpen} onClose={() => setIsOpen(false)}>
 *     <Text>Modal content</Text>
 *   </Modal>
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  ModalProps as RNModalProps,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  contentStyle?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  contentStyle,
  ...props
}: ModalProps) {
  const theme = useTheme();

  const sizeStyles = {
    sm: { maxWidth: 400 as const },
    md: { maxWidth: 500 as const },
    lg: { maxWidth: 700 as const },
    full: { maxWidth: '100%' as const, margin: 0 as const, borderRadius: 0 as const },
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      {...props}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={[
            styles.overlay,
            { backgroundColor: theme.colors.overlay },
          ]}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View
          style={[
            styles.content,
            {
              backgroundColor: theme.colors.card,
              borderRadius: theme.borderRadius.lg,
              margin: theme.spacing[4],
              ...theme.shadows.xl,
            },
            sizeStyles[size],
            contentStyle,
          ]}
        >
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  padding: theme.spacing[4],
                },
              ]}
            >
              {title && (
                <Text variant="h4" style={styles.title}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text variant="h3" color="tertiary">
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <ScrollView
            style={[styles.body, { padding: theme.spacing[4] }]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
  },
  body: {
    maxHeight: '80%',
  },
});
