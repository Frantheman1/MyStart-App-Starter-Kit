/**
 * Onboarding Context
 * 
 * Manages onboarding state and interactive tours.
 * 
 * Usage:
 *   const { startTour, showTour, currentStep } = useOnboarding();
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureStorage } from '@/lib/storage/secure-storage';
import { logger } from '@/lib/logging/logger';
import type { OnboardingContextType, OnboardingState, TourStep } from './types';

const ONBOARDING_STORAGE_KEY = 'onboarding_state';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    isCompleted: false,
    currentStep: 0,
    completedSteps: [],
    showTour: false,
    tourSteps: [],
  });

  // Load onboarding state on mount
  useEffect(() => {
    loadOnboardingState();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    saveOnboardingState();
  }, [state.isCompleted, state.completedSteps]);

  const loadOnboardingState = async () => {
    try {
      const stored = await secureStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const savedState = JSON.parse(stored);
        setState((prev) => ({
          ...prev,
          isCompleted: savedState.isCompleted || false,
          completedSteps: savedState.completedSteps || [],
        }));
        logger.info('Onboarding state loaded', { isCompleted: savedState.isCompleted });
      }
    } catch (error) {
      logger.error('Failed to load onboarding state', { error });
    }
  };

  const saveOnboardingState = async () => {
    try {
      const stateToSave = {
        isCompleted: state.isCompleted,
        completedSteps: state.completedSteps,
      };
      await secureStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      logger.error('Failed to save onboarding state', { error });
    }
  };

  const startTour = (steps: TourStep[]) => {
    setState((prev) => ({
      ...prev,
      showTour: true,
      tourSteps: steps,
      currentStep: 0,
    }));
    logger.info('Tour started', { totalSteps: steps.length });
  };

  const nextStep = () => {
    setState((prev) => {
      const nextIndex = prev.currentStep + 1;
      if (nextIndex >= prev.tourSteps.length) {
        // Tour completed
        return {
          ...prev,
          showTour: false,
          currentStep: 0,
          tourSteps: [],
        };
      }
      return {
        ...prev,
        currentStep: nextIndex,
      };
    });
  };

  const previousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  };

  const skipTour = () => {
    setState((prev) => ({
      ...prev,
      showTour: false,
      currentStep: 0,
      tourSteps: [],
    }));
    logger.info('Tour skipped');
  };

  const completeTour = () => {
    setState((prev) => ({
      ...prev,
      showTour: false,
      currentStep: 0,
      tourSteps: [],
    }));
    logger.info('Tour completed');
  };

  const completeOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isCompleted: true,
    }));
    logger.info('Onboarding completed');
  };

  const resetOnboarding = async () => {
    setState({
      isCompleted: false,
      currentStep: 0,
      completedSteps: [],
      showTour: false,
      tourSteps: [],
    });
    await secureStorage.removeItem(ONBOARDING_STORAGE_KEY);
    logger.info('Onboarding reset');
  };

  const markStepCompleted = (stepId: string) => {
    setState((prev) => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])],
    }));
    logger.debug('Step marked as completed', { stepId });
  };

  const value: OnboardingContextType = {
    ...state,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    completeOnboarding,
    resetOnboarding,
    markStepCompleted,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
