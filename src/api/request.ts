import { StorageKey } from '@/constants/storage';
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PREFIX,
  timeout: 10000,
});

// Add authorization header if token exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(StorageKey.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Auth API Error:', error);
    return Promise.reject(error);
  },
);

export default instance;
