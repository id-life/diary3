import { getUserProfile } from '@/api/auth';
import { githubUserStateAtom } from '@/atoms/user';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';
import { NEXT_PUBLIC_API_PREFIX } from '@/constants/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccessToken } from './app';

const userQueryKey = 'fetch_user_profile';

export const useGitHubOAuth = () => {
  const queryClient = useQueryClient();
  const [githubUserState, setGithubUserState] = useAtom(githubUserStateAtom);
  const [legacyLoginUser, setLegacyLoginUser] = useAtom(legacyLoginUserAtom);
  const { accessToken, setAccessToken } = useAccessToken();

  const userQuery = useQuery({
    queryKey: [userQueryKey, accessToken],
    queryFn: getUserProfile,
    enabled: !!accessToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      setAccessToken(null);
      setLegacyLoginUser(null);
      queryClient.setQueryData([userQueryKey, null], null);
      queryClient.removeQueries({ queryKey: [userQueryKey] });
    },
    onSuccess: () => {
      if (!toast.isActive('logout-toast')) {
        toast.success('Logout success', { toastId: 'logout-toast' });
      }
      setGithubUserState({ isAuthenticated: false, user: null, token: null, isLoading: false });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    },
  });

  const { mutate: logout } = logoutMutation;

  useEffect(() => {
    if (userQuery.isError && (userQuery.error as any)?.response?.status === 401) {
      logout();
      return;
    }

    const isAuthenticated = !!accessToken;
    const isLoading = isAuthenticated && userQuery.isLoading;
    const user = userQuery.data || null;

    setGithubUserState({
      isAuthenticated,
      user,
      token: accessToken,
      isLoading,
    });
  }, [accessToken, userQuery.data, userQuery.isLoading, userQuery.isError, userQuery.error, setGithubUserState, logout]);

  useEffect(() => {
    const user = userQuery.data;
    if (user && !legacyLoginUser) {
      const now = Date.now();
      console.log(`Setting initial local loginTime for user ${user.username}`);
      setLegacyLoginUser({
        uid: user.username,
        loginTime: now,
        lastUseTime: now,
        email: user.email,
      });
    }
  }, [userQuery.data, legacyLoginUser, setLegacyLoginUser]);

  const login = useCallback(() => {
    try {
      window.location.href = NEXT_PUBLIC_API_PREFIX + '/auth/github';
    } catch (error) {
      console.error('GitHub OAuth Login Failed:', error);
      toast.error('GitHub OAuth Login Failed');
    }
  }, []);

  return {
    ...githubUserState,
    login,
    logout,
    isRefreshing: githubUserState.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
  };
};
