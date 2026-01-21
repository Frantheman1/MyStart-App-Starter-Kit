/**
 * Data Deletion
 * 
 * Handles user data deletion requests (GDPR "right to be forgotten").
 * 
 * Usage:
 *   await dataDeletion.deleteUserData(userId);
 *   await dataDeletion.exportUserData(userId);
 */

import { apiClient } from '@/lib/api/client';
import { secureStorage } from '@/lib/storage/secure-storage';
import { cache } from '@/lib/api/cache';
import { logger } from '@/lib/logging/logger';
import { analytics } from '@/lib/analytics/analytics';
import { crashReporting } from '@/lib/errors/crash-reporting';
import { consentManager } from './consent';

export interface DataDeletionRequest {
  userId: string;
  reason?: string;
  keepAnonymizedData?: boolean;
}

export interface DataExportRequest {
  userId: string;
  format?: 'json' | 'csv';
}

class DataDeletion {
  /**
   * Request account deletion
   */
  async requestAccountDeletion(
    request: DataDeletionRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Account deletion requested', {
        userId: request.userId,
        reason: request.reason,
      });

      // Call API to request deletion
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/user/delete-account',
        request
      );

      // Clear local data immediately
      await this.clearLocalData();

      logger.info('Account deletion request successful');
      return response;
    } catch (error) {
      logger.error('Account deletion request failed', { error });
      throw error;
    }
  }

  /**
   * Export user data (GDPR data portability)
   */
  async requestDataExport(
    request: DataExportRequest
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    try {
      logger.info('Data export requested', {
        userId: request.userId,
        format: request.format,
      });

      const response = await apiClient.post<{
        downloadUrl: string;
        expiresAt: string;
      }>('/user/export-data', request);

      logger.info('Data export request successful');
      return response;
    } catch (error) {
      logger.error('Data export request failed', { error });
      throw error;
    }
  }

  /**
   * Clear all local data
   */
  async clearLocalData(): Promise<void> {
    logger.info('Clearing local data');

    try {
      // Clear secure storage
      await secureStorage.clear();

      // Clear cache
      cache.clear();

      // Reset analytics
      analytics.reset();

      // Clear crash reporting user context
      crashReporting.clearUser();

      // Reset consent preferences
      await consentManager.reset();

      // Clear logs
      logger.clearLogs();

      logger.info('Local data cleared successfully');
    } catch (error) {
      logger.error('Failed to clear local data', { error });
      throw error;
    }
  }

  /**
   * Clear specific user data categories
   */
  async clearDataCategory(category: 'auth' | 'preferences' | 'cache'): Promise<void> {
    logger.info(`Clearing data category: ${category}`);

    try {
      switch (category) {
        case 'auth':
          await secureStorage.removeItem('auth_access_token');
          await secureStorage.removeItem('auth_refresh_token');
          await secureStorage.removeItem('user_data');
          break;
        case 'preferences':
          await consentManager.reset();
          break;
        case 'cache':
          cache.clear();
          break;
      }

      logger.info(`Data category cleared: ${category}`);
    } catch (error) {
      logger.error(`Failed to clear data category: ${category}`, { error });
      throw error;
    }
  }

  /**
   * Get list of data categories stored locally
   */
  getDataCategories(): Array<{
    category: string;
    description: string;
    canDelete: boolean;
  }> {
    return [
      {
        category: 'Authentication',
        description: 'Login tokens and session data',
        canDelete: true,
      },
      {
        category: 'User Preferences',
        description: 'App settings and preferences',
        canDelete: true,
      },
      {
        category: 'Cache',
        description: 'Temporary cached data',
        canDelete: true,
      },
      {
        category: 'Consent Preferences',
        description: 'Privacy and consent settings',
        canDelete: true,
      },
      {
        category: 'Logs',
        description: 'App logs and diagnostics',
        canDelete: true,
      },
    ];
  }
}

// Create and export singleton instance
export const dataDeletion = new DataDeletion();
