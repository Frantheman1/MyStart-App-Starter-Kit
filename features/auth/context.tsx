/**
 * Auth Context
 * 
 * Provides authentication state and methods throughout the app.
 * 
 * Usage:
 *   const { user, login, logout } = useAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'expo-router';
import { authApi } from './api';
import { secureStorage, STORAGE_KEYS } from '@/lib/storage/secure-storage';
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  SocialAuthProvider,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  User,
  AuthTokens,
} from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Auto refresh tokens before they expire
  useEffect(() => {
    if (!state.tokens) return;

    const expiresIn = state.tokens.expiresIn;
    const refreshTime = (expiresIn - 60) * 1000; // Refresh 1 minute before expiry

    const timer = setTimeout(() => {
      refreshTokens();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [state.tokens]);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        secureStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData) as User;
        const tokens = {
          accessToken,
          refreshToken,
          expiresIn: 3600, // Default 1 hour
        };

        setState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const storeAuth = async (user: User, tokens: AuthTokens) => {
    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      secureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
    ]);
  };

  const clearAuth = async () => {
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      secureStorage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { user, tokens } = await authApi.login(credentials);
      await storeAuth(user, tokens);
      
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { user, tokens } = await authApi.register(credentials);
      await storeAuth(user, tokens);
      
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const loginWithSocial = useCallback(async (provider: SocialAuthProvider) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const { user, tokens } = await authApi.loginWithSocial(provider);
      await storeAuth(user, tokens);
      
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.tokens?.refreshToken) {
        await authApi.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await clearAuth();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.replace('/');
    }
  }, [state.tokens, router]);

  const refreshTokens = useCallback(async () => {
    try {
      if (!state.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokens = await authApi.refreshToken(state.tokens.refreshToken);
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

      setState((prev) => ({
        ...prev,
        tokens,
      }));
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      await logout();
    }
  }, [state.tokens, logout]);

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.resetPassword(request);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset password failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const confirmResetPassword = useCallback(async (request: ResetPasswordConfirm) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.confirmResetPassword(request);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Confirm reset password failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (request: ChangePasswordRequest) => {
    try {
      if (!state.tokens?.accessToken) {
        throw new Error('Not authenticated');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.changePassword(request, state.tokens.accessToken);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Change password failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [state.tokens]);

  const deleteAccount = useCallback(async () => {
    try {
      if (!state.tokens?.accessToken) {
        throw new Error('Not authenticated');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await authApi.deleteAccount(state.tokens.accessToken);
      await logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete account failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [state.tokens, logout]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginWithSocial,
    logout,
    refreshTokens,
    resetPassword,
    confirmResetPassword,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
