/**
 * Permissions Manager
 * 
 * Unified permission handling for all app permissions.
 * 
 * Usage:
 *   import { permissions } from '@/lib/permissions';
 *   const camera = await permissions.request('camera');
 *   if (camera.granted) {
 *     // Use camera
 *   }
 */

import { Platform, Linking, Alert } from 'react-native';
import { logger } from '@/lib/logging/logger';

export type PermissionType =
  | 'camera'
  | 'mediaLibrary'
  | 'notifications'
  | 'location'
  | 'contacts'
  | 'calendar'
  | 'reminders'
  | 'microphone'
  | 'speechRecognition'
  | 'motion';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
}

class PermissionsService {
  /**
   * Request a permission
   */
  async request(type: PermissionType): Promise<PermissionStatus> {
    try {
      switch (type) {
        case 'camera':
          return await this.requestCamera();
        case 'mediaLibrary':
          return await this.requestMediaLibrary();
        case 'notifications':
          return await this.requestNotifications();
        case 'location':
          return await this.requestLocation();
        case 'microphone':
          return await this.requestMicrophone();
        default:
          logger.warn(`Permission type ${type} not yet implemented`);
          return {
            granted: false,
            canAskAgain: false,
            status: 'undetermined',
          };
      }
    } catch (error) {
      logger.error(`Failed to request ${type} permission`, { error });
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }

  /**
   * Check permission status without requesting
   */
  async check(type: PermissionType): Promise<PermissionStatus> {
    try {
      switch (type) {
        case 'camera':
          return await this.checkCamera();
        case 'mediaLibrary':
          return await this.checkMediaLibrary();
        case 'notifications':
          return await this.checkNotifications();
        case 'location':
          return await this.checkLocation();
        case 'microphone':
          return await this.checkMicrophone();
        default:
          return {
            granted: false,
            canAskAgain: false,
            status: 'undetermined',
          };
      }
    } catch (error) {
      logger.error(`Failed to check ${type} permission`, { error });
      return {
        granted: false,
        canAskAgain: false,
        status: 'undetermined',
      };
    }
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
      logger.info('Opened app settings');
    } catch (error) {
      logger.error('Failed to open settings', { error });
      Alert.alert('Error', 'Unable to open settings');
    }
  }

  /**
   * Show alert to open settings if permission is blocked
   */
  showSettingsAlert(type: PermissionType): void {
    Alert.alert(
      'Permission Required',
      `${this.getPermissionName(type)} permission is required. Please enable it in settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => this.openSettings(),
        },
      ]
    );
  }

  /**
   * Get human-readable permission name
   */
  private getPermissionName(type: PermissionType): string {
    const names: Record<PermissionType, string> = {
      camera: 'Camera',
      mediaLibrary: 'Photo Library',
      notifications: 'Notifications',
      location: 'Location',
      contacts: 'Contacts',
      calendar: 'Calendar',
      reminders: 'Reminders',
      microphone: 'Microphone',
      speechRecognition: 'Speech Recognition',
      motion: 'Motion',
    };
    return names[type] || type;
  }

  // Camera Permission
  private async requestCamera(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  private async checkCamera(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  // Media Library Permission
  private async requestMediaLibrary(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  private async checkMediaLibrary(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  // Notifications Permission
  private async requestNotifications(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  private async checkNotifications(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  // Location Permission
  private async requestLocation(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  private async checkLocation(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Location = await import('expo-location');
      const { status } = await Location.getForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }

  // Microphone Permission
  private async requestMicrophone(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Audio = await import('expo-av');
      const { status } = await Audio.Audio.requestPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'denied' };
    }
  }

  private async checkMicrophone(): Promise<PermissionStatus> {
    try {
      // @ts-ignore - Optional dependency
      const Audio = await import('expo-av');
      const { status } = await Audio.Audio.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : status === 'denied' ? 'blocked' : 'denied',
      };
    } catch (error) {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }
  }
}

export const permissions = new PermissionsService();

/**
 * React hook for permissions
 */
export function usePermissions() {
  return {
    request: permissions.request.bind(permissions),
    check: permissions.check.bind(permissions),
    openSettings: permissions.openSettings.bind(permissions),
    showSettingsAlert: permissions.showSettingsAlert.bind(permissions),
  };
}
