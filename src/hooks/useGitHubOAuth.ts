import { getUserProfile, GitHubUser } from '@/api/auth';
import { githubUserStateAtom } from '@/atoms/user';
import { NEXT_PUBLIC_API_PREFIX } from '@/constants/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccessToken } from './app';

export interface GitHubOAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  isLoading: boolean;
}
const userQueryKey = 'fetch_user_profile';
export const useGitHubOAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [githubUserState, setGithubUserState] = useAtom(githubUserStateAtom);
  const { accessToken, setAccessToken } = useAccessToken();

  // Query for user profile
  const userQuery = useQuery({
    queryKey: [userQueryKey, accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No access token');
      }
      return await getUserProfile();
    },
    enabled: !!accessToken, // Only run when we have a token
    retry: (failureCount, error: any) => {
      // Don't retry for 401 errors (invalid token)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation(
    async () => {
      // Clear access token
      setAccessToken(null);
      // Clear all queries
      queryClient.clear();
    },
    {
      onSuccess: () => {
        toast.success('Logout success');
      },
      onError: (error) => {
        console.error('Logout failed:', error);
        toast.error('Logout failed');
      },
    },
  );
  const { mutate: logout } = logoutMutation;
  // Update atom state based on query state
  useEffect(() => {
    const isLoading = userQuery.isLoading;
    const user = userQuery.data || null;
    const isAuthenticated = !!accessToken && !!user && !userQuery.isError;

    setGithubUserState({
      isAuthenticated,
      user,
      token: accessToken,
      isLoading,
    });
  }, [userQuery.isLoading, userQuery.data, userQuery.isError, accessToken, setGithubUserState]);

  // Handle query errors
  useEffect(() => {
    if (userQuery.isError) {
      const error = userQuery.error as any;
      console.error('Get user profile failed:', error);

      // Handle different error scenarios
      if (error?.response?.status === 401) {
        toast.error('Authentication expired, please login again');
        logout();
      } else {
        toast.error('Get user profile failed');
      }
    }
  }, [userQuery.isError, userQuery.error, setAccessToken, queryClient, logout]);

  // Initiate GitHub OAuth login
  const login = useCallback(() => {
    try {
      router.push(NEXT_PUBLIC_API_PREFIX + '/auth/github');
    } catch (error) {
      console.error('GitHub OAuth Login Failed:', error);
      toast.error('GitHub OAuth Login Failed');
    }
  }, [router]);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (accessToken) {
      await queryClient.invalidateQueries({ queryKey: [userQueryKey] });
    }
  }, [accessToken, queryClient]);

  return {
    ...githubUserState,
    login,
    logout,
    refreshProfile,
    // Expose additional React Query states for advanced usage
    isRefreshing: userQuery.isFetching,
    isError: userQuery.isError,
    error: userQuery.error,
  };
};
