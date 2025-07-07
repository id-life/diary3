'use client';

import { cloudBackupDialogOpenAtom } from '@/atoms/app';
import GitHubUserCard from '@/components/auth/GitHubUserCard';
import Button from '@/components/button';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import LoginForm from '@/components/my/LoginForm';
import { selectLoginUser, useAppSelector } from '@/entry/store';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import { useSetAtom } from 'jotai';
import { AiFillGithub } from 'react-icons/ai';

export default function SettingsPage() {
  const loginUser = useAppSelector(selectLoginUser);
  const { isSignedIn, user } = useUser();
  const setCloudBackupOpen = useSetAtom(cloudBackupDialogOpenAtom);
  const gitHubAuth = useGitHubOAuth();

  console.log({ loginUser, isSignedIn, user, gitHubAuth });

  const handleGitHubLogin = () => {
    gitHubAuth.login();
  };

  const handleGitHubLogout = () => {
    gitHubAuth.logout();
  };

  const handleTestProtectedRoute = async () => {
    await gitHubAuth.testProtectedRoute();
  };

  return (
    <div className={clsx('flex h-full flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center')}>
      <ClientOnly>{loginUser?.uid ? <GlobalStats /> : <LoginForm />}</ClientOnly>
      <SignedOut>
        <SignInButton>登录</SignInButton>
        <SignUpButton>注册</SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
        <Button
          size="large"
          className="h-12 rounded-full border-none hover:opacity-90"
          onClick={() => {
            setCloudBackupOpen(true);
          }}
          type="default"
        >
          查看云端备份
        </Button>
      </SignedIn>

      {/* GitHub OAuth Section */}
      <div className="mt-6 w-full max-w-md rounded-lg border-t border-white/20 bg-white/10 p-4 backdrop-blur-sm">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
          <AiFillGithub className="h-5 w-5" />
          新后端 GitHub OAuth 测试
        </h3>

        {gitHubAuth.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex animate-pulse items-center gap-2 text-white/70">
              <div className="h-4 w-4 animate-bounce rounded-full bg-white/20"></div>
              <span>加载中...</span>
            </div>
          </div>
        ) : gitHubAuth.isAuthenticated && gitHubAuth.user ? (
          <GitHubUserCard user={gitHubAuth.user} onTestApi={handleTestProtectedRoute} onLogout={handleGitHubLogout} />
        ) : (
          <div className="space-y-3">
            <Button className="flex w-full items-center justify-center gap-2 py-3" onClick={handleGitHubLogin} type="primary">
              <AiFillGithub className="h-5 w-5" />
              GitHub OAuth 登录
            </Button>
            <p className="text-center text-xs text-white/60">点击登录连接到新的后端API服务</p>
          </div>
        )}
      </div>
    </div>
  );
}
