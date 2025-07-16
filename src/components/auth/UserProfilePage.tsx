'use client';

import { backupDialogOpenAtom, globalStateAtom } from '@/atoms/app';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { safeNumberValue } from '@/utils';
import { saveStateToGithub } from '@/utils/GithubStorage';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiChevronRight, HiDownload, HiUpload } from 'react-icons/hi';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

function StateCard({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <Card className="flex-center flex-col px-2 pb-3 pt-5 text-center">
      <p className="text-xs/3.5 text-diary-navy">{title}</p>
      <p className="mt-5 text-3xl/8 font-bold text-diary-navy">{value}</p>
      <p className="text-diary-gray-medium mt-5 text-xs opacity-50">{unit}</p>
    </Card>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user: githubUser, logout } = useGitHubOAuth();
  const globalState = useAtomValue(globalStateAtom);
  const [isLoading, setIsLoading] = useState(false);
  const setLoadOpen = useSetAtom(backupDialogOpenAtom);

  // Get real user stats
  const userStats = {
    signedUpDays: safeNumberValue(globalState?.registeredSince),
    recordedEntries: safeNumberValue(globalState?.entryDays),
    totalEntries: safeNumberValue(globalState?.totalEntries),
    currentStreak: safeNumberValue(globalState?.currentStreakByEntry),
    longestStreak: safeNumberValue(globalState?.historicalLongestStreakByEntry),
  };

  const handleSave = async () => {
    if (!githubUser) {
      console.error('No GitHub user found');
      return;
    }

    setIsLoading(true);
    try {
      await saveStateToGithub(null, true, githubUser);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    // Open data export dialog for loading data
    setLoadOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get user display info
  const displayName = githubUser?.name || githubUser?.username || 'User';
  const userAvatar = githubUser?.avatar || '/api/placeholder/80/80';
  const lastUseTime = dayjs().format('h:mm A YYYY/MM/DD dddd');

  return (
    <div className="flex h-full flex-col overflow-auto px-4 pb-10">
      {/* Header */}
      <div className="-mx-4 bg-[#FDFEFE] px-4 pb-6 pt-11 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
            <img src={userAvatar} alt="User avatar" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-diary-navy">
              {displayName} <span className="text-lg">&apos;s Diary</span>
            </h1>
            <p className="text-diary-gray-medium mt-1 text-xs">Last Use: {lastUseTime}</p>
          </div>
        </div>
      </div>

      {/* Save/Load Section */}
      <div className="px-4 py-6">
        <Card className="overflow-hidden rounded-lg border border-[#1E1B391A]">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="border-diary-card-border flex w-full items-center justify-between border-b px-4 py-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <HiDownload className="text-diary-gray-medium h-6 w-6" />
              <span className="font-medium text-diary-navy">Save</span>
            </div>
            <HiChevronRight className="text-diary-gray-medium h-5 w-5" />
          </button>

          <button
            onClick={handleLoad}
            className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <HiUpload className="text-diary-gray-medium h-6 w-6" />
              <span className="font-medium text-diary-navy">Load</span>
            </div>
            <HiChevronRight className="text-diary-gray-medium h-5 w-5" />
          </button>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="px-4 pb-6">
        {/* Top Row Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <StateCard title="Signed up" value={userStats.signedUpDays} unit={`Day${userStats.signedUpDays !== 1 ? 's' : ''}`} />
          <StateCard
            title="Recorded entries"
            value={userStats.recordedEntries}
            unit={`Day${userStats.recordedEntries !== 1 ? 's' : ''}`}
          />
          <StateCard title="Recorded in total" value={userStats.totalEntries} unit={`Entries`} />
        </div>

        {/* Bottom Row Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StateCard
            title="Historical longest current streak"
            value={userStats.longestStreak}
            unit={`Day${userStats.longestStreak !== 1 ? 's' : ''}`}
          />
          <StateCard
            title="Current streak recorded entries"
            value={userStats.currentStreak}
            unit={`Day${userStats.currentStreak !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* Logout Section */}
      <div className="mt-auto">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="group w-full rounded-lg border border-[#1E1B391A] px-4 py-4  text-center text-sm/8 font-semibold"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
