import { useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import { useGitHubOAuth } from './useGitHubOAuth';
import { saveStateToGithub } from '@/utils/GithubStorage';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';

const LAST_BACKUP_KEY = 'lastAutoBackupDate';

export const useAutoBackup = () => {
  const { isAuthenticated, user } = useGitHubOAuth();
  const queryClient = useQueryClient();
  const isBackupInProgress = useRef(false);
  const setLegacyLoginUser = useSetAtom(legacyLoginUserAtom);

  const performAutoBackup = useCallback(async () => {
    if (isBackupInProgress.current) {
      console.log('Auto backup skipped: A backup is already in progress.');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('Auto backup skipped: User not authenticated.');
      return;
    }

    const today = dayjs().format('YYYY-MM-DD');
    const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);

    if (today === lastBackupDate) {
      console.log('Auto backup skipped: Already backed up today.');
      return;
    }

    setLegacyLoginUser((prev) => (prev ? { ...prev, lastUseTime: Date.now() } : null));

    try {
      isBackupInProgress.current = true;
      console.log(`Performing daily auto backup for ${user.username}...`);

      await saveStateToGithub(null, false, user, true);
      await queryClient.invalidateQueries({ queryKey: ['fetch_backup_list'] });
      localStorage.setItem(LAST_BACKUP_KEY, today);
      console.log('Daily auto backup successful.');
    } catch (error) {
      console.error('Daily auto backup failed:', error);
    } finally {
      isBackupInProgress.current = false;
    }
  }, [isAuthenticated, user, queryClient]);

  const callbackRef = useRef(performAutoBackup);
  useEffect(() => {
    callbackRef.current = performAutoBackup;
  });

  useEffect(() => {
    callbackRef.current();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is visible again, checking for auto backup...');
        callbackRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
