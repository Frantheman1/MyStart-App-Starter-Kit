import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { StoreProvider } from '@/store';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/lib/errors/error-boundary';
import { I18nProvider } from '@/lib/i18n';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog';
import { OnboardingProvider } from '@/lib/onboarding';
import { TourOverlay } from '@/lib/onboarding/tour-overlay';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <I18nProvider>
        <OnboardingProvider>
          <StoreProvider>
            <ToastProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
                <OfflineBanner />
                <TourOverlay />
                <ConfirmDialogProvider />
              </ThemeProvider>
            </ToastProvider>
          </StoreProvider>
        </OnboardingProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
