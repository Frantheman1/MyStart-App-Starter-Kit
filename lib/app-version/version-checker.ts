/**
 * App Version Checker
 * 
 * Check for app updates and prompt users to update.
 * Redirects to App Store / Play Store.
 * 
 * Usage:
 *   import { useAppVersion } from '@/lib/app-version';
 *   const { checkForUpdate, currentVersion } = useAppVersion();
 *   await checkForUpdate();
 */

import { useState, useEffect } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { logger } from '@/lib/logging/logger';

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  needsUpdate: boolean;
  isCritical: boolean;
}

export interface AppVersionConfig {
  apiUrl?: string; // Your API endpoint that returns latest version
  checkInterval?: number; // How often to check (in ms)
  showAlertOnStartup?: boolean; // Show alert on app start if update needed
  autoCheckOnMount?: boolean; // Automatically check when app starts (default: false for starter kit)
  autoShowAlert?: boolean; // Automatically show alert if update needed (default: false for starter kit)
  criticalVersion?: string; // Minimum required version
  enabled?: boolean; // Enable/disable version checking (default: true)
}

class AppVersionService {
  public config: AppVersionConfig;
  private checkIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: AppVersionConfig = {}) {
    this.config = {
      checkInterval: config.checkInterval || 24 * 60 * 60 * 1000, // 24 hours
      showAlertOnStartup: config.showAlertOnStartup ?? false, // Default false for starter kit
      autoCheckOnMount: config.autoCheckOnMount ?? false, // Default false for starter kit
      autoShowAlert: config.autoShowAlert ?? false, // Default false for starter kit
      enabled: config.enabled ?? true,
      ...config,
    };
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
  }

  /**
   * Get app store URLs
   */
  private getStoreUrls(): { ios?: string; android?: string } {
    // You'll need to replace these with your actual app store URLs
    const iosAppId = Constants.expoConfig?.ios?.bundleIdentifier || 'your-app-id';
    const androidPackageName = Constants.expoConfig?.android?.package || 'com.yourcompany.yourapp';

    return {
      ios: `https://apps.apple.com/app/id${iosAppId}`,
      android: `https://play.google.com/store/apps/details?id=${androidPackageName}`,
    };
  }

  /**
   * Open app store
   */
  async openAppStore(): Promise<void> {
    try {
      const urls = this.getStoreUrls();
      const url = Platform.OS === 'ios' ? urls.ios : urls.android;

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          logger.info('Opened app store', { url });
        } else {
          logger.warn('Cannot open app store URL', { url });
        }
      }
    } catch (error) {
      logger.error('Failed to open app store', { error });
    }
  }

  /**
   * Check for updates from API
   */
  async checkForUpdate(apiUrl?: string): Promise<VersionInfo> {
    const currentVersion = this.getCurrentVersion();
    const checkUrl = apiUrl || this.config.apiUrl;

    if (!checkUrl) {
      logger.warn('No API URL provided for version check');
      return {
        currentVersion,
        latestVersion: null,
        needsUpdate: false,
        isCritical: false,
      };
    }

    try {
      const response = await fetch(checkUrl);
      const data = await response.json();

      // Expected API response format:
      // { version: "1.2.3", critical: false, message: "Optional update message" }
      const latestVersion = data.version || data.latestVersion;
      const isCritical = data.critical || false;

      const needsUpdate = this.compareVersions(currentVersion, latestVersion) < 0;

      logger.info('Version check completed', {
        currentVersion,
        latestVersion,
        needsUpdate,
        isCritical,
      });

      return {
        currentVersion,
        latestVersion,
        needsUpdate,
        isCritical,
      };
    } catch (error) {
      logger.error('Version check failed', { error });
      return {
        currentVersion,
        latestVersion: null,
        needsUpdate: false,
        isCritical: false,
      };
    }
  }

  /**
   * Compare two version strings
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  /**
   * Show update alert
   */
  showUpdateAlert(
    versionInfo: VersionInfo,
    onUpdate?: () => void,
    onSkip?: () => void
  ): void {
    const { latestVersion, isCritical } = versionInfo;

    Alert.alert(
      isCritical ? 'Update Required' : 'Update Available',
      `A new version (${latestVersion}) is available. Please update to continue.`,
      [
        ...(isCritical
          ? []
          : [
              {
                text: 'Later',
                style: 'cancel' as const,
                onPress: onSkip,
              },
            ]),
        {
          text: 'Update',
          onPress: () => {
            this.openAppStore();
            onUpdate?.();
          },
        },
      ],
      { cancelable: !isCritical }
    );
  }

  /**
   * Start periodic version checking
   */
  startPeriodicCheck(
    onUpdateAvailable: (info: VersionInfo) => void
  ): void {
    if (this.checkIntervalId) {
      this.stopPeriodicCheck();
    }

    this.checkIntervalId = setInterval(async () => {
      const versionInfo = await this.checkForUpdate();
      if (versionInfo.needsUpdate) {
        onUpdateAvailable(versionInfo);
      }
    }, this.config.checkInterval || 24 * 60 * 60 * 1000);
  }

  /**
   * Stop periodic checking
   */
  stopPeriodicCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }
}

