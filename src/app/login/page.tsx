'use client';

import { login } from '@/api/auth';
import Button from '@/components/button';
import { DiaryIconSVG } from '@/components/svg';
import { useAccessToken } from '@/hooks/app';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiFillApple, AiFillGithub, AiFillGoogleCircle } from 'react-icons/ai';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function LoginPage() {
  const gitHubAuth = useGitHubOAuth();
  const { setAccessToken } = useAccessToken();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGitHubLogin = () => {
    gitHubAuth.login();
  };

  const handleUsernamePasswordLogin = async () => {
    if (!username || !password) return;

    setIsLoggingIn(true);
    try {
      const response = await login({ username, password });
      setAccessToken(response.access_token);
      setUsername('');
      setPassword('');
      // Redirect to home page after successful login
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If user is authenticated, redirect to home page
  useEffect(() => {
    if (gitHubAuth.isAuthenticated && gitHubAuth.user) {
      router.push('/');
    }
  }, [gitHubAuth.isAuthenticated, gitHubAuth.user, router]);

  // If user is authenticated, show loading while redirecting
  if (gitHubAuth.isAuthenticated && gitHubAuth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white">
        <div>Redirecting...</div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white px-6 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <DiaryIconSVG className="size-6" />
            <h1 className="text-2xl font-bold text-gray-900">Diary</h1>
          </div>
        </div>

        {/* Form Title */}
        <h2 className="mb-8 text-center text-xl font-semibold text-gray-900">{isSignUp ? 'Sign up' : 'Login or Sign up'}</h2>

        {/* Form */}
        <div className="space-y-4">
          {/* Username/Email Input */}
          <div>
            <input
              type="text"
              placeholder={isSignUp ? 'Email or Phone Number' : 'User Name or Phone Number'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border-0 bg-gray-100 px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-0 bg-gray-100 px-4 py-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full py-4 text-white"
            onClick={handleUsernamePasswordLogin}
            type="primary"
            disabled={!username || !password || isLoggingIn}
            style={{ backgroundColor: '#2D3748', borderColor: '#2D3748' }}
          >
            {isLoggingIn ? 'Loading...' : isSignUp ? 'Continue' : 'Sign in'}
          </Button>

          {/* Sign up toggle and forgot password */}
          {!isSignUp && (
            <div className="flex items-center justify-between text-sm">
              <button onClick={() => setIsSignUp(true)} className="text-blue-600 hover:text-blue-800">
                sign up
              </button>
              <button className="text-blue-600 hover:text-blue-800">Forget password?</button>
            </div>
          )}

          {/* OR divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-6">
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg">
              <AiFillGoogleCircle className="h-6 w-6 text-red-500" />
            </button>
            <button
              onClick={handleGitHubLogin}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <AiFillGithub className="h-6 w-6 text-gray-900" />
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg">
              <AiFillApple className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
