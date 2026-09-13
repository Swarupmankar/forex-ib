import type { User } from './auth.types';

const ACCESS_TOKEN_KEY = 'ib_access_token';
const REFRESH_TOKEN_KEY = 'ib_refresh_token';
const USER_KEY = 'ib_user_session';

export const authStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (err) {
      console.warn('Failed to save tokens to storage', err);
    }
  },

  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn('Failed to clear tokens from storage', err);
    }
  },

  getUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as User) : null;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to save user to storage', err);
    }
  },

  clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.warn('Failed to clear user from storage', err);
    }
  },

  clearAll(): void {
    this.clearTokens();
    this.clearUser();
  },
};
