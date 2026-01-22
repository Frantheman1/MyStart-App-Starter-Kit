/**
 * Haptic Feedback
 * 
 * Tactile feedback for better UX.
 * Requires: npx expo install expo-haptics
 * 
 * Usage:
 *   import { haptics } from '@/lib/haptics';
 *   haptics.impact('medium');
 *   haptics.notification('success');
 */

import { Platform } from 'react-native';
import { logger } from '@/lib/logging/logger';

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationType = 'success' | 'warning' | 'error';
export type SelectionType = 'selection';

class HapticsService {
  private hapticsModule: any = null;
  private isAvailable = false;

  /**
   * Initialize haptics (lazy load)
   */
  private async init() {
    if (this.hapticsModule) return;

    try {
      // @ts-ignore - Optional dependency
      const Haptics = await import('expo-haptics');
      this.hapticsModule = Haptics;
      this.isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
      logger.debug('Haptics initialized', { available: this.isAvailable });
    } catch (error) {
      console.warn('Haptics not available. Install: npx expo install expo-haptics');
      this.isAvailable = false;
    }
  }

  /**
   * Impact feedback (button press, collision)
   */
  async impact(style: ImpactStyle = 'medium') {
    await this.init();
    if (!this.isAvailable || !this.hapticsModule) return;

    try {
      const styleMap: Record<ImpactStyle, any> = {
        light: this.hapticsModule.ImpactFeedbackStyle.Light,
        medium: this.hapticsModule.ImpactFeedbackStyle.Medium,
        heavy: this.hapticsModule.ImpactFeedbackStyle.Heavy,
        rigid: this.hapticsModule.ImpactFeedbackStyle.Rigid,
        soft: this.hapticsModule.ImpactFeedbackStyle.Soft,
      };

      await this.hapticsModule.impactAsync(styleMap[style]);
    } catch (error) {
      logger.warn('Haptic impact failed', { error });
    }
  }

  /**
   * Notification feedback (success, warning, error)
   */
  async notification(type: NotificationType = 'success') {
    await this.init();
    if (!this.isAvailable || !this.hapticsModule) return;

    try {
      const typeMap: Record<NotificationType, any> = {
        success: this.hapticsModule.NotificationFeedbackType.Success,
        warning: this.hapticsModule.NotificationFeedbackType.Warning,
        error: this.hapticsModule.NotificationFeedbackType.Error,
      };

      await this.hapticsModule.notificationAsync(typeMap[type]);
    } catch (error) {
      logger.warn('Haptic notification failed', { error });
    }
  }

  /**
   * Selection feedback (picker, toggle)
   */
  async selection() {
    await this.init();
    if (!this.isAvailable || !this.hapticsModule) return;

    try {
      await this.hapticsModule.selectionAsync();
    } catch (error) {
      logger.warn('Haptic selection failed', { error });
    }
  }

  /**
   * Quick haptic for button press
   */
  async buttonPress() {
    await this.impact('light');
  }

  /**
   * Quick haptic for success action
   */
  async success() {
    await this.notification('success');
  }

  /**
   * Quick haptic for error
   */
  async error() {
    await this.notification('error');
  }

  /**
   * Quick haptic for warning
   */
  async warning() {
    await this.notification('warning');
  }
}

export const haptics = new HapticsService();

/**
 * React hook for haptic feedback
 */
export function useHaptics() {
  return {
    impact: haptics.impact.bind(haptics),
    notification: haptics.notification.bind(haptics),
    selection: haptics.selection.bind(haptics),
    buttonPress: haptics.buttonPress.bind(haptics),
    success: haptics.success.bind(haptics),
    error: haptics.error.bind(haptics),
    warning: haptics.warning.bind(haptics),
  };
}
