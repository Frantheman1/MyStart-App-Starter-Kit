/**
 * Clipboard Utilities
 * 
 * Copy and paste functionality.
 * 
 * Usage:
 *   import { clipboard } from '@/lib/clipboard';
 *   await clipboard.copy('Hello World!');
 *   const text = await clipboard.getString();
 */

import { logger } from '@/lib/logging/logger';

class ClipboardService {
  /**
   * Copy text to clipboard
   */
  async copy(text: string): Promise<boolean> {
    try {
      // @ts-ignore - Optional dependency
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      logger.debug('Text copied to clipboard', { length: text.length });
      return true;
    } catch (error) {
      logger.error('Failed to copy to clipboard', { error });
      return false;
    }
  }

  /**
   * Get text from clipboard
   */
  async getString(): Promise<string> {
    try {
      // @ts-ignore - Optional dependency
      const Clipboard = await import('expo-clipboard');
      const text = await Clipboard.getStringAsync();
      logger.debug('Text retrieved from clipboard', { length: text.length });
      return text;
    } catch (error) {
      logger.error('Failed to get clipboard text', { error });
      return '';
    }
  }

  /**
   * Check if clipboard has text
   */
  async hasString(): Promise<boolean> {
    try {
      const text = await this.getString();
      return text.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Copy image to clipboard (iOS only)
   */
  async copyImage(imageUri: string): Promise<boolean> {
    try {
      // @ts-ignore - Platform specific
      if (Platform.OS === 'ios') {
        // Note: expo-clipboard doesn't support images directly
        // You might need to use a different approach or library
        logger.warn('Image copy not directly supported by expo-clipboard');
        return false;
      }
      return false;
    } catch (error) {
      logger.error('Failed to copy image to clipboard', { error });
      return false;
    }
  }

  /**
   * Get image from clipboard (iOS only)
   */
  async getImage(): Promise<string | null> {
    try {
      // @ts-ignore - Platform specific
      if (Platform.OS === 'ios') {
        // Note: expo-clipboard doesn't support images directly
        logger.warn('Image paste not directly supported by expo-clipboard');
        return null;
      }
      return null;
    } catch (error) {
      logger.error('Failed to get image from clipboard', { error });
      return null;
    }
  }

  /**
   * Clear clipboard
   */
  async clear(): Promise<boolean> {
    try {
      // @ts-ignore - Optional dependency
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync('');
      logger.debug('Clipboard cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear clipboard', { error });
      return false;
    }
  }
}

export const clipboard = new ClipboardService();

/**
 * React hook for clipboard
 */
export function useClipboard() {
  return {
    copy: clipboard.copy.bind(clipboard),
    getString: clipboard.getString.bind(clipboard),
    hasString: clipboard.hasString.bind(clipboard),
    clear: clipboard.clear.bind(clipboard),
  };
}
