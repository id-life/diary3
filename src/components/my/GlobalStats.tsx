'use client';

import { backupDialogOpenAtom, globalStateAtom } from '@/atoms/app';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { safeNumberValue } from '@/utils';
import { saveStateToGithub } from '@/utils/GithubStorage';
import clsx from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import Button from '../button';

function GlobalStats({ className }: { className?: string }) {
  const { logout, user: githubUser } = useGitHubOAuth();
  const legacyLoginUser = useAtomValue(legacyLoginUserAtom);
  const save = useCallback(() => saveStateToGithub(null, true, githubUser), [githubUser]);
  const setLoadOpen = useSetAtom(backupDialogOpenAtom);
  const globalState = useAtomValue(globalStateAtom);

  // Parse legacy loginUser data if stored as string
  const parsedLegacyUser =
    legacyLoginUser && typeof legacyLoginUser === 'string'
      ? (() => {
          try {
            return JSON.parse(legacyLoginUser);
          } catch {
            return null;
          }
        })()
      : legacyLoginUser;

  // Determine display name and user info
  const displayName = githubUser?.name || githubUser?.username || parsedLegacyUser?.uid;
  const userEmail = githubUser?.email || parsedLegacyUser?.email;

  const onLogoutClick = () => {
    logout();
  };
  return (
    <div className={clsx('flex flex-col justify-between gap-10 text-white', className)}>
      <div className="flex flex-col items-center gap-2">
        <img
          className="h-20 w-20 rounded-full border-2 border-white bg-white/30"
          src="https://fakeimg.pl/200x200/?text=Avatar"
          alt="avatar"
        />
        <h1 className="text-2xl font-bold">{displayName || 'User'}</h1>
        {userEmail && <p className="text-sm text-white/70">{userEmail}</p>}
      </div>
      <div className="flex flex-col gap-4 text-lg">
        <p>
          You have signed up for Diary for{' '}
          <span className="font-DDin text-2xl font-bold">{safeNumberValue(globalState?.registeredSince)}</span> days.
        </p>
        <p>
          You recorded entries in Diary for{' '}
          <span className="font-DDin text-2xl font-bold">{safeNumberValue(globalState?.entryDays)}</span> days.
        </p>
        <p>
          You recorded in total{' '}
          <span className="font-DDin text-2xl font-bold">{safeNumberValue(globalState?.totalEntries)}</span> entries.
        </p>
        <p>
          In your historical longest streak, you recorded entries for{' '}
          <span className="font-DDin text-2xl font-bold">{safeNumberValue(globalState?.historicalLongestStreakByEntry)}</span>{' '}
          days.
        </p>
        <p>
          In your current streak, you recorded entries for{' '}
          <span className="font-DDin text-2xl font-bold">{safeNumberValue(globalState?.currentStreakByEntry)}</span> days.
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <Button size="large" className="h-12 rounded-full border-none hover:opacity-90" onClick={save}>
          Save
        </Button>
        <Button size="large" className="h-12 rounded-full border-none hover:opacity-90" onClick={() => setLoadOpen(true)}>
          Load
        </Button>
        <Button
          size="large"
          className="h-12 rounded-full border-none text-black hover:opacity-90"
          type="link"
          onClick={onLogoutClick}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
export default GlobalStats;
