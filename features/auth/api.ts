/**
 * Auth API
 * 
 * API calls for authentication.
 * These are placeholder implementations - connect to your backend API.
 */

import { config } from '@/config';
import type {
  LoginCredentials,
  RegisterCredentials,
  SocialAuthProvider,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  User,
  AuthTokens,
} from './types';

const API_URL = config.apiUrl;

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const authApi = {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: Connect to your backend
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(
    credentials: RegisterCredentials
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: Connect to your backend
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async loginWithSocial(
    provider: SocialAuthProvider
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: Connect to your backend
    return apiRequest('/auth/social', {
      method: 'POST',
      body: JSON.stringify(provider),
    });
  },

  async refreshToken(
    refreshToken: string
  ): Promise<AuthTokens> {
    // TODO: Connect to your backend
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async logout(refreshToken: string): Promise<void> {
    // TODO: Connect to your backend
    await apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    // TODO: Connect to your backend
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async confirmResetPassword(request: ResetPasswordConfirm): Promise<void> {
    // TODO: Connect to your backend
    await apiRequest('/auth/reset-password/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async changePassword(
    request: ChangePasswordRequest,
    accessToken: string
  ): Promise<void> {
    // TODO: Connect to your backend
    await apiRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });
  },

  async deleteAccount(accessToken: string): Promise<void> {
    // TODO: Connect to your backend
    await apiRequest('/auth/delete-account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async getProfile(accessToken: string): Promise<User> {
    // TODO: Connect to your backend
    return apiRequest('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
