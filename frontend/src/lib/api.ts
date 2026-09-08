import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nova-backend-lvzw.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Resolves token across all common storage patterns
api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;

  if (!token && typeof window !== 'undefined') {
    try {
      const novaStorage = localStorage.getItem('nova-auth-storage');
      if (novaStorage) {
        const parsed = JSON.parse(novaStorage);
        token = parsed?.state?.token;
      }

      if (!token) {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      console.error('Failed to parse token from storage:', e);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Bulletproofed against undefined property crashes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Safety normalization for malformed error payloads
    if (error.response && error.response.data) {
      const data = error.response.data;
      // If errors is not an array, convert it or wipe it to prevent .map() crashes downstream
      if (data.errors && !Array.isArray(data.errors)) {
        data.errors = [];
      }
    }

    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const logout = useAuthStore.getState().logout;
        if (logout) logout();

        localStorage.removeItem('nova-auth-storage');
        localStorage.removeItem('token');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
