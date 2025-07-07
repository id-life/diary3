import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getUserProfile, GitHubUser } from '@/api/auth';
import { StorageKey } from '@/constants/storage';
import { useAtom } from 'jotai';
import { githubUserStateAtom } from '@/atoms/user';
import { NEXT_PUBLIC_AUTH_URL } from '@/constants/env';

export interface GitHubOAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  isLoading: boolean;
}

export const useGitHubOAuth = () => {
  const router = useRouter();
  const [state, setState] = useAtom(githubUserStateAtom);

  // Initialize and check for token in URL or localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in URL parameters (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
          // Store token and remove from URL
          localStorage.setItem(StorageKey.AUTH_TOKEN, tokenFromUrl);
          window.history.replaceState({}, document.title, window.location.pathname);

          // Show success message
          toast.success('GitHub登录成功！', {
            position: 'top-center',
            autoClose: 3000,
          });

          // Fetch user profile
          await fetchUserProfile(tokenFromUrl);
        } else {
          // Check for existing token in localStorage
          const storedToken = localStorage.getItem(StorageKey.AUTH_TOKEN);
          if (storedToken) {
            await fetchUserProfile(storedToken);
          } else {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Fetch user profile using token
  const fetchUserProfile = useCallback(async (token?: string) => {
    const authToken = token || localStorage.getItem(StorageKey.AUTH_TOKEN);

    if (!authToken) {
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const user = await getUserProfile();

      setState({
        isAuthenticated: true,
        user,
        token: authToken,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('获取用户信息失败:', error);

      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem(StorageKey.AUTH_TOKEN);
        toast.error('认证已过期，请重新登录');
      } else {
        toast.error('获取用户信息失败');
      }

      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  // Initiate GitHub OAuth login
  const login = useCallback(() => {
    try {
      router.push(NEXT_PUBLIC_AUTH_URL + '/auth/github');
    } catch (error) {
      console.error('GitHub OAuth Login Failed:', error);
      toast.error('GitHub OAuth Login Failed');
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(StorageKey.AUTH_TOKEN);
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    toast.success('已成功登出');
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (state.token) {
      await fetchUserProfile(state.token);
    }
  }, [state.token]);

  return {
    ...state,
    login,
    logout,
    refreshProfile,
  };
};
