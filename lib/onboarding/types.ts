/**
 * Onboarding Types
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // Ref name of element to highlight
  position?: 'top' | 'bottom' | 'center';
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  completedSteps: string[];
  showTour: boolean;
  tourSteps: TourStep[];
}

export interface OnboardingContextType extends OnboardingState {
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  markStepCompleted: (stepId: string) => void;
}
