/**
 * Database-First Atoms
 *
 * These atoms work primarily with in-memory state and can optionally sync with localStorage.
 * They provide a migration path from localStorage-dependent to database-first architecture.
 */

import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';
import { UIState } from './uiState';
import { convertEntryTypesToNewColors } from '@/utils/colorConverter';

// Legacy loginUser interface for backward compatibility
export interface LegacyLoginUser {
  uid?: string;
  loginTime?: number;
  lastUseTime?: number;
  githubSecret?: string;
  repo?: string;
  email?: string;
}

const entryTypesStorage = createJSONStorage<EntryType[]>(() => localStorage);
const transformedEntryTypesStorage = {
  ...entryTypesStorage,
  getItem: (key: string, initialValue: EntryType[]): EntryType[] => {
    const savedValue = entryTypesStorage.getItem(key, initialValue);
    console.log('Reading and converting entry types from localStorage...');
    const converted = convertEntryTypesToNewColors(savedValue);
    return converted;
  },
};

// Database-first atoms using atomWithStorage
export const hybridEntryTypesAtom = atomWithStorage<EntryType[]>(
  'entryTypes.entryTypesArray',
  [],
  transformedEntryTypesStorage,
);

export const hybridEntryInstancesAtom = atomWithStorage<{ [key: string]: EntryInstance[] }>(
  'entryInstances.entryInstancesMap',
  {},
);

export const hybridReminderRecordsAtom = atomWithStorage<ReminderRecord[]>('reminderRecords.reminderRecords', []);

export const hybridUiStateAtom = atomWithStorage<UIState>('uiState', {
  app: { dateStr: new Date().toISOString().split('T')[0] },
  entryPage: {},
  addPage: {
    isEntryTypeUpdating: false,
    updatingEntryTypeId: null,
    updatingReminderId: null,
  },
  reminderPage: {},
  settingsPage: {},
});

// Legacy loginUser atom for backward compatibility
export const legacyLoginUserAtom = atomWithStorage<LegacyLoginUser | null>('loginUser', null);
