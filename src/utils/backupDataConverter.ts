/**
 * Backup Data Converter
 * 
 * This utility converts old Redux persist backup data to the new Jotai format
 * when loading from GitHub backups. It handles both old and new data structures
 * to ensure backward compatibility.
 */

import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';
import { toast } from 'react-toastify';

export interface OldReduxBackupData {
  loginUser?: string;
  entryTypes?: string;
  entryInstances?: string;
  reminderRecords?: string;
  uiState?: string;
  _persist?: string;
}

export interface NewJotaiBackupData {
  entryTypes: {
    entryTypesArray: EntryType[];
  };
  entryInstances: {
    entryInstancesMap: { [key: string]: EntryInstance[] };
  };
  reminderRecords: {
    reminderRecords: ReminderRecord[];
  };
  uiState: {
    app: {
      dateStr: string;
    };
    entryPage: {};
    addPage: {
      isEntryTypeUpdating: boolean;
      updatingEntryTypeId: string | null;
      updatingReminderId: string | null;
    };
    reminderPage: {};
    settingsPage: {};
  };
  _persist: {
    version: number;
    rehydrated: boolean;
  };
}

/**
 * Detects if the backup data is in old Redux format or new Jotai format
 */
export const detectBackupFormat = (backupData: any): 'old-redux' | 'new-jotai' | 'unknown' => {
  try {
    // Check if it's old Redux format (strings that need JSON.parse)
    if (
      backupData.entryTypes && 
      typeof backupData.entryTypes === 'string' &&
      backupData.entryInstances && 
      typeof backupData.entryInstances === 'string'
    ) {
      return 'old-redux';
    }
    
    // Check if it's new Jotai format (already parsed objects)
    if (
      backupData.entryTypes && 
      typeof backupData.entryTypes === 'object' &&
      backupData.entryTypes.entryTypesArray &&
      Array.isArray(backupData.entryTypes.entryTypesArray)
    ) {
      return 'new-jotai';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error detecting backup format:', error);
    return 'unknown';
  }
};

/**
 * Converts old Redux persist backup data to new Jotai format
 */
export const convertOldReduxBackup = (oldBackupData: OldReduxBackupData): NewJotaiBackupData => {
  try {
    console.log('🔄 Converting old Redux backup to new Jotai format...');
    
    // Parse Redux persist strings
    const entryTypes = oldBackupData.entryTypes ? JSON.parse(oldBackupData.entryTypes) : { entryTypesArray: [] };
    const entryInstances = oldBackupData.entryInstances ? JSON.parse(oldBackupData.entryInstances) : { entryInstancesMap: {} };
    const reminderRecords = oldBackupData.reminderRecords ? JSON.parse(oldBackupData.reminderRecords) : { reminderRecords: [] };
    const uiState = oldBackupData.uiState ? JSON.parse(oldBackupData.uiState) : {
      app: { dateStr: new Date().toISOString().split('T')[0] },
      entryPage: {},
      addPage: {
        isEntryTypeUpdating: false,
        updatingEntryTypeId: null,
        updatingReminderId: null,
      },
      reminderPage: {},
      settingsPage: {}
    };
    const _persist = oldBackupData._persist ? JSON.parse(oldBackupData._persist) : { version: 1, rehydrated: true };

    // Ensure updatingReminderId exists in addPage (backward compatibility)
    if (uiState.addPage && !uiState.addPage.hasOwnProperty('updatingReminderId')) {
      uiState.addPage.updatingReminderId = null;
    }

    const convertedData: NewJotaiBackupData = {
      entryTypes,
      entryInstances,
      reminderRecords,
      uiState,
      _persist
    };

    console.log('✅ Successfully converted old Redux backup:', {
      entryTypes: entryTypes.entryTypesArray.length,
      entryInstances: Object.keys(entryInstances.entryInstancesMap).length,
      reminderRecords: reminderRecords.reminderRecords.length
    });

    return convertedData;
  } catch (error) {
    console.error('❌ Error converting old Redux backup:', error);
    throw new Error('Failed to convert old backup data format');
  }
};

/**
 * Converts new Jotai backup data to individual localStorage keys
 */
export const convertToJotaiLocalStorage = (backupData: NewJotaiBackupData): Record<string, string> => {
  try {
    console.log('🔄 Converting backup data to Jotai localStorage format...');
    
    const jotaiData: Record<string, string> = {};
    
    // Convert each section to Jotai localStorage keys
    if (backupData.entryTypes?.entryTypesArray) {
      jotaiData['entryTypes.entryTypesArray'] = JSON.stringify(backupData.entryTypes.entryTypesArray);
    }
    
    if (backupData.entryInstances?.entryInstancesMap) {
      jotaiData['entryInstances.entryInstancesMap'] = JSON.stringify(backupData.entryInstances.entryInstancesMap);
    }
    
    if (backupData.reminderRecords?.reminderRecords) {
      jotaiData['reminderRecords.reminderRecords'] = JSON.stringify(backupData.reminderRecords.reminderRecords);
    }
    
    if (backupData.uiState) {
      jotaiData['uiState'] = JSON.stringify(backupData.uiState);
    }
    
    console.log('✅ Successfully converted to Jotai localStorage format');
    return jotaiData;
  } catch (error) {
    console.error('❌ Error converting to Jotai localStorage:', error);
    throw new Error('Failed to convert backup data to Jotai format');
  }
};

/**
 * Main function to convert and restore backup data
 */
export const convertAndRestoreBackup = async (backupData: any): Promise<boolean> => {
  try {
    console.log('🔄 Starting backup conversion and restoration...');
    
    const format = detectBackupFormat(backupData);
    console.log('📊 Detected backup format:', format);
    
    let convertedData: NewJotaiBackupData;
    
    if (format === 'old-redux') {
      // Convert old Redux format to new Jotai format
      convertedData = convertOldReduxBackup(backupData as OldReduxBackupData);
    } else if (format === 'new-jotai') {
      // Already in new format
      convertedData = backupData as NewJotaiBackupData;
    } else {
      throw new Error('Unknown backup data format');
    }
    
    // Convert to Jotai localStorage keys
    const jotaiLocalStorageData = convertToJotaiLocalStorage(convertedData);
    
    // Apply to localStorage
    Object.entries(jotaiLocalStorageData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Also maintain Redux persist format for backward compatibility during transition
    if (format === 'old-redux') {
      localStorage.setItem('persist:diary', JSON.stringify(convertedData));
    }
    
    // Mark successful conversion
    localStorage.setItem('__backup_conversion_completed', new Date().toISOString());
    
    console.log('✅ Backup conversion and restoration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Backup conversion failed:', error);
    toast.error(`Backup conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

/**
 * Validates the structure of backup data
 */
export const validateBackupData = (backupData: any): boolean => {
  try {
    if (!backupData || typeof backupData !== 'object') {
      return false;
    }
    
    const format = detectBackupFormat(backupData);
    
    if (format === 'old-redux') {
      // Validate old Redux format
      const hasRequiredFields = 
        backupData.entryTypes && 
        backupData.entryInstances;
        
      if (!hasRequiredFields) {
        return false;
      }
      
      // Try to parse the JSON strings
      JSON.parse(backupData.entryTypes);
      JSON.parse(backupData.entryInstances);
      
      return true;
    } else if (format === 'new-jotai') {
      // Validate new Jotai format
      return (
        backupData.entryTypes &&
        backupData.entryTypes.entryTypesArray &&
        Array.isArray(backupData.entryTypes.entryTypesArray) &&
        backupData.entryInstances &&
        backupData.entryInstances.entryInstancesMap &&
        typeof backupData.entryInstances.entryInstancesMap === 'object'
      );
    }
    
    return false;
  } catch (error) {
    console.error('Backup validation failed:', error);
    return false;
  }
};

/**
 * Creates a backup of current data before restoration
 */
export const createRestoreBackup = (): boolean => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `pre_restore_backup_${timestamp}`;
    
    // Backup current Jotai data
    const currentJotaiData: Record<string, string> = {};
    const jotaiKeys = [
      'entryTypes.entryTypesArray',
      'entryInstances.entryInstancesMap',
      'reminderRecords.reminderRecords',
      'uiState'
    ];
    
    jotaiKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        currentJotaiData[key] = value;
      }
    });
    
    // Also backup Redux persist data if it exists
    const reduxData = localStorage.getItem('persist:diary');
    if (reduxData) {
      currentJotaiData['persist:diary'] = reduxData;
    }
    
    localStorage.setItem(backupKey, JSON.stringify(currentJotaiData));
    console.log('✅ Created pre-restore backup:', backupKey);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create restore backup:', error);
    return false;
  }
};