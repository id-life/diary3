'use client';

import { login } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { DiaryIconSVG } from '@/components/svg';
import { useAccessToken } from '@/hooks/app';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiFillApple, AiFillGithub, AiFillGoogleCircle } from 'react-icons/ai';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function LoginPage() {
  const gitHubAuth = useGitHubOAuth();
  const { setAccessToken } = useAccessToken();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      console.log('Token found in URL, saving to localStorage...');
      setAccessToken(token);
      router.push('/settings');
    }
  }, [searchParams, setAccessToken, router]);

  useEffect(() => {
    if (!gitHubAuth.isLoading && gitHubAuth.isAuthenticated) {
      router.push('/');
    }
  }, [gitHubAuth.isAuthenticated, gitHubAuth.isLoading, router]);

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
    return null;
  }

  if (gitHubAuth.isLoading || gitHubAuth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[url('/imgs/login-bg.png')] bg-cover bg-center bg-no-repeat px-6 py-8">
      <div className="w-full max-w-[327px]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <DiaryIconSVG className="size-6" />
            <h1 className="font-belanosima text-[32px] text-diary-navy">Diary</h1>
          </div>
        </div>

        {/* Form Title */}
        <h2 className="mb-10 text-center text-xl font-semibold text-diary-navy">{isSignUp ? 'Sign up' : 'Login or Sign up'}</h2>

        {/* Form */}
        <div className="space-y-2">
          {/* Username/Email Input */}
          <div>
            <input
              type="text"
              placeholder={isSignUp ? 'Email or Phone Number' : 'User Name or Phone Number'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 w-full rounded-lg bg-diary-primary/5 px-4 py-5 text-diary-navy placeholder:text-diary-navy placeholder:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-5">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-lg border-0 bg-diary-primary/5 px-4 py-5 pr-12 text-diary-navy placeholder:text-diary-navy placeholder:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-diary-navy opacity-30 hover:opacity-60"
            >
              {showPassword ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            className="!mt-7 h-14 w-full rounded-lg border-diary-navy bg-diary-navy text-white"
            onClick={handleUsernamePasswordLogin}
            variant="primary"
            disabled={!username || !password || isLoggingIn}
          >
            {isLoggingIn ? 'Loading...' : isSignUp ? 'Continue' : 'Sign in'}
          </Button>

          {/* Sign up toggle and forgot password */}
          {!isSignUp && (
            <div className="flex items-center justify-between pt-5 text-sm">
              <button className="text-purple hover:brightness-110">Forget password?</button>
              <button onClick={() => setIsSignUp(true)} className="text-diary-navy hover:text-diary-navy-light">
                sign up
              </button>
            </div>
          )}

          {/* OR divider */}
          <div className="flex items-center gap-3 py-4">
            <div className="h-px flex-1 bg-diary-navy opacity-5"></div>
            <span className="text-xs text-diary-navy opacity-30">OR</span>
            <div className="h-px flex-1 bg-diary-navy opacity-5"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-9">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-diary-primary/5 transition-shadow hover:shadow-lg">
              <AiFillGoogleCircle className="h-6 w-6 text-red-500" />
            </button>
            <button
              onClick={handleGitHubLogin}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-diary-primary/5 transition-shadow hover:shadow-lg"
            >
              <AiFillGithub className="h-6 w-6 text-gray-900" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-diary-primary/5 transition-shadow hover:shadow-lg">
              <AiFillApple className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
