import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { authApi, GitHubUser } from '@/api/auth';

export interface GitHubOAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  isLoading: boolean;
}

export const useGitHubOAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<GitHubOAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  // Initialize and check for token in URL or localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in URL parameters (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
          // Store token and remove from URL
          localStorage.setItem('authToken', tokenFromUrl);
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
          const storedToken = localStorage.getItem('authToken');
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
  const fetchUserProfile = async (token?: string) => {
    const authToken = token || localStorage.getItem('authToken');

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
      const user = await authApi.getUserProfile();

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
        localStorage.removeItem('authToken');
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
  };

  // Initiate GitHub OAuth login
  const login = useCallback(() => {
    try {
      authApi.initiateGitHubLogin();
    } catch (error) {
      console.error('启动GitHub登录失败:', error);
      toast.error('启动GitHub登录失败');
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    toast.success('已成功登出');
  }, []);

  // Test protected API call
  const testProtectedRoute = useCallback(async () => {
    if (!state.isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    try {
      const result = await authApi.testProtectedRoute();
      toast.success('受保护路由测试成功！', {
        position: 'top-center',
        autoClose: 2000,
      });
      console.log('受保护路由测试结果:', result);
      return result;
    } catch (error: any) {
      console.error('受保护路由测试失败:', error);
      if (error.response?.status === 404) {
        toast.info('受保护路由端点不存在，但认证正常工作', {
          position: 'top-center',
          autoClose: 3000,
        });
      } else if (error.response?.status === 401) {
        toast.error('认证失败，请重新登录');
        localStorage.removeItem('authToken');
        setState((prev) => ({ ...prev, isAuthenticated: false, user: null, token: null }));
      } else {
        toast.error(`API测试失败: ${error.response?.status || '网络错误'}`);
      }
    }
  }, [state.isAuthenticated]);

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
    testProtectedRoute,
    refreshProfile,
  };
};
