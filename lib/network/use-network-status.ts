/**
 * Network Status Hook
 * 
 * Detects online/offline status and connection type.
 * Requires: npx expo install @react-native-community/netinfo
 * 
 * Usage:
 *   const { isConnected, isInternetReachable, type } = useNetworkStatus();
 *   
 *   if (!isConnected) {
 *     return <OfflineBanner />;
 *   }
 */

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/logger';

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupNetworkListener() {
      try {
        // Dynamic import to avoid errors if not installed
        // @ts-ignore - Optional dependency
        const NetInfo: any = await import('@react-native-community/netinfo');

        // Get initial state
        const state = await NetInfo.default.fetch();
        setNetworkState({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
        });

        // Subscribe to network state updates
        unsubscribe = NetInfo.default.addEventListener((state: any) => {
          const newState = {
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
          };

          setNetworkState(newState);

          // Log network changes
          if (state.isConnected) {
            logger.info('Network connected', { type: state.type });
          } else {
            logger.warn('Network disconnected');
          }
        });
      } catch (error) {
        console.warn(
          'NetInfo not available. Install: npx expo install @react-native-community/netinfo'
        );
        // Assume online if package not installed
        setNetworkState({
          isConnected: true,
          isInternetReachable: true,
          type: 'unknown',
        });
      }
    }

    setupNetworkListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return networkState;
}
