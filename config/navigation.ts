/**
 * Navigation Configuration
 * 
 * Deep linking and navigation structure configuration.
 * 
 * Deep linking examples:
 *   mystart://modal
 *   mystart://tabs/explore
 *   mystart://profile/123
 */

export const DEEP_LINK_PREFIXES = [
  'mystart://',
  'https://mystart.app',
  'https://*.mystart.app',
];

export const NAVIGATION_CONFIG = {
  screens: {
    '(tabs)': {
      screens: {
        index: 'home',
        explore: 'explore',
      },
    },
    modal: 'modal',
    // Add more screens as you build features
    // 'profile': 'profile/:id',
    // 'settings': 'settings',
  },
};

// Navigation references (useful for navigating from anywhere)
export const ROUTES = {
  HOME: '/(tabs)/',
  EXPLORE: '/(tabs)/explore',
  MODAL: '/modal',
  // Add more routes here
} as const;
