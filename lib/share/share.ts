/**
 * Share Functionality
 * 
 * Native share sheet for sharing content.
 * 
 * Usage:
 *   import { share } from '@/lib/share';
 *   await share('Hello World!');
 *   await shareImage(imageUri);
 */

import { Platform, Share as RNShare, ShareAction } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { logger } from '@/lib/logging/logger';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  subject?: string; // iOS only
}

export interface ShareResult {
  action: ShareAction;
  activityType?: string; // iOS only
}

/**
 * Share text or URL
 */
export async function share(content: string | ShareOptions): Promise<ShareResult | null> {
  try {
    let shareContent: { message: string; url?: string; title?: string };

    if (typeof content === 'string') {
      shareContent = { message: content };
    } else {
      shareContent = {
        message: content.message,
        url: content.url,
        title: content.title,
      };
    }

    const result = await RNShare.share(shareContent, {
      dialogTitle: shareContent.title || 'Share',
      subject: typeof content !== 'string' ? content.subject : undefined, // iOS only
    });

    logger.info('Content shared', { action: result.action });
    return result as unknown as ShareResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Share failed';
    logger.error('Share failed', { error: message });
    return null;
  }
}

/**
 * Share an image
 */
export async function shareImage(imageUri: string, options?: { title?: string; message?: string }): Promise<ShareResult | null> {
  try {
    // @ts-ignore - Optional dependency
    const Sharing = await import('expo-sharing');

    if (!(await Sharing.isAvailableAsync())) {
      logger.warn('Sharing not available on this device');
      return null;
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/jpeg',
      dialogTitle: options?.title || 'Share Image',
      UTI: 'public.jpeg', // iOS only
    });

    logger.info('Image shared', { imageUri });
    return { action: 'sharedAction' as unknown as ShareAction };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Share image failed';
    logger.error('Share image failed', { error: message });
    return null;
  }
}

/**
 * Share a file
 */
export async function shareFile(fileUri: string, options?: { title?: string; mimeType?: string }): Promise<ShareResult | null> {
  try {
    // @ts-ignore - Optional dependency
    const Sharing = await import('expo-sharing');

    if (!(await Sharing.isAvailableAsync())) {
      logger.warn('Sharing not available on this device');
      return null;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: options?.mimeType || 'application/octet-stream',
      dialogTitle: options?.title || 'Share File',
    });

    logger.info('File shared', { fileUri });
    return { action: 'sharedAction' as unknown as ShareAction };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Share file failed';
    logger.error('Share file failed', { error: message });
    return null;
  }
}

/**
 * Share multiple items (text + image)
 */
export async function shareMultiple(items: Array<string | { uri: string; type: 'image' | 'file' }>): Promise<ShareResult | null> {
  try {
    // For now, share the first item
    // Native share doesn't support multiple items directly
    const firstItem = items[0];
    
    if (typeof firstItem === 'string') {
      return await share(firstItem);
    } else if (firstItem.type === 'image') {
      return await shareImage(firstItem.uri);
    } else {
      return await shareFile(firstItem.uri);
    }
  } catch (error) {
    logger.error('Share multiple failed', { error });
    return null;
  }
}

/**
 * React hook for sharing
 */
export function useShare() {
  return {
    share,
    shareImage,
    shareFile,
    shareMultiple,
  };
}
