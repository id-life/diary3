/**
 * Database-First Atoms
 * 
 * These atoms work primarily with in-memory state and can optionally sync with localStorage.
 * They provide a migration path from localStorage-dependent to database-first architecture.
 */

import { atom } from 'jotai';
import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';
import { UIState } from './uiState';

// Migration mode - controls whether atoms sync with localStorage
export const localStorageSyncEnabledAtom = atom<boolean>(true);

// Pure memory atoms (no localStorage dependency)
export const memoryEntryTypesAtom = atom<EntryType[]>([]);
export const memoryEntryInstancesAtom = atom<{ [key: string]: EntryInstance[] }>({});
export const memoryReminderRecordsAtom = atom<ReminderRecord[]>([]);
export const memoryUiStateAtom = atom<UIState>({
  app: { dateStr: new Date().toISOString().split('T')[0] },
  entryPage: {},
  addPage: { 
    isEntryTypeUpdating: false, 
    updatingEntryTypeId: null,
    updatingReminderId: null 
  },
  reminderPage: {},
  settingsPage: {}
});

// Hybrid atoms that can work with or without localStorage
export const hybridEntryTypesAtom = atom(
  (get) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    const memoryData = get(memoryEntryTypesAtom);
    
    if (!syncEnabled || memoryData.length > 0) {
      return memoryData;
    }
    
    // Fallback to localStorage if memory is empty and sync is enabled
    try {
      const stored = localStorage.getItem('entryTypes.entryTypesArray');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  (get, set, newValue: EntryType[]) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    
    // Always update memory
    set(memoryEntryTypesAtom, newValue);
    
    // Optionally sync to localStorage
    if (syncEnabled) {
      try {
        localStorage.setItem('entryTypes.entryTypesArray', JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to sync entryTypes to localStorage:', error);
      }
    }
  }
);

export const hybridEntryInstancesAtom = atom(
  (get) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    const memoryData = get(memoryEntryInstancesAtom);
    
    if (!syncEnabled || Object.keys(memoryData).length > 0) {
      return memoryData;
    }
    
    // Fallback to localStorage if memory is empty and sync is enabled
    try {
      const stored = localStorage.getItem('entryInstances.entryInstancesMap');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },
  (get, set, newValue: { [key: string]: EntryInstance[] }) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    
    // Always update memory
    set(memoryEntryInstancesAtom, newValue);
    
    // Optionally sync to localStorage
    if (syncEnabled) {
      try {
        localStorage.setItem('entryInstances.entryInstancesMap', JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to sync entryInstances to localStorage:', error);
      }
    }
  }
);

export const hybridReminderRecordsAtom = atom(
  (get) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    const memoryData = get(memoryReminderRecordsAtom);
    
    if (!syncEnabled || memoryData.length > 0) {
      return memoryData;
    }
    
    // Fallback to localStorage if memory is empty and sync is enabled
    try {
      const stored = localStorage.getItem('reminderRecords.reminderRecords');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  (get, set, newValue: ReminderRecord[]) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    
    // Always update memory
    set(memoryReminderRecordsAtom, newValue);
    
    // Optionally sync to localStorage
    if (syncEnabled) {
      try {
        localStorage.setItem('reminderRecords.reminderRecords', JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to sync reminderRecords to localStorage:', error);
      }
    }
  }
);

export const hybridUiStateAtom = atom(
  (get) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    const memoryData = get(memoryUiStateAtom);
    
    if (!syncEnabled) {
      return memoryData;
    }
    
    // Try to get from localStorage if sync is enabled
    try {
      const stored = localStorage.getItem('uiState');
      return stored ? JSON.parse(stored) : memoryData;
    } catch {
      return memoryData;
    }
  },
  (get, set, newValue: UIState) => {
    const syncEnabled = get(localStorageSyncEnabledAtom);
    
    // Always update memory
    set(memoryUiStateAtom, newValue);
    
    // Optionally sync to localStorage
    if (syncEnabled) {
      try {
        localStorage.setItem('uiState', JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to sync uiState to localStorage:', error);
      }
    }
  }
);

// Initialization atom that loads data from database or localStorage
export const initializeDataAtom = atom(
  null,
  (get, set, data?: {
    entryTypes?: EntryType[];
    entryInstances?: { [key: string]: EntryInstance[] };
    reminderRecords?: ReminderRecord[];
    uiState?: UIState;
    disableLocalStorageSync?: boolean;
  }) => {
    console.log('🔄 Initializing database-first data...');
    
    if (data?.disableLocalStorageSync) {
      set(localStorageSyncEnabledAtom, false);
      console.log('📱 localStorage sync disabled - running in database-only mode');
    }
    
    if (data?.entryTypes) {
      set(hybridEntryTypesAtom, data.entryTypes);
    }
    
    if (data?.entryInstances) {
      set(hybridEntryInstancesAtom, data.entryInstances);
    }
    
    if (data?.reminderRecords) {
      set(hybridReminderRecordsAtom, data.reminderRecords);
    }
    
    if (data?.uiState) {
      set(hybridUiStateAtom, data.uiState);
    }
    
    console.log('✅ Database-first initialization completed');
  }
);

// Action atoms that work database-first
export const createEntryTypeDbFirstAtom = atom(
  null,
  (get, set, entryType: EntryType) => {
    const current = get(hybridEntryTypesAtom);
    set(hybridEntryTypesAtom, [...current, entryType]);
  }
);

export const updateEntryTypeDbFirstAtom = atom(
  null,
  (get, set, entryType: EntryType) => {
    const current = get(hybridEntryTypesAtom);
    const indexToUpdate = current.findIndex((et: EntryType) => et.id === entryType.id);
    if (indexToUpdate >= 0) {
      const updated = [...current];
      updated[indexToUpdate] = entryType;
      set(hybridEntryTypesAtom, updated);
    }
  }
);

export const deleteEntryTypeDbFirstAtom = atom(
  null,
  (get, set, entryTypeId: string) => {
    const current = get(hybridEntryTypesAtom);
    const filtered = current.filter((et: EntryType) => et.id !== entryTypeId);
    set(hybridEntryTypesAtom, filtered);
  }
);

// Helper atom to check if running in database-only mode
export const isDatabaseOnlyModeAtom = atom((get) => {
  return !get(localStorageSyncEnabledAtom);
});

// Migration helper - copies localStorage to memory atoms
export const migrateFromLocalStorageAtom = atom(
  null,
  (get, set) => {
    console.log('🔄 Migrating from localStorage to memory atoms...');
    
    try {
      // Load from localStorage
      const entryTypes = localStorage.getItem('entryTypes.entryTypesArray');
      const entryInstances = localStorage.getItem('entryInstances.entryInstancesMap');
      const reminderRecords = localStorage.getItem('reminderRecords.reminderRecords');
      const uiState = localStorage.getItem('uiState');
      
      if (entryTypes) {
        set(memoryEntryTypesAtom, JSON.parse(entryTypes));
      }
      
      if (entryInstances) {
        set(memoryEntryInstancesAtom, JSON.parse(entryInstances));
      }
      
      if (reminderRecords) {
        set(memoryReminderRecordsAtom, JSON.parse(reminderRecords));
      }
      
      if (uiState) {
        set(memoryUiStateAtom, JSON.parse(uiState));
      }
      
      console.log('✅ Migration from localStorage completed');
      return true;
    } catch (error) {
      console.error('❌ Migration from localStorage failed:', error);
      return false;
    }
  }
);