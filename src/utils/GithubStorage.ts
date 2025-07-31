'use client';

import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { saveBackupList } from '@/api/github';
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
/**
 * Save the entire state to cloud backup via OAuth
 */
export const saveStateToGithub = async (
  loginUser: any,
  isNew?: boolean,
  newUser?: GitHubUser | null,
  isAutoBackup: boolean = false,
) => {
  if (!newUser?.username) {
    if (!isAutoBackup) {
      toast.error('Please login with GitHub OAuth first');
    }
    return;
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

    const path = `dairy-save-${newUser.username}-${dayjs().format('YYYYMMDD-HHmmss')}.json`;

    await saveBackupList({ content: jotaiState, fileName: path });

    if (saveMsg) {
      toast.update(saveMsg, { render: 'Save Successfully', type: 'success', isLoading: false, autoClose: 3000 });
    }
    console.log('GitHub backup successful.', { auto: isAutoBackup });
  } catch (e: any) {
    if (saveMsg) {
      toast.update(saveMsg, { render: e?.message || 'Save failed', type: 'error', isLoading: false, autoClose: 3000 });
    }
    console.error('GitHub backup failed:', e);
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
