/**
 * Biometric Authentication
 * 
 * Face ID, Touch ID, Fingerprint authentication.
 * Requires: npx expo install expo-local-authentication
 * 
 * Usage:
 *   const { isAvailable, authenticate } = useBiometric();
 *   const result = await authenticate();
 *   if (result.success) {
 *     // User authenticated
 *   }
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { logger } from '@/lib/logging/logger';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'unknown';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export interface UseBiometricReturn {
  isAvailable: boolean;
  biometricType: BiometricType | null;
  isEnrolled: boolean;
  authenticate: (options?: AuthenticateOptions) => Promise<BiometricResult>;
}

export interface AuthenticateOptions {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
}

/**
 * Hook for biometric authentication
 */
export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // @ts-ignore - Optional dependency
      const LocalAuthentication = await import('expo-local-authentication');

      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        if (enrolled) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const type = getBiometricType(types);
          setBiometricType(type);
          logger.info('Biometric authentication available', { type });
        }
      }
    } catch (error) {
      console.warn('Biometric auth not available. Install: npx expo install expo-local-authentication');
      setIsAvailable(false);
    }
  };

  const authenticate = async (
    options: AuthenticateOptions = {}
  ): Promise<BiometricResult> => {
    try {
      // @ts-ignore - Optional dependency
      const LocalAuthentication = await import('expo-local-authentication');

      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      if (!isEnrolled) {
        return {
          success: false,
          error: 'No biometric data enrolled on this device',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options.promptMessage || 'Authenticate',
        cancelLabel: options.cancelLabel || 'Cancel',
        disableDeviceFallback: options.disableDeviceFallback || false,
      });

      if (result.success) {
        logger.info('Biometric authentication successful');
        return {
          success: true,
          biometricType: biometricType || undefined,
        };
      } else {
        logger.warn('Biometric authentication failed', { error: result.error });
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      logger.error('Biometric authentication error', { error: message });
      return {
        success: false,
        error: message,
      };
    }
  };

  return {
    isAvailable,
    biometricType,
    isEnrolled,
    authenticate,
  };
}

/**
 * Get biometric type from supported types
 */
function getBiometricType(types: number[]): BiometricType {
  // These constants match expo-local-authentication
  const FINGERPRINT = 1;
  const FACIAL_RECOGNITION = 2;
  const IRIS = 3;

  if (types.includes(FACIAL_RECOGNITION)) {
    return 'facial';
  } else if (types.includes(FINGERPRINT)) {
    return 'fingerprint';
  } else if (types.includes(IRIS)) {
    return 'iris';
  }
  return 'unknown';
}

/**
 * Get biometric type label
 */
export function getBiometricLabel(type: BiometricType | null): string {
  switch (type) {
    case 'facial':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'iris':
      return 'Iris Recognition';
    default:
      return 'Biometric';
  }
}
