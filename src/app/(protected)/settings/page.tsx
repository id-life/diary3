'use client';

import UserProfilePage from '@/components/auth/UserProfilePage';
import { ClientOnly } from '@/components/common/ClientOnly';
import DataExportDialog from '@/components/data/DataExportDialog';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const gitHubAuth = useGitHubOAuth();
  const router = useRouter();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

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

  return (
    <ClientOnly>
      <UserProfilePage />
      <DataExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </ClientOnly>
  );
}
