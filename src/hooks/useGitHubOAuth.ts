import { getUserProfile, GitHubUser } from '@/api/auth';
import { githubUserStateAtom } from '@/atoms/user';
import { legacyLoginUserAtom, userDataMapAtom } from '@/atoms/databaseFirst';
import { NEXT_PUBLIC_API_PREFIX } from '@/constants/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccessToken } from './app';

const userQueryKey = 'fetch_user_profile';

export const useGitHubOAuth = () => {
  const queryClient = useQueryClient();
  const [githubUserState, setGithubUserState] = useAtom(githubUserStateAtom);
  const [userDataMap, setUserDataMap] = useAtom(userDataMapAtom);
  const { accessToken, setAccessToken } = useAccessToken();

  const userQuery = useQuery({
    queryKey: [userQueryKey, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No access token');
      }
      return await getUserProfile();
    },
    enabled: !!accessToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      setAccessToken(null);
      queryClient.removeQueries({ queryKey: [userQueryKey] });
    },
    onSuccess: () => {
      toast.success('Logout success');
      setGithubUserState({ isAuthenticated: false, user: null, token: null, isLoading: false });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    },
  });

  const { mutate: logout } = logoutMutation;

  useEffect(() => {
    if (userQuery.isError) {
      const error = userQuery.error as any;
      console.error('Get user profile failed:', error);
      logout();
    }
  }, [userQuery.isError, userQuery.error, logout]);

  useEffect(() => {
    const isLoading = !!accessToken && userQuery.isLoading;
    const user = userQuery.data || null;
    const isAuthenticated = !!accessToken && !!user;

    if (isAuthenticated && user) {
      setUserDataMap((prevMap) => {
        const existingUserData = prevMap[user.id];
        const now = Date.now();

        if (existingUserData) {
          if (existingUserData.lastUseTime !== now) {
            return {
              ...prevMap,
              [user.id]: { ...existingUserData, lastUseTime: now },
            };
          }
          return prevMap;
        } else {
          console.log(`Creating new user record for ${user.username}`);
          return {
            ...prevMap,
            [user.id]: {
              uid: user.username,
              loginTime: now,
              lastUseTime: now,
              email: user.email,
            },
          };
        }
      });
    }

    setGithubUserState({
      isAuthenticated,
      user,
      token: accessToken,
      isLoading,
    });
  }, [accessToken, userQuery.isLoading, userQuery.data, setGithubUserState, setUserDataMap]);
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
    isRefreshing: userQuery.isFetching,
    isError: userQuery.isError,
    error: userQuery.error,
  };
};
