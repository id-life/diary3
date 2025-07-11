'use client';

import GitHubUserCard from '@/components/auth/GitHubUserCard';
import Button from '@/components/button';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import DataExportDialog from '@/components/data/DataExportDialog';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { login } from '@/api/auth';
import { useAccessToken } from '@/hooks/app';
import clsx from 'clsx';
import { useState } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { HiDatabase, HiDocumentDownload, HiUser } from 'react-icons/hi';

export default function SettingsPage() {
  const gitHubAuth = useGitHubOAuth();
  const { setAccessToken } = useAccessToken();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGitHubLogin = () => {
    gitHubAuth.login();
  };

  const handleGitHubLogout = () => {
    gitHubAuth.logout();
  };

  const handleUsernamePasswordLogin = async () => {
    if (!username || !password) return;

    setIsLoggingIn(true);
    try {
      const response = await login({ username, password });
      setAccessToken(response.access_token);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={clsx('flex flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center')}>
      <ClientOnly>{gitHubAuth.isAuthenticated ? <GlobalStats /> : null}</ClientOnly>

      {/* Data Export Section */}
      <div className="w-full max-w-md rounded-lg border-t border-white/20 bg-black/10 p-4 backdrop-blur">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
          <HiDatabase className="h-5 w-5" />
          Data Management
        </h3>
        <div className="space-y-3">
          <Button
            className="flex w-full items-center justify-center gap-2 py-3"
            onClick={() => setExportDialogOpen(true)}
            type="primary"
          >
            <HiDocumentDownload className="h-5 w-5" />
            Export & Backup Data
          </Button>
          <p className="text-xs text-white/70">Export data for database migration or localStorage backup</p>
        </div>
      </div>
      {/* Username/Password Login Section */}
      {!gitHubAuth.token ? (
        <div className="w-full max-w-md rounded-lg border-t border-white/20 bg-black/10 p-4 backdrop-blur">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
            <HiUser className="h-5 w-5" />
            Account Login
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
            />
            <Button
              className="flex w-full items-center justify-center gap-2 py-3"
              onClick={handleUsernamePasswordLogin}
              type="primary"
              disabled={!username || !password || isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      ) : null}

      {/* GitHub OAuth Section */}
      <div className="w-full max-w-md rounded-lg border-t border-white/20 bg-black/10 p-4 backdrop-blur">
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
      {/* Data Export Dialog */}
      <DataExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
