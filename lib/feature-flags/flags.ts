/**
 * Feature Flags
 * 
 * Simple feature flag system for controlled rollouts.
 * Can be extended to integrate with services like LaunchDarkly, Firebase Remote Config, etc.
 * 
 * Usage:
 *   if (featureFlags.isEnabled('new-feature')) {
 *     // Show new feature
 *   }
 */

import { config } from '@/config';
import { logger } from '@/lib/logging/logger';

export type FeatureFlag = keyof typeof config.featureFlags;

class FeatureFlags {
  private flags: Record<string, boolean>;
  private overrides: Record<string, boolean> = {};

  constructor(initialFlags: Record<string, boolean> = {}) {
    this.flags = initialFlags;
  }

  /**
   * Initialize feature flags (can fetch from remote config)
   */
  async initialize(): Promise<void> {
    logger.info('Feature flags initialized', { flags: this.flags });
    
    // TODO: Fetch feature flags from remote config
    // Example:
    // const remoteFlags = await fetchRemoteConfig();
    // this.flags = { ...this.flags, ...remoteFlags };
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flag: string): boolean {
    // Check overrides first (for testing)
    if (this.overrides[flag] !== undefined) {
      return this.overrides[flag];
    }

    return this.flags[flag] ?? false;
  }

  /**
   * Enable a feature flag
   */
  enable(flag: string): void {
    this.flags[flag] = true;
    logger.debug(`Feature flag enabled: ${flag}`);
  }

  /**
   * Disable a feature flag
   */
  disable(flag: string): void {
    this.flags[flag] = false;
    logger.debug(`Feature flag disabled: ${flag}`);
  }

  /**
   * Override a feature flag (for testing)
   */
  override(flag: string, value: boolean): void {
    this.overrides[flag] = value;
    logger.debug(`Feature flag overridden: ${flag} = ${value}`);
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides = {};
    logger.debug('Feature flag overrides cleared');
  }

  /**
   * Get all flags
   */
  getAll(): Record<string, boolean> {
    return { ...this.flags, ...this.overrides };
  }

  /**
   * Update multiple flags
   */
  updateFlags(flags: Record<string, boolean>): void {
    this.flags = { ...this.flags, ...flags };
    logger.debug('Feature flags updated', { flags });
  }
}

// Create and export singleton instance
export const featureFlags = new FeatureFlags(config.featureFlags);

// Common feature flag names (use these for consistency)
export const Features = {
  NEW_ONBOARDING: 'newOnboarding',
  DARK_MODE: 'darkMode',
  SOCIAL_LOGIN: 'socialLogin',
  PUSH_NOTIFICATIONS: 'pushNotifications',
  ANALYTICS: 'analytics',
  BETA_FEATURES: 'betaFeatures',
} as const;
