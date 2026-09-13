import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from './auth.types';

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore logout backend errors gracefully so local storage clean up always proceeds
    }
  },
};
