import { fetchApi } from './apiClient';
import { UserAuthResponse } from '../types/api';

// Shared localStorage keys used across all portals
const TOKEN_KEY   = 'auth_token';
const USER_KEY    = 'teacher_profile';  // Staff-specific profile key
const SHARED_USER = 'auth_user';        // Shared key written by student login

export const authService = {
  async login(email: string, password: string): Promise<UserAuthResponse> {
    const response = await fetchApi<UserAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      // Also write shared key so ProtectedRoute can read it
      localStorage.setItem(SHARED_USER, JSON.stringify(response.user));
    }
    return response;
  },

  async register(data: any): Promise<UserAuthResponse> {
    return fetchApi<UserAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SHARED_USER);
    // Redirect to centralised login
    window.location.href = 'http://localhost:5173/login';
  },

  getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem(SHARED_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
