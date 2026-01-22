/**
 * Trial System
 * 
 * Track app usage and manage trial periods.
 * 
 * Usage:
 *   import { useTrial } from '@/lib/trial';
 *   const { isTrialActive, daysRemaining, showPaywall } = useTrial({ trialDays: 3 });
 */

import { useState, useEffect } from 'react';
import { secureStorage } from '@/lib/storage/secure-storage';
import { logger } from '@/lib/logging/logger';

export interface TrialConfig {
  trialDays: number; // Number of days for trial
  storageKey?: string; // Storage key for trial data
}

export interface TrialState {
  isTrialActive: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  daysRemaining: number;
  daysUsed: number;
  isExpired: boolean;
}

const DEFAULT_STORAGE_KEY = 'app_trial_data';

class TrialService {
  private config: Required<TrialConfig>;
  private state: TrialState;

  constructor(config: TrialConfig) {
    this.config = {
      trialDays: config.trialDays,
      storageKey: config.storageKey || DEFAULT_STORAGE_KEY,
    };

    this.state = {
      isTrialActive: false,
      trialStartDate: null,
      trialEndDate: null,
      daysRemaining: config.trialDays,
      daysUsed: 0,
      isExpired: false,
    };
  }

  /**
   * Initialize trial (call on first app launch)
   */
  async initialize(): Promise<TrialState> {
    try {
      const stored = await secureStorage.getItem(this.config.storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        this.state = {
          isTrialActive: data.isTrialActive,
          trialStartDate: data.trialStartDate ? new Date(data.trialStartDate) : null,
          trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
          daysRemaining: data.daysRemaining || 0,
          daysUsed: data.daysUsed || 0,
          isExpired: data.isExpired || false,
        };
      } else {
        // First launch - start trial
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + this.config.trialDays);

        this.state = {
          isTrialActive: true,
          trialStartDate: now,
          trialEndDate: endDate,
          daysRemaining: this.config.trialDays,
          daysUsed: 0,
          isExpired: false,
        };

        await this.save();
        logger.info('Trial started', {
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          days: this.config.trialDays,
        });
      }

      // Update state based on current date
      this.updateState();
      return this.state;
    } catch (error) {
      logger.error('Failed to initialize trial', { error });
      return this.state;
    }
  }

  /**
   * Update trial state based on current date
   */
  private updateState(): void {
    if (!this.state.trialStartDate || !this.state.trialEndDate) {
      return;
    }

    const now = new Date();
    const endDate = this.state.trialEndDate;

    if (now > endDate) {
      // Trial expired
      this.state.isExpired = true;
      this.state.isTrialActive = false;
      this.state.daysRemaining = 0;
    } else {
      // Trial still active
      this.state.isExpired = false;
      this.state.isTrialActive = true;
      
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.state.daysRemaining = Math.max(0, diffDays);

      const usedTime = now.getTime() - this.state.trialStartDate.getTime();
      const usedDays = Math.floor(usedTime / (1000 * 60 * 60 * 24));
      this.state.daysUsed = usedDays;
    }
  }

  /**
   * Get current trial state
   */
  getState(): TrialState {
    this.updateState();
    return { ...this.state };
  }

  /**
   * Check if trial is active
   */
  isTrialActive(): boolean {
    this.updateState();
    return this.state.isTrialActive && !this.state.isExpired;
  }

  /**
   * Check if trial is expired
   */
  isExpired(): boolean {
    this.updateState();
    return this.state.isExpired;
  }

  /**
   * Get days remaining
   */
  getDaysRemaining(): number {
    this.updateState();
    return this.state.daysRemaining;
  }

  /**
   * Get days used
   */
  getDaysUsed(): number {
    this.updateState();
    return this.state.daysUsed;
  }

  /**
   * End trial (e.g., when user subscribes)
   */
  async endTrial(): Promise<void> {
    this.state.isTrialActive = false;
    await this.save();
    logger.info('Trial ended');
  }

  /**
   * Reset trial (for testing)
   */
  async resetTrial(): Promise<void> {
    await secureStorage.removeItem(this.config.storageKey);
    this.state = {
      isTrialActive: false,
      trialStartDate: null,
      trialEndDate: null,
      daysRemaining: this.config.trialDays,
      daysUsed: 0,
      isExpired: false,
    };
    logger.info('Trial reset');
  }

  /**
   * Save trial state
   */
  private async save(): Promise<void> {
    try {
      await secureStorage.setItem(
        this.config.storageKey,
        JSON.stringify({
          isTrialActive: this.state.isTrialActive,
          trialStartDate: this.state.trialStartDate?.toISOString(),
          trialEndDate: this.state.trialEndDate?.toISOString(),
          daysRemaining: this.state.daysRemaining,
          daysUsed: this.state.daysUsed,
          isExpired: this.state.isExpired,
        })
      );
    } catch (error) {
      logger.error('Failed to save trial state', { error });
    }
  }
}

/**
 * React hook for trial management
 */
export function useTrial(config: TrialConfig) {
  const [trialState, setTrialState] = useState<TrialState>({
    isTrialActive: false,
    trialStartDate: null,
    trialEndDate: null,
    daysRemaining: config.trialDays,
    daysUsed: 0,
    isExpired: false,
  });

  const [service] = useState(() => new TrialService(config));

  useEffect(() => {
    service.initialize().then((state) => {
      setTrialState(state);
    });

    // Update state periodically
    const interval = setInterval(() => {
      const state = service.getState();
      setTrialState(state);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const endTrial = async () => {
    await service.endTrial();
    setTrialState(service.getState());
  };

  const resetTrial = async () => {
    await service.resetTrial();
    setTrialState(service.getState());
  };

  const shouldShowPaywall = () => {
    return service.isExpired() || service.getDaysRemaining() === 0;
  };

  return {
    ...trialState,
    isTrialActive: service.isTrialActive(),
    isExpired: service.isExpired(),
    daysRemaining: service.getDaysRemaining(),
    daysUsed: service.getDaysUsed(),
    endTrial,
    resetTrial,
    shouldShowPaywall,
  };
}
