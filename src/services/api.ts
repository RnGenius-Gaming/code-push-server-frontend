import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('[API Request Interceptor]', {
    url: config.url,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
    headers: config.headers
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API Request Interceptor] Added Authorization header');
  } else {
    console.warn('[API Request Interceptor] NO TOKEN IN LOCALSTORAGE!');
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized error:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        response: error.response?.data
      });
      // Temporarily disabled auto-logout for debugging
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};
