/**
 * Authentication Service
 * Handles login, SSO, token management, and user info
 */

import apiClient from './api-client';
import { User } from '@/types';
import { env } from '@/config/env';

interface ApiResponse<T> {
  data: T;
  meta: any;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service.
 *
 * Handles login, SSO, token management, and retrieval of user information.
 */
class AuthService {
  /**
   * Logs in with email and password (fallback for development).
   *
   * @param email - User's email.
   * @param password - User's password.
   * @returns {Promise<LoginResponse>} The login response containing tokens and user data.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  /**
   * Initiates login with SSO (PingID).
   * Redirects the user to the SSO provider.
   *
   * @returns {Promise<void>}
   */
  async loginWithSSO(): Promise<void> {
    // Build authorization URL
    const params = new URLSearchParams({
      client_id: env.auth.clientId,
      redirect_uri: env.auth.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: crypto.randomUUID(), // CSRF protection
    });

    const authUrl = `${env.auth.ssoIssuer}/authorize?${params.toString()}`;

    // Store state for validation
    sessionStorage.setItem('oauth_state', params.get('state') || '');

    // Redirect to SSO provider
    window.location.href = authUrl;
  }

  /**
   * Handles the SSO callback.
   * Exchanges the authorization code for tokens.
   *
   * @param code - The authorization code from the SSO provider.
   * @param state - The state parameter for CSRF protection.
   * @returns {Promise<LoginResponse>} The login response containing tokens and user data.
   * @throws {Error} If the state parameter is invalid.
   */
  async handleSSOCallback(code: string, state: string): Promise<LoginResponse> {
    // Validate state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    sessionStorage.removeItem('oauth_state');

    // Exchange code for tokens
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/sso/callback', {
      code,
      redirectUri: env.auth.redirectUri,
    });

    return response.data.data;
  }

  /**
   * Retrieves current user information.
   *
   * @returns {Promise<User>} The current user details.
   */
  async getCurrentUser(): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<ApiResponse<any>>('/auth/me');
    const data = response.data.data;
    
    // Transform API response to match frontend User type
    // API returns: userId, roles[], userType
    // Frontend expects: id, role (single), permissions[]
    return {
      id: data.userId || data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: Array.isArray(data.roles) ? data.roles[0] : data.role,
      countryCode: data.countryCode || 'FR',
      businessUnit: data.businessUnit || 'RETAIL',
      permissions: data.permissions || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    } as User;
  }

  /**
   * Refreshes the access token using the stored refresh token.
   *
   * @returns {Promise<{ accessToken: string }>} The new access token.
   * @throws {Error} If no refresh token is available.
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });

    return response.data.data;
  }

  /**
   * Logs out the user.
   * Calls the logout API and cleans up local storage.
   *
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }
  }
}

export const authService = new AuthService();
