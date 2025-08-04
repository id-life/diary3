'use client';

import GitHubConfigForm from '@/components/auth/GithubConfigForm';
import EntryHeader from '@/components/entry/EntryHeader';

export default function GitHubConfigPage() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4">
      <EntryHeader layout="centered" backLink="/settings">
        <h1 className="text-center text-lg font-semibold">GitHub Backup Settings</h1>
      </EntryHeader>

      <GitHubConfigForm />
    </div>
  );
}
