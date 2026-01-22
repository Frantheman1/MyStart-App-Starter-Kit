/**
 * Version Checker Provider
 * 
 * Optional provider component for automatic version checking.
 * Add this to your root layout if you want auto-checking enabled.
 * 
 * Usage in app/_layout.tsx:
 *   <VersionCheckerProvider
 *     apiUrl="https://your-api.com/version"
 *     autoCheckOnMount={true}
 *     autoShowAlert={true}
 *   />
 */

import React, { useEffect } from 'react';
import { initVersionChecker, AppVersionConfig } from './version-checker';
import { logger } from '@/lib/logging/logger';

export interface VersionCheckerProviderProps extends AppVersionConfig {
  children?: React.ReactNode;
}

/**
 * Provider component for automatic version checking
 * 
 * For starter kit: Leave autoCheckOnMount and autoShowAlert as false
 * For production: Set both to true and provide apiUrl
 */
export function VersionCheckerProvider({
  children,
  autoCheckOnMount = false, // Default: disabled for starter kit
  autoShowAlert = false, // Default: disabled for starter kit
  enabled = true,
  ...config
}: VersionCheckerProviderProps) {
  useEffect(() => {
    if (!enabled) {
      logger.debug('Version checker is disabled');
      return;
    }

    const service = initVersionChecker({
      autoCheckOnMount,
      autoShowAlert,
      enabled,
      ...config,
    });

    // Auto-check on mount if enabled
    if (autoCheckOnMount && config.apiUrl) {
      logger.info('Auto-checking for app updates on mount');
      
      // Small delay to ensure app is fully loaded
      const timeoutId = setTimeout(async () => {
        const versionInfo = await service.checkForUpdate();
        
        if (versionInfo.needsUpdate && autoShowAlert) {
          logger.info('Update available, showing alert', {
            current: versionInfo.currentVersion,
            latest: versionInfo.latestVersion,
          });
          
          service.showUpdateAlert(
            versionInfo,
            () => {
              logger.info('User chose to update');
            },
            () => {
              logger.info('User skipped update');
            }
          );
        }
      }, 2000); // 2 second delay

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [autoCheckOnMount, autoShowAlert, enabled, config.apiUrl]);

  return <>{children}</>;
}
