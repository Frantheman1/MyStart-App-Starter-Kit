/**
 * Secure Storage
 * 
 * Utility for securely storing sensitive data like tokens.
 * Uses expo-secure-store for secure storage on device.
 * 
 * Usage:
 *   await secureStorage.setItem('authToken', token);
 *   const token = await secureStorage.getItem('authToken');
 */

// Note: You'll need to install expo-secure-store
// For now, we'll use AsyncStorage as a fallback
// Run: npx expo install expo-secure-store

const USE_SECURE_STORE = false; // Set to true after installing expo-secure-store

let SecureStore: any;
let AsyncStorage: any;

if (USE_SECURE_STORE) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('expo-secure-store not available, falling back to AsyncStorage');
  }
}

if (!SecureStore) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.error('Neither SecureStore nor AsyncStorage available');
  }
}

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      } else {
        throw new Error('No storage available');
      }
    } catch (error) {
      console.error('Error storing item:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(key);
      } else if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      } else {
        throw new Error('No storage available');
      }
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      } else {
        throw new Error('No storage available');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    // Note: SecureStore doesn't have a clear method
    // You'll need to track and remove individual keys
    if (AsyncStorage) {
      await AsyncStorage.clear();
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'user_data',
  DEVICE_ID: 'device_id',
} as const;
