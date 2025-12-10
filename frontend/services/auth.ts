import { api } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  ci_number?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    return api.post('/auth/login/', data);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return api.post('/auth/register/', data);
  },

  async getUser(token: string): Promise<User> {
    return api.get('/auth/user/', token);
  },
};