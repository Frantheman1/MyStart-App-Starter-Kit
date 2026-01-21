/**
 * Environment Configuration
 * 
 * Manages different environments (dev, stage, prod) and their respective configurations.
 * 
 * Usage:
 *   import { config } from '@/config/env';
 *   console.log(config.apiUrl);
 */

export type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  env: Environment;
  apiUrl: string;
  apiTimeout: number;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  featureFlags: {
    [key: string]: boolean;
  };
}

// Detect environment (you can also use expo-constants for this)
const getEnvironment = (): Environment => {
  // In a real app, you might use process.env.APP_ENV or expo-constants
  // For now, default to development
  if (__DEV__) {
    return 'development';
  }
  // You can add logic here to distinguish staging from production
  // e.g., by checking expo-constants releaseChannel
  return 'production';
};

const developmentConfig: EnvConfig = {
  env: 'development',
  apiUrl: 'http://localhost:3000/api',
  apiTimeout: 30000,
  enableAnalytics: false,
  enableCrashReporting: false,
  logLevel: 'debug',
  featureFlags: {
    newFeature: true,
    betaFeature: true,
  },
};

const stagingConfig: EnvConfig = {
  env: 'staging',
  apiUrl: 'https://staging-api.yourdomain.com/api',
  apiTimeout: 30000,
  enableAnalytics: true,
  enableCrashReporting: true,
  logLevel: 'info',
  featureFlags: {
    newFeature: true,
    betaFeature: true,
  },
};

const productionConfig: EnvConfig = {
  env: 'production',
  apiUrl: 'https://api.yourdomain.com/api',
  apiTimeout: 30000,
  enableAnalytics: true,
  enableCrashReporting: true,
  logLevel: 'error',
  featureFlags: {
    newFeature: false,
    betaFeature: false,
  },
};

const envConfigs: Record<Environment, EnvConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Export the active configuration
export const config = envConfigs[getEnvironment()];

// Helper to check if a feature flag is enabled
export const isFeatureEnabled = (featureName: string): boolean => {
  return config.featureFlags[featureName] ?? false;
};