// Singleton instance
let versionService: AppVersionService | null = null;

/**
 * Initialize version checker
 */
export function initVersionChecker(config: AppVersionConfig = {}): AppVersionService {
  if (!versionService) {
    versionService = new AppVersionService(config);
  }
  return versionService;
}

/**
 * Get version service instance
 */
export function getVersionService(): AppVersionService {
  if (!versionService) {
    versionService = new AppVersionService();
  }
  return versionService;
}

/**
 * React hook for app version checking
 */
export function useAppVersion(config?: AppVersionConfig) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    currentVersion: getVersionService().getCurrentVersion(),
    latestVersion: null,
    needsUpdate: false,
    isCritical: false,
  });

  const checkForUpdate = async (apiUrl?: string) => {
    const service = getVersionService();
    if (config && service.config.enabled === false) {
      logger.debug('Version checking is disabled');
      return versionInfo;
    }

    const info = await service.checkForUpdate(apiUrl);
    setVersionInfo(info);
    return info;
  };

  const showUpdateAlert = (onUpdate?: () => void, onSkip?: () => void) => {
    getVersionService().showUpdateAlert(versionInfo, onUpdate, onSkip);
  };

  const openAppStore = () => {
    return getVersionService().openAppStore();
  };

  useEffect(() => {
    if (config) {
      const service = initVersionChecker(config);
      
      // Auto-check on mount if enabled
      if (service.config.autoCheckOnMount && service.config.enabled && service.config.apiUrl) {
        service.checkForUpdate().then((info) => {
          // Auto-show alert if update needed and autoShowAlert is enabled
          if (info.needsUpdate && service.config.autoShowAlert) {
            service.showUpdateAlert(info);
          }
        });
      }
    }
  }, []);

  return {
    versionInfo,
    currentVersion: versionInfo.currentVersion,
    checkForUpdate,
    showUpdateAlert,
    openAppStore,
  };
}

/**
 * Initialize version checker in root layout
 * Call this in your app's root component to enable auto-checking
 * 
 * Usage in app/_layout.tsx:
 *   import { initVersionChecker } from '@/lib/app-version';
 *   
 *   // For production (auto-check enabled):
 *   initVersionChecker({
 *     apiUrl: 'https://your-api.com/version',
 *     autoCheckOnMount: true,
 *     autoShowAlert: true,
 *   });
 *   
 *   // For starter kit (manual check only):
 *   initVersionChecker({
 *     autoCheckOnMount: false,
 *     autoShowAlert: false,
 *   });
 */
export function useVersionCheckerOnMount(config: AppVersionConfig = {}) {
  useEffect(() => {
    const service = initVersionChecker({
      autoCheckOnMount: false, // Default: disabled for starter kit
      autoShowAlert: false, // Default: disabled for starter kit
      enabled: true,
      ...config,
    });

    // Only auto-check if explicitly enabled
    if (service.config.autoCheckOnMount && service.config.enabled && service.config.apiUrl) {
      service.checkForUpdate().then((info) => {
        if (info.needsUpdate && service.config.autoShowAlert) {
          // Small delay to ensure app is fully loaded
          setTimeout(() => {
            service.showUpdateAlert(info);
          }, 2000);
        }
      });
    }
  }, []);
}
