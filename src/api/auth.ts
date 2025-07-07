import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PREFIX,
  timeout: 10000,
});

// Add authorization header if token exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
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

export interface GitHubUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: GitHubUser;
}

export const authApi = {
  // Initiate GitHub OAuth login
  initiateGitHubLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_PREFIX}/auth/github`;
  },

  // Get current user profile
  getUserProfile: async (): Promise<GitHubUser> => {
    return instance.get('/auth/profile');
  },

  // Test protected endpoint
  testProtectedRoute: async () => {
    return instance.get('/api/protected-endpoint');
  },
};

export default instance;
