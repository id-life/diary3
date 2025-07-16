'use client';

import GitHubUserCard from '@/components/auth/GitHubUserCard';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import DataExportDialog from '@/components/data/DataExportDialog';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const gitHubAuth = useGitHubOAuth();
  const router = useRouter();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleGitHubLogout = () => {
    gitHubAuth.logout();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!gitHubAuth.isLoading && !gitHubAuth.isAuthenticated) {
      router.push('/login');
    }
  }, [gitHubAuth.isAuthenticated, gitHubAuth.isLoading, router]);

  // Show loading while checking authentication
  if (gitHubAuth.isLoading || !gitHubAuth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  if (!gitHubAuth.user) return null;
  // Show user profile and settings
  return (
    <div className="min-h-screen bg-gradient-home px-6 py-8 ">
      <div className="mx-auto max-w-md">
        <ClientOnly>
          <GlobalStats />
          <div className="mt-8">
            <GitHubUserCard user={gitHubAuth.user} onLogout={handleGitHubLogout} />
          </div>

          {/* Data Export Button */}
          <div className="mt-8 text-center">
            <button onClick={() => setExportDialogOpen(true)} className="text-sm text-gray-400 hover:text-gray-600">
              Export Data
            </button>
          </div>
        </ClientOnly>
      </div>
      <DataExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
