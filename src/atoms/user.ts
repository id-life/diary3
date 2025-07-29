import { GitHubUser } from '@/api/auth';
import { atom } from 'jotai';
import { LegacyLoginUser, userDataMapAtom } from './databaseFirst';

export interface GitHubOAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  isLoading: boolean;
}

export const githubUserStateAtom = atom<GitHubOAuthState>({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
});

export const currentLoginUserAtom = atom<LegacyLoginUser | null>((get) => {
  const githubUserState = get(githubUserStateAtom);
  const userDataMap = get(userDataMapAtom);

  if (!githubUserState.isAuthenticated || !githubUserState.user) {
    return null;
  }

  return userDataMap[githubUserState.user.id] || null;
});
