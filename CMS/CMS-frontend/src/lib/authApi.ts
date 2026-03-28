import { api } from '@/lib/apiClient';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),

  logout: () => api.post<void>('/auth/logout', {}),

  me: () => api.get<AuthUser>('/auth/me'),
};
