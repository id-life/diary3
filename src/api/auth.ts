import instance from './request';

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

// Get current user profile
export const getUserProfile = async (): Promise<GitHubUser> => {
  return instance.get('/auth/profile');
};
