/**
 * Auth Types
 * 
 * TypeScript types and interfaces for authentication.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface SocialAuthProvider {
  provider: 'google' | 'apple' | 'facebook';
  idToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithSocial: (provider: SocialAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  confirmResetPassword: (request: ResetPasswordConfirm) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
