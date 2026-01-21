/**
 * Auth Guards
 * 
 * Components to protect routes and control access.
 * 
 * Usage:
 *   <ProtectedRoute>
 *     <YourProtectedScreen />
 *   </ProtectedRoute>
 */

import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './context';
import { Loader } from '@/components/ui/loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protects a route - redirects to login if not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo as any);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Guest-only route - redirects to home if already authenticated
 */
export function GuestOnlyRoute({
  children,
  redirectTo = '/',
}: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo as any);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to automatically handle auth navigation
 * Place in root layout to handle auth state changes globally
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Note: This hook is a placeholder for custom protected route logic
    // Adapt the segments check based on your actual route structure
    const inAuthGroup = segments.length > 0 && String(segments[0]) === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth routes
      // Note: Adjust route path based on your app structure
      router.replace('/' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth routes
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);
}
