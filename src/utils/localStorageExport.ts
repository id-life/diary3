/**
 * localStorage Export Utility
 *
 * This utility creates database-ready export strings from current application state.
 * The exported strings can be copied directly to database without transformation.
 */

import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';
import { UIState } from '@/atoms/uiState';
import dayjs from 'dayjs';

export interface DatabaseExportFormat {
  entryTypes: {
    entryTypesArray: EntryType[];
  };
  entryInstances: {
    entryInstancesMap: { [key: string]: EntryInstance[] };
  };
  reminderRecords: {
    reminderRecords: ReminderRecord[];
  };
  uiState: UIState;
  _persist: {
    version: number;
    rehydrated: boolean;
  };
  exportMeta: {
    exportedAt: string;
    exportSource: 'localStorage' | 'memory';
    version: string;
  };
}

/**
 * Safe JSON parser with fallback
 */
const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Failed to parse localStorage value:', error);
    return fallback;
  }
};

/**
 * Collect current state from localStorage in database-ready format
 */
export const exportLocalStorageToDatabase = (): DatabaseExportFormat => {
  console.log('📦 Exporting localStorage to database format...');
  
  if (typeof window === 'undefined') {
    console.warn('localStorage export attempted on server-side, returning empty data');
    return {
      entryTypes: { entryTypesArray: [] },
      entryInstances: { entryInstancesMap: {} },
      reminderRecords: { reminderRecords: [] },
      uiState: {
        app: { dateStr: new Date().toISOString().split('T')[0] },
        entryPage: {},
        addPage: { isEntryTypeUpdating: false, updatingEntryTypeId: null, updatingReminderId: null },
        reminderPage: {},
        settingsPage: {}
      },
      _persist: {
        version: 1,
        rehydrated: true
      },
      exportMeta: {
        exportedAt: new Date().toISOString(),
        exportSource: 'localStorage',
        version: '2.0.0'
      }
    };
  }

  const exportData: DatabaseExportFormat = {
    entryTypes: {
      entryTypesArray: safeJsonParse(localStorage.getItem('entryTypes.entryTypesArray'), [] as EntryType[]),
    },
    entryInstances: {
      entryInstancesMap: safeJsonParse(
        localStorage.getItem('entryInstances.entryInstancesMap'),
        {} as { [key: string]: EntryInstance[] },
      ),
    },
    reminderRecords: {
      reminderRecords: safeJsonParse(localStorage.getItem('reminderRecords.reminderRecords'), [] as ReminderRecord[]),
    },
    uiState: safeJsonParse(localStorage.getItem('uiState'), {
      app: { dateStr: new Date().toISOString().split('T')[0] },
      entryPage: {},
      addPage: {
        isEntryTypeUpdating: false,
        updatingEntryTypeId: null,
        updatingReminderId: null,
      },
      reminderPage: {},
      settingsPage: {},
    } as UIState),
    _persist: {
      version: 1,
      rehydrated: true,
    },
    exportMeta: {
      exportedAt: new Date().toISOString(),
      exportSource: 'localStorage',
      version: '1.0.0',
    },
  };

  console.log('✅ localStorage export completed:', {
    entryTypes: exportData.entryTypes.entryTypesArray.length,
    entryInstances: Object.keys(exportData.entryInstances.entryInstancesMap).length,
    reminderRecords: exportData.reminderRecords.reminderRecords.length,
    exportedAt: exportData.exportMeta.exportedAt,
  });

  return exportData;
};

/**
 * Export current state from Jotai atoms (memory) in database-ready format
 */
export const exportMemoryStateToDatabase = (
  entryTypes: EntryType[],
  entryInstances: { [key: string]: EntryInstance[] },
  reminderRecords: ReminderRecord[],
  uiState: UIState,
): DatabaseExportFormat => {
  console.log('📦 Exporting memory state to database format...');

  const exportData: DatabaseExportFormat = {
    entryTypes: {
      entryTypesArray: entryTypes,
    },
    entryInstances: {
      entryInstancesMap: entryInstances,
    },
    reminderRecords: {
      reminderRecords: reminderRecords,
    },
    uiState: uiState,
    _persist: {
      version: 1,
      rehydrated: true,
    },
    exportMeta: {
      exportedAt: new Date().toISOString(),
      exportSource: 'memory',
      version: '1.0.0',
    },
  };

  console.log('✅ Memory state export completed:', {
    entryTypes: exportData.entryTypes.entryTypesArray.length,
    entryInstances: Object.keys(exportData.entryInstances.entryInstancesMap).length,
    reminderRecords: exportData.reminderRecords.reminderRecords.length,
    exportedAt: exportData.exportMeta.exportedAt,
  });

  return exportData;
};

/**
 * Create a database-ready JSON string that can be copied directly
 */
export const createDatabaseReadyString = (data: DatabaseExportFormat): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Create a filename for the export
 */
export const createExportFilename = (username?: string): string => {
  const timestamp = dayjs().format('YYYYMMDD-HHmmss');
  const userPrefix = username ? `${username}-` : '';
  return `diary-export-${userPrefix}${timestamp}.json`;
};

/**
 * Download export data as a file
 */
export const downloadExportAsFile = (data: DatabaseExportFormat, filename?: string): void => {
  const jsonString = createDatabaseReadyString(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || createExportFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy export data to clipboard
 */
export const copyExportToClipboard = async (data: DatabaseExportFormat): Promise<boolean> => {
  try {
    const jsonString = createDatabaseReadyString(data);
    await navigator.clipboard.writeText(jsonString);
    console.log('✅ Export data copied to clipboard');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Validate export data integrity
 */
export const validateExportData = (
  data: DatabaseExportFormat,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required structure
  if (!data.entryTypes || !Array.isArray(data.entryTypes.entryTypesArray)) {
    errors.push('Invalid entryTypes structure');
  }

  if (!data.entryInstances || typeof data.entryInstances.entryInstancesMap !== 'object') {
    errors.push('Invalid entryInstances structure');
  }

  if (!data.reminderRecords || !Array.isArray(data.reminderRecords.reminderRecords)) {
    errors.push('Invalid reminderRecords structure');
  }

  if (!data.uiState || typeof data.uiState !== 'object') {
    errors.push('Invalid uiState structure');
  }

  // Check for empty data
  if (data.entryTypes.entryTypesArray.length === 0) {
    warnings.push('No entry types found');
  }

  if (Object.keys(data.entryInstances.entryInstancesMap).length === 0) {
    warnings.push('No entry instances found');
  }

  // Check data integrity
  const entryTypeIds = new Set(data.entryTypes.entryTypesArray.map((et) => et.id));
  const instanceEntryTypeIds = new Set<string>();

  Object.values(data.entryInstances.entryInstancesMap).forEach((instances) => {
    instances.forEach((instance) => {
      instanceEntryTypeIds.add(instance.entryTypeId);
    });
  });

  instanceEntryTypeIds.forEach((id) => {
    if (!entryTypeIds.has(id)) {
      warnings.push(`Entry instance references unknown entry type: ${id}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
