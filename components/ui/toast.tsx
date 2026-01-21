/**
 * Toast Component & Hook
 * 
 * A toast notification system with context provider.
 * 
 * Usage:
 *   // Wrap app with ToastProvider in _layout.tsx
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 * 
 *   // Use in components
 *   const { showToast } = useToast();
 *   showToast({ message: 'Success!', type: 'success' });
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Text as RNText,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [toast, setToast] = useState<(ToastConfig & { id: number }) | null>(null);
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now();
    setToast({ ...config, id });

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    const duration = config.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opacity, translateY]);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
      translateY.setValue(-100);
    });
  }, [opacity, translateY, setToast]);

  const getToastColor = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.info;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity,
              transform: [{ translateY }],
              backgroundColor: getToastColor(toast.type),
              ...theme.shadows.lg,
              borderRadius: theme.borderRadius.base,
              margin: theme.spacing[4],
              padding: theme.spacing[3],
              top: Platform.OS === 'ios' ? 50 : 20,
            },
          ]}
        >
          <RNText
            style={[
              styles.message,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.fontSize.base,
                flex: 1,
              },
            ]}
          >
            {toast.message}
          </RNText>
          
          {toast.action && (
            <TouchableOpacity
              onPress={() => {
                toast.action?.onPress();
                hideToast();
              }}
              style={styles.actionButton}
            >
              <RNText style={[styles.actionText, { color: '#FFFFFF' }]}>
                {toast.action.label}
              </RNText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RNText style={[styles.closeText, { color: '#FFFFFF' }]}>×</RNText>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  message: {
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  actionText: {
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 12,
    paddingHorizontal: 4,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
});
