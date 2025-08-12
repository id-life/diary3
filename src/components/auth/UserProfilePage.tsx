'use client';

import { backupDialogOpenAtom, globalStateAtom, entryInstancesMapAtom } from '@/atoms';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { safeNumberValue } from '@/utils';
import { saveStateToGithub } from '@/utils/GithubStorage';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LoadSVG, SaveSVG } from '../svg';
import { HiChevronRight } from 'react-icons/hi';
import { useQueryClient } from '@tanstack/react-query';
import { AiFillGithub, AiOutlineLoading } from 'react-icons/ai';
import { BackupInfo, useBackupList } from '@/api/github';
import { calcRecordedCurrentStreaks, calcRecordedLongestStreaks } from '@/utils/entry';
import { GlobalState } from '@/atoms/app';
import { useAccessToken } from '@/hooks/app';

function StateCard({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <Card className="flex-center flex-col px-2 pb-3 pt-5 text-center shadow-none">
      <p className="text-xs/3.5 text-diary-navy">{title}</p>
      <p className="mt-5 text-3xl/8 font-bold text-diary-navy">{value}</p>
      <p className="mt-5 text-xs text-diary-navy opacity-50">{unit}</p>
    </Card>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user: githubUser, logout, isRefreshing: isUserLoading } = useGitHubOAuth();

  const [isSaving, setIsSaving] = useState(false);
  const setLoadOpen = useSetAtom(backupDialogOpenAtom);

  const queryClient = useQueryClient();
  const { accessToken } = useAccessToken();
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const legacyLoginUser = useAtomValue(legacyLoginUserAtom);
  const { data: backupList, isLoading: isBackupListLoading } = useBackupList();

  const userStats: GlobalState | null = useMemo(() => {
    if (!legacyLoginUser || !backupList || !entryInstancesMap) {
      return null;
    }

    const now = dayjs();

    const historicalLoginTime = backupList?.[0]?.content?.loginUser?.loginTime;
    const loginTime = historicalLoginTime ?? githubUser?.createdAt ?? legacyLoginUser.loginTime;

    const entryKeys = Object.keys(entryInstancesMap);
    const totalEntries = entryKeys.reduce((pre, cur) => pre + (entryInstancesMap[cur]?.length ?? 0), 0);

    return {
      registeredSince: now.diff(dayjs(loginTime), 'day'),
      entryDays: entryKeys.length,
      totalEntries,
      historicalLongestStreakByEntry: calcRecordedLongestStreaks(entryInstancesMap),
      currentStreakByEntry: calcRecordedCurrentStreaks(entryInstancesMap),
    };
  }, [legacyLoginUser, backupList, entryInstancesMap, githubUser?.createdAt]);

  const areStatsLoading = isUserLoading || isBackupListLoading;

  const handleSave = async () => {
    if (!githubUser) return;
    setIsSaving(true);
    try {
      const newBackup = await saveStateToGithub(null, true, githubUser, false);

      if (newBackup) {
        queryClient.setQueryData(['fetch_backup_list', accessToken], (oldData: BackupInfo[] | undefined) => {
          const existingData = oldData || [];
          const newData = [newBackup, ...existingData];
          return newData;
        });
      }
    } catch (error) {
      console.error('Save failed:', error);
      queryClient.invalidateQueries({ queryKey: ['fetch_backup_list', accessToken] });
    } finally {
      setIsSaving(false);
    }
  };
  const handleLoad = () => setLoadOpen(true);
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = githubUser?.name || githubUser?.username || 'User';
  const userAvatar = githubUser?.avatar || '/api/placeholder/80/80';
  const lastUseTime = dayjs().format('h:mm A YYYY/MM/DD dddd');

  return (
    <div className="flex h-full flex-col overflow-auto px-4">
      {/* Header */}
      <div className="-mx-4 bg-[#FDFEFE] px-4 py-5 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="size-20 overflow-hidden rounded-full bg-gray-200">
            <img src={userAvatar} alt="User avatar" className="size-full object-cover" />
          </div>
          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold text-diary-navy">
              {displayName} <span className="text-xl">&apos;s Diary</span>
            </h1>
            <p className="mt-1 text-xs text-[#8A8898]">Last Use: {lastUseTime}</p>
          </div>
        </div>
      </div>

      {/* Save/Load Section */}
      <div className="px-1 py-5">
        <Card className="overflow-hidden rounded-lg border border-[#1E1B391A] shadow-none">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="border-diary-card-border flex w-full items-center justify-between border-b px-4 py-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <SaveSVG />
              <span className="font-medium text-diary-navy">Save</span>
            </div>
            <HiChevronRight className="h-5 w-5 text-gray" />
          </button>
          <button
            onClick={handleLoad}
            className="border-diary-card-border flex w-full items-center justify-between border-b px-4 py-4 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <LoadSVG />
              <span className="font-medium text-diary-navy">Load</span>
            </div>
            <HiChevronRight className="size-5 text-gray" />
          </button>
          <button
            onClick={() => router.push('/settings/github')}
            className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <AiFillGithub className="size-[24px] text-[#bbbac3]" />
              <span className="font-medium text-diary-navy">GitHub Backup Settings</span>
            </div>
            <HiChevronRight className="size-5 text-gray" />
          </button>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mb-5 px-1">
        {areStatsLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-card text-center">
            <div className="flex items-center gap-2 text-diary-navy opacity-70">
              <AiOutlineLoading className="size-5 animate-spin" />
              <span>Loading Stats...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <StateCard
                title="Signed up"
                value={safeNumberValue(userStats?.registeredSince)}
                unit={`Day${safeNumberValue(userStats?.registeredSince) !== 1 ? 's' : ''}`}
              />
              <StateCard
                title="Recorded entries"
                value={safeNumberValue(userStats?.entryDays)}
                unit={`Day${safeNumberValue(userStats?.entryDays) !== 1 ? 's' : ''}`}
              />
              <StateCard title="Recorded in total" value={safeNumberValue(userStats?.totalEntries)} unit={`Entries`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StateCard
                title="Historical longest current streak"
                value={safeNumberValue(userStats?.historicalLongestStreakByEntry)}
                unit={`Day${safeNumberValue(userStats?.historicalLongestStreakByEntry) !== 1 ? 's' : ''}`}
              />
              <StateCard
                title="Current streak recorded entries"
                value={safeNumberValue(userStats?.currentStreakByEntry)}
                unit={`Day${safeNumberValue(userStats?.currentStreakByEntry) !== 1 ? 's' : ''}`}
              />
            </div>
          </>
        )}
      </div>

      {/* Logout Section */}
      <div className="mb-7 mt-auto">
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
