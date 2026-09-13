import { authApi } from './auth.api';
import { authStorage } from './auth.storage';
import { isTokenExpired, decodeToken } from './auth.tokens';
import type { LoginRequest, LoginResponse, User } from './auth.types';

export interface InitAuthResult {
  user: User | null;
  isAuthenticated: boolean;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = await authApi.login(credentials);

    if (data.tokens?.access?.token) {
      authStorage.setTokens(data.tokens.access.token, data.tokens.refresh?.token);
    }
    if (data.user) {
      authStorage.setUser(data.user);
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      authStorage.clearAll();
    }
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken || isTokenExpired(refreshToken, 0)) {
      authStorage.clearAll();
      return null;
    }

    try {
      const data = await authApi.refresh(refreshToken);
      const newAccessToken = data.tokens?.access?.token;
      const newRefreshToken = data.tokens?.refresh?.token;

      if (newAccessToken) {
        authStorage.setTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
      }
      authStorage.clearAll();
      return null;
    } catch {
      authStorage.clearAll();
      return null;
    }
  },

  async initialize(): Promise<InitAuthResult> {
    let storedUser = authStorage.getUser();
    const accessToken = authStorage.getAccessToken();

    if (!accessToken) {
      authStorage.clearAll();
      return { user: null, isAuthenticated: false };
    }

    if (!storedUser) {
      const decoded = decodeToken(accessToken);
      if (decoded) {
        storedUser = {
          id: decoded.id || decoded.sub || 1,
          email: (decoded.email as string) || 'partner@example.com',
          firstName: 'Partner',
          lastName: 'User',
        };
        authStorage.setUser(storedUser);
      }
    }

    if (!isTokenExpired(accessToken)) {
      return { user: storedUser, isAuthenticated: true };
    }

    // Access token is expired, try to refresh
    const newAccessToken = await this.refreshToken();
    if (newAccessToken) {
      return { user: authStorage.getUser() || storedUser, isAuthenticated: true };
    }

    // Fallback: if access token exists, keep session active
    if (accessToken && storedUser) {
      return { user: storedUser, isAuthenticated: true };
    }

    return { user: null, isAuthenticated: false };
  },
};
