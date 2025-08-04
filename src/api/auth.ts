import instance from './request';

export interface GitHubUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  name: string;
  githubId?: string;
  githubSecret?: string;
  repo?: string;
  isAutoBackup?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: GitHubUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Login with username and password
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  return instance.post('/auth/login', credentials);
};

// Get current user profile
export const getUserProfile = async (): Promise<GitHubUser> => {
  const userProfile = (await instance.get('/auth/profile')) as any;

  if (userProfile && typeof userProfile.isAutoBachup !== 'undefined') {
    userProfile.isAutoBackup = userProfile.isAutoBachup;
    delete userProfile.isAutoBachup;
  }

  userProfile.isAutoBackup = !!userProfile?.isAutoBackup;

  return userProfile;
};

export const updateUserProfile = async (profileData: Partial<GitHubUser>): Promise<GitHubUser> => {
  const payload = {
    ...profileData,
    isAutoBachup: profileData.isAutoBackup,
  };
  // @ts-ignore
  delete payload.isAutoBackup;

  return instance.post('/auth/profile-update', payload);
};
