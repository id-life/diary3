'use client';

import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AutoBackupManager from '../app/AutoBackupManager';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useGitHubOAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <AutoBackupManager />
        {children}
      </>
    );
  }

  return null;
}
