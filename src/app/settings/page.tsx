'use client';

import GitHubUserCard from '@/components/auth/GitHubUserCard';
import Button from '@/components/button';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import clsx from 'clsx';
import { AiFillGithub } from 'react-icons/ai';

export default function SettingsPage() {
  const gitHubAuth = useGitHubOAuth();

  const handleGitHubLogin = () => {
    gitHubAuth.login();
  };

  const handleGitHubLogout = () => {
    gitHubAuth.logout();
  };

  return (
    <div className={clsx('flex flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center')}>
      <ClientOnly>{gitHubAuth.isAuthenticated ? <GlobalStats /> : null}</ClientOnly>
      {/* GitHub OAuth Section */}
      <div className="mt-6 w-full max-w-md rounded-lg border-t border-white/20 bg-black/10 p-4 backdrop-blur">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
          <AiFillGithub className="h-5 w-5" />
          GitHub OAuth
        </h3>

        {gitHubAuth?.token && gitHubAuth.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex animate-pulse items-center gap-2 text-white/70">
              <div className="h-4 w-4 animate-bounce rounded-full bg-white/20"></div>
              <span>Loading...</span>
            </div>
          </div>
        ) : gitHubAuth.isAuthenticated && gitHubAuth.user ? (
          <GitHubUserCard user={gitHubAuth.user} onLogout={handleGitHubLogout} />
        ) : (
          <div className="space-y-3">
            <Button className="flex w-full items-center justify-center gap-2 py-3" onClick={handleGitHubLogin} type="primary">
              <AiFillGithub className="h-5 w-5" />
              GitHub OAuth
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
