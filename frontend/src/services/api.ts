import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Agregar JWT token a todas las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('mariabags_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Manejar errores de autenticación
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('mariabags_token');
      localStorage.removeItem('mariabags_user');

      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('mariabags_redirect', window.location.pathname + window.location.search);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
