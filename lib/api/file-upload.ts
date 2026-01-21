/**
 * File Upload Utilities
 * 
 * Helpers for uploading and downloading files.
 * Requires expo-file-system to be installed: npx expo install expo-file-system
 * 
 * Usage:
 *   const result = await uploadFile('/upload', file, { onProgress: (p) => console.log(p) });
 */

import { config } from '@/config';
import { secureStorage, STORAGE_KEYS } from '@/lib/storage/secure-storage';

export interface FileUploadOptions {
  onProgress?: (progress: number) => void;
  fieldName?: string;
  headers?: Record<string, string>;
}

export interface FileDownloadOptions {
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
}

/**
 * Upload a file with progress tracking
 * Note: Install expo-file-system first: npx expo install expo-file-system
 */
export async function uploadFile(
  endpoint: string,
  fileUri: string,
  options: FileUploadOptions = {}
): Promise<any> {
  const { fieldName = 'file', headers = {} } = options;
  const url = `${config.apiUrl}${endpoint}`;

  // Get auth token
  const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    // Dynamic import to avoid errors if expo-file-system is not installed
    const FileSystem = await import('expo-file-system');
    
    const uploadResult = await FileSystem.uploadAsync(url, fileUri, {
      httpMethod: 'POST',
      uploadType: (FileSystem as any).FileSystemUploadType?.MULTIPART ?? 0,
      fieldName,
      headers: {
        ...authHeaders,
        ...headers,
      },
    });

    if (uploadResult.status !== 200 && uploadResult.status !== 201) {
      throw new Error(`Upload failed with status ${uploadResult.status}`);
    }

    return JSON.parse(uploadResult.body);
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Download a file with progress tracking
 * Note: Install expo-file-system first: npx expo install expo-file-system
 */
export async function downloadFile(
  endpoint: string,
  destinationUri: string,
  options: FileDownloadOptions = {}
): Promise<any> {
  const { onProgress, headers = {} } = options;
  const url = `${config.apiUrl}${endpoint}`;

  // Get auth token
  const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    // Dynamic import to avoid errors if expo-file-system is not installed
    const FileSystem = await import('expo-file-system');

    const callback = (downloadProgress: any) => {
      if (onProgress) {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        onProgress(progress);
      }
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      destinationUri,
      {
        headers: {
          ...authHeaders,
          ...headers,
        },
      },
      callback
    );

    const result = await downloadResumable.downloadAsync();
    if (!result) {
      throw new Error('Download failed');
    }
    return result;
  } catch (error) {
    console.error('File download error:', error);
    throw error;
  }
}

/**
 * Get file info
 * Note: Install expo-file-system first: npx expo install expo-file-system
 */
export async function getFileInfo(uri: string): Promise<any> {
  const FileSystem = await import('expo-file-system');
  return FileSystem.getInfoAsync(uri);
}

/**
 * Delete a file
 * Note: Install expo-file-system first: npx expo install expo-file-system
 */
export async function deleteFile(uri: string): Promise<void> {
  const FileSystem = await import('expo-file-system');
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

/**
 * Get file size in a readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
