/**
 * Offline Banner Component
 * 
 * Shows a banner when the device is offline.
 * 
 * Usage:
 *   <OfflineBanner />  // Add to root layout
 */

import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Text } from './text';
import { useTheme } from '@/theme';
import { useNetworkStatus } from '@/lib/network/use-network-status';
import { OfflineQueue } from '@/lib/network/offline-queue';

export function OfflineBanner() {
  const theme = useTheme();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [translateY] = React.useState(new Animated.Value(-100));
  const isOffline = isConnected === false || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Show banner
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      // Hide banner and process offline queue
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Process queued requests when back online
      if (isConnected === true) {
        const queue = OfflineQueue.getInstance();
        queue.processQueue();
      }
    }
  }, [isOffline, isConnected, translateY]);

  if (isConnected === null) {
    return null; // Loading network status
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.error,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text
        variant="body"
        weight="semibold"
        style={{ color: theme.colors.background }}
      >
        {isConnected === false
          ? '📡 No Internet Connection'
          : '⚠️ Connection Issues'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 999,
  },
});
