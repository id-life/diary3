'use client';

import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { BackupInfo, saveBackupList } from '@/api/github';
import { GitHubUser } from '@/api/auth';

// Collect current Jotai state from localStorage with error handling
const safeJsonParse = (value: string | null, fallbackObj: any) => {
  try {
    return value ? JSON.parse(value) : fallbackObj;
  } catch (error) {
    console.warn('Failed to parse localStorage value:', error);
    return fallbackObj;
  }
};

const isIncompleteGithubInfo = (user: GitHubUser | null | undefined) => {
  return !user?.githubSecret || !user?.githubId || !user?.repo;
};

/**
 * Saves the entire state.
 */
export const saveStateToGithub = async (
  loginUser: any,
  isNew?: boolean,
  newUser?: GitHubUser | null,
  isAutoBackup: boolean = false,
): Promise<BackupInfo | void> => {
  if (!newUser?.username) {
    if (!isAutoBackup) toast.error('Please login with GitHub OAuth first');
    throw new Error('User not authenticated');
  }

  if (isIncompleteGithubInfo(newUser)) {
    const message = 'GitHub backup configuration is incomplete. Please set Username, Repository, and a PAT in settings.';
    if (!isAutoBackup) toast.error(message);
    else console.warn(message);
    throw new Error(message);
  }

  const saveMsg = !isAutoBackup ? toast.loading('Saving...') : null;

  try {
    const jotaiState = {
      entryTypes: {
        entryTypesArray: safeJsonParse(localStorage.getItem('entryTypes.entryTypesArray'), []),
      },
      entryInstances: {
        entryInstancesMap: safeJsonParse(localStorage.getItem('entryInstances.entryInstancesMap'), {}),
      },
      reminderRecords: {
        reminderRecords: safeJsonParse(localStorage.getItem('reminderRecords.reminderRecords'), []),
      },
      loginUser: safeJsonParse(localStorage.getItem('loginUser'), null),
      uiState: safeJsonParse(localStorage.getItem('uiState'), {
        app: { dateStr: new Date().toISOString().split('T')[0] },
        entryPage: {},
        addPage: { isEntryTypeUpdating: false, updatingEntryTypeId: null },
        reminderPage: {},
        settingsPage: {},
      }),
      _persist: {
        version: 1,
        rehydrated: true,
      },
    };
    const stateString = JSON.stringify(jotaiState, null, 2);

    if (saveMsg) toast.update(saveMsg, { render: 'Pushing to GitHub repo...' });
    const octokit = new Octokit({
      auth: newUser.githubSecret,
      userAgent: 'diary-app',
    });

    const path = `diary-backup-${dayjs().format('YYYYMMDD-HHmmss')}.json`;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: newUser.githubId!,
      repo: newUser.repo!,
      path,
      message: `Diary Backup: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      content: Buffer.from(stateString).toString('base64'),
    });

    console.log('Successfully pushed backup to GitHub repository.');

    let backendBackupResult: BackupInfo | undefined;
    if (!isAutoBackup) {
      if (saveMsg) toast.update(saveMsg, { render: 'Saving to cloud backup...' });
      backendBackupResult = await saveBackupList({ content: jotaiState, fileName: path });
    }

    if (saveMsg) {
      toast.update(saveMsg, { render: 'Save Successfully', type: 'success', isLoading: false, autoClose: 3000 });
    }
    console.log('Backup process complete.', { auto: isAutoBackup, manual: !isAutoBackup });

    return backendBackupResult;
  } catch (e: any) {
    if (saveMsg) {
      toast.update(saveMsg, { render: e?.message || 'Save failed', type: 'error', isLoading: false, autoClose: 3000 });
    }
    console.error('GitHub backup failed:', e);
    throw e;
  }
};

/**
 * Legacy function that saves Redux persist state (kept for backward compatibility)
 */
export const saveReduxStateToGithub = async (loginUser: any, isNew?: boolean, newUser?: GitHubUser | null) => {
  if (!newUser?.username) {
    toast.error('Please login with GitHub OAuth first');
    return;
  }

  const saveMsg = toast.loading('Saving...');

  try {
    const state = localStorage.getItem('persist:diary');
    const path = `dairy-save-redux-${newUser.username}-${dayjs().format('YYYYMMDD-HHmmss')}.json`;

    // Save to cloud backup via OAuth API
    await saveBackupList({ content: JSON.parse(state || '{}'), fileName: path });

    toast.update(saveMsg, { render: 'Save Successfully', type: 'success', isLoading: false, autoClose: 3000 });
  } catch (e: any) {
    toast.update(saveMsg, { render: e?.message || 'Save failed', type: 'error', isLoading: false, autoClose: 3000 });
  }
};
