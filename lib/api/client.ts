/**
 * API Client
 * 
 * Centralized HTTP client with interceptors for auth, retry, and error handling.
 * 
 * Usage:
 *   import { apiClient } from '@/lib/api/client';
 *   const data = await apiClient.get('/users');
 */

import { config } from '@/config';
import { secureStorage, STORAGE_KEYS } from '@/lib/storage/secure-storage';

export interface RequestConfig extends RequestInit {
  retries?: number;
  timeout?: number;
  skipAuth?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * Get access token from storage
   */
  private async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from storage
   */
  private async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        
        await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) {
          await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        return accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Add auth headers to request
   */
  private async addAuthHeaders(
    headers: HeadersInit = {},
    skipAuth: boolean = false
  ): Promise<HeadersInit> {
    const headersObj = new Headers(headers);

    if (!skipAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headersObj.set('Authorization', `Bearer ${token}`);
      }
    }

    return headersObj;
  }

  /**
   * Make a request with timeout
   */
  private async requestWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const timeout = config.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Make a request with retry logic
   */
  private async requestWithRetry(
    url: string,
    config: RequestConfig,
    attempt: number = 0
  ): Promise<Response> {
    const maxRetries = config.retries ?? 2;

    try {
      const response = await this.requestWithTimeout(url, config);

      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && !config.skipAuth && attempt === 0) {
        try {
          const newToken = await this.refreshAccessToken();
          const newHeaders = new Headers(config.headers);
          newHeaders.set('Authorization', `Bearer ${newToken}`);
          
          // Retry with new token
          return this.requestWithRetry(
            url,
            { ...config, headers: newHeaders },
            attempt + 1
          );
        } catch (refreshError) {
          // Refresh failed, return original 401
          return response;
        }
      }

      // If network error and we have retries left
      if (!response.ok && response.status >= 500 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(url, config, attempt + 1);
      }

      return response;
    } catch (error) {
      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.addAuthHeaders(
      {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      config.skipAuth
    );

    const response = await this.requestWithRetry(url, { ...config, headers });

    if (!response.ok) {
      const error: ApiError = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        // Response body is not JSON
      }
      throw error;
    }

    // Handle no content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(config.apiUrl, config.apiTimeout);
