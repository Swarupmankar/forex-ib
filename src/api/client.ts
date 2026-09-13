import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from './endpoints';
import { authStorage } from '../auth/auth.storage';
import { isTokenExpired } from '../auth/auth.tokens';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: 401 & Single-flight Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isAuthUrl =
      originalRequest.url?.includes(ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH);

    // If 401 on non-auth endpoint and hasn't been retried yet
    if (is401 && !originalRequest._retry && !isAuthUrl) {
      originalRequest._retry = true;

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken || isTokenExpired(refreshToken, 0)) {
        // No valid refresh token available, wipe session
        authStorage.clearAll();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      // Single-flight refresh token queue
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshResponse = await axios.post(`${baseURL}${ENDPOINTS.AUTH.REFRESH}`, {
              refreshToken,
            });
            const newAccessToken = refreshResponse.data?.tokens?.access?.token;
            const newRefreshToken = refreshResponse.data?.tokens?.refresh?.token;

            if (newAccessToken) {
              authStorage.setTokens(newAccessToken, newRefreshToken);
              return newAccessToken;
            }
            throw new Error('Invalid token response');
          } catch (refreshErr) {
            authStorage.clearAll();
            window.dispatchEvent(new Event('auth:unauthorized'));
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
