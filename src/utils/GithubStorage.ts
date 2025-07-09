'use client';

import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { persistor } from '../entry/store';
import { saveBackupList } from '@/api/github';
import { GitHubUser } from '@/api/auth';


/**
 * Save the entire state to cloud backup via OAuth
 */
export const saveStateToGithub = async (loginUser: any, isNew?: boolean, newUser?: GitHubUser | null) => {
  if (!newUser?.username) {
    toast.error('Please login with GitHub OAuth first');
    return;
  }
  
  const saveMsg = toast.loading('Saving...');

  try {
    await persistor.flush();
    const state = localStorage.getItem('persist:diary');
    const path = `dairy-save-${newUser.username}-${dayjs().format('YYYYMMDD-HHmmss')}.json`;

    // Save to cloud backup via OAuth API
    await saveBackupList({ content: JSON.parse(state || '{}'), fileName: path });

    toast.update(saveMsg, { render: 'Save Successfully', type: 'success', isLoading: false, autoClose: 3000 });
  } catch (e: any) {
    toast.update(saveMsg, { render: e?.message || 'Save failed', type: 'error', isLoading: false, autoClose: 3000 });
  }
};
