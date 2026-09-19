import { createApiClient, setStoredToken, clearStoredToken, getStoredToken } from './api';
import { API_CONFIG } from '../config/api';
import { AuthLoginResponse, UserResponse } from '../types/api';

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const client = createApiClient();
      const response = await client.post<AuthLoginResponse>(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
        email,
        password,
      });

      if (response.data && response.data.access_token) {
        setStoredToken(response.data.access_token);
        return { success: true, token: response.data.access_token };
      }
      return { success: false, error: 'Login did not return a valid token' };
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : err.message || 'Login failed';
      return { success: false, error: message };
    }
  },

  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; user?: UserResponse; error?: string }> {
    try {
      const client = createApiClient();
      const response = await client.post<UserResponse>(API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
        email,
        password,
        full_name: fullName,
      });
      return { success: true, user: response.data };
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : err.message || 'Registration failed';
      return { success: false, error: message };
    }
  },

  async getMe(): Promise<{ success: boolean; user?: UserResponse; error?: string }> {
    try {
      const client = createApiClient();
      const response = await client.get<UserResponse>(API_CONFIG.ENDPOINTS.AUTH_ME);
      return { success: true, user: response.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  logout(): void {
    clearStoredToken();
  },

  getToken(): string | null {
    return getStoredToken();
  },

  isAuthenticated(): boolean {
    return Boolean(getStoredToken());
  },
};
