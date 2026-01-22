/**
 * Confirmation Dialog
 * 
 * Reusable confirmation/alert dialogs.
 * 
 * Usage:
 *   const result = await confirmDialog({
 *     title: 'Delete Item?',
 *     message: 'This action cannot be undone.',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *   });
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, Button } from './';
import { useTheme } from '@/theme';

export interface ConfirmDialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  dismissible?: boolean;
}

interface ConfirmDialogState {
  visible: boolean;
  options: ConfirmDialogOptions | null;
  resolve: ((value: boolean) => void) | null;
}

let dialogState: ConfirmDialogState = {
  visible: false,
  options: null,
  resolve: null,
};

let setDialogState: ((state: ConfirmDialogState) => void) | null = null;

/**
 * Show confirmation dialog
 */
export async function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    dialogState = {
      visible: true,
      options,
      resolve,
    };
    if (setDialogState) {
      setDialogState(dialogState);
    }
  });
}

/**
 * Alert dialog (simpler version)
 */
export async function alertDialog(title: string, message?: string): Promise<void> {
  return new Promise((resolve) => {
    dialogState = {
      visible: true,
      options: {
        title,
        message,
        confirmText: 'OK',
        cancelText: undefined,
        dismissible: true,
      },
      resolve: () => {
        resolve();
        return Promise.resolve();
      },
    };
    if (setDialogState) {
      setDialogState(dialogState);
    }
  });
}

/**
 * Confirmation Dialog Component
 * Add this to your root layout
 */
export function ConfirmDialogProvider() {
  const theme = useTheme();
  const [state, setState] = useState<ConfirmDialogState>(dialogState);

  // Register setState globally
  React.useEffect(() => {
    setDialogState = setState;
    return () => {
      setDialogState = null;
    };
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.options?.onConfirm) {
      await state.options.onConfirm();
    }
    if (state.resolve) {
      state.resolve(true);
    }
    setState({ visible: false, options: null, resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    if (state.options?.onCancel) {
      state.options.onCancel();
    }
    if (state.resolve) {
      state.resolve(false);
    }
    setState({ visible: false, options: null, resolve: null });
  }, [state]);

  const handleDismiss = useCallback(() => {
    if (state.options?.dismissible !== false) {
      handleCancel();
    }
  }, [state, handleCancel]);

  if (!state.visible || !state.options) {
    return null;
  }

  const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'primary' } = state.options;

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.dialog,
                {
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.borderRadius.xl,
                  ...theme.shadows.xl,
                },
              ]}
            >
              <Text variant="h3" style={{ marginBottom: theme.spacing[2] }}>
                {title}
              </Text>

              {message && (
                <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
                  {message}
                </Text>
              )}

              <View style={styles.actions}>
                {cancelText && (
                  <Button
                    variant="ghost"
                    onPress={handleCancel}
                    style={{ flex: 1, marginRight: theme.spacing[2] }}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  variant={confirmVariant}
                  onPress={handleConfirm}
                  style={{ flex: 1 }}
                >
                  {confirmText}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

/**
 * React hook for confirmation dialogs
 */
export function useConfirmDialog() {
  return {
    confirm: confirmDialog,
    alert: alertDialog,
  };
}
