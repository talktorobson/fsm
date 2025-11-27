/**
 * Authentication Context
 * Manages user authentication state and SSO integration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth-service';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: () => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, accessToken, refreshToken } = await authService.login(email, password);

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Transform user data to match frontend User type
      // API returns: roles[] array, frontend expects: role (single)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData = loggedInUser as any;
      const normalizedUser: User = {
        id: userData.id || userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: Array.isArray(userData.roles) ? userData.roles[0] : userData.role,
        countryCode: userData.countryCode || 'FR',
        businessUnit: userData.businessUnit || 'RETAIL',
        permissions: userData.permissions || [],
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
      };
      
      setUser(normalizedUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithSSO = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.loginWithSSO();
    } catch (error) {
      console.error('SSO login failed:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  }, []);

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const checkRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithSSO,
    logout,
    checkPermission,
    checkRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
