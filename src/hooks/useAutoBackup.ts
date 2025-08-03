import { useEffect, useCallback, useRef } from 'react';
import { useGitHubOAuth } from './useGitHubOAuth';
import { saveStateToGithub } from '@/utils/GithubStorage';
import { useSetAtom } from 'jotai';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';

const LAST_AUTO_BACKUP_TIMESTAMP_KEY = 'lastAutoBackupTimestamp';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export const useAutoBackup = () => {
  const { isAuthenticated, user } = useGitHubOAuth();
  const isBackupInProgress = useRef(false);
  const setLegacyLoginUser = useSetAtom(legacyLoginUserAtom);

  const performAutoBackup = useCallback(async () => {
    if (isBackupInProgress.current) {
      console.log('Auto backup skipped: A backup is already in progress.');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('Auto backup skipped: User not authenticated or user data not loaded.');
      return;
    }

    if (!user.isAutoBackup) {
      console.log(`Auto backup skipped: Feature is disabled for user ${user.username}.`);
      return;
    }

    const now = Date.now();
    const lastBackupTimestampStr = localStorage.getItem(LAST_AUTO_BACKUP_TIMESTAMP_KEY);
    const lastBackupTimestamp = parseInt(lastBackupTimestampStr || '0', 10);

    if (now - lastBackupTimestamp < TWENTY_FOUR_HOURS_IN_MS) {
      const hoursSinceLast = ((now - lastBackupTimestamp) / (60 * 60 * 1000)).toFixed(1);
      console.log(`Auto backup skipped: Only ${hoursSinceLast} hours have passed since the last backup.`);
      return;
    }

    setLegacyLoginUser((prev) => (prev ? { ...prev, lastUseTime: Date.now() } : null));

    try {
      isBackupInProgress.current = true;
      console.log(`Performing auto backup for ${user.username}...`);

      await saveStateToGithub(null, false, user, true);

      localStorage.setItem(LAST_AUTO_BACKUP_TIMESTAMP_KEY, Date.now().toString());
      console.log('Auto backup successful.');
    } catch (error) {
      console.error('Daily auto backup failed:', error);
    } finally {
      isBackupInProgress.current = false;
    }
  }, [isAuthenticated, user, setLegacyLoginUser]);

  const callbackRef = useRef(performAutoBackup);
  useEffect(() => {
    callbackRef.current = performAutoBackup;
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    callbackRef.current();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('Tab is visible again, checking for auto backup...');
        callbackRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
};
