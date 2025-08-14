/**
 * State Migration Utility
 *
 * This utility helps migrate from Redux persist storage to Jotai atoms
 * while preserving all existing data structure and compatibility.
 */

import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';

export interface ReduxPersistedState {
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
 * Migrates Redux persist data to Jotai localStorage keys
 */
export const migrateReduxToJotai = () => {
  try {
    const reduxDataString = localStorage.getItem('persist:diary');
    if (!reduxDataString) {
      console.log('No Redux persist data found. Migration not needed.');
      localStorage.setItem('__jotai_migration_completed', 'true');
      return false;
    }

    if (localStorage.getItem('entryInstances.entryInstancesMap')) {
      console.log('Jotai data already exists. Migration skipped to prevent overwrite.');
      localStorage.setItem('__jotai_migration_completed', 'true');
      return false;
    }

    console.log('Found Redux persist data. Starting migration...');
    const parsedReduxData: any = JSON.parse(reduxDataString);

    // Migrate entryTypes - Redux persist double-stringifies data
    if (parsedReduxData.entryTypes) {
      try {
        const entryTypesData =
          typeof parsedReduxData.entryTypes === 'string' ? JSON.parse(parsedReduxData.entryTypes) : parsedReduxData.entryTypes;

        if (entryTypesData?.entryTypesArray) {
          localStorage.setItem('entryTypes.entryTypesArray', JSON.stringify(entryTypesData.entryTypesArray));
          console.log('Migrated entryTypes:', entryTypesData.entryTypesArray.length, 'items');
        }
      } catch (error) {
        console.error('Failed to migrate entryTypes:', error);
      }
    }

    // Migrate entryInstances
    if (parsedReduxData.entryInstances) {
      try {
        const entryInstancesData =
          typeof parsedReduxData.entryInstances === 'string'
            ? JSON.parse(parsedReduxData.entryInstances)
            : parsedReduxData.entryInstances;

        if (entryInstancesData?.entryInstancesMap) {
          localStorage.setItem('entryInstances.entryInstancesMap', JSON.stringify(entryInstancesData.entryInstancesMap));
          const entryCount = Object.keys(entryInstancesData.entryInstancesMap).length;
          console.log('Migrated entryInstances:', entryCount, 'date entries');
        }
      } catch (error) {
        console.error('Failed to migrate entryInstances:', error);
      }
    }

    // Migrate reminderRecords
    if (parsedReduxData.reminderRecords) {
      try {
        const reminderRecordsData =
          typeof parsedReduxData.reminderRecords === 'string'
            ? JSON.parse(parsedReduxData.reminderRecords)
            : parsedReduxData.reminderRecords;

        if (reminderRecordsData?.reminderRecords) {
          localStorage.setItem('reminderRecords.reminderRecords', JSON.stringify(reminderRecordsData.reminderRecords));
          console.log('Migrated reminderRecords:', reminderRecordsData.reminderRecords.length, 'items');
        }
      } catch (error) {
        console.error('Failed to migrate reminderRecords:', error);
      }
    }

    // Migrate uiState
    if (parsedReduxData.uiState) {
      try {
        const uiStateData =
          typeof parsedReduxData.uiState === 'string' ? JSON.parse(parsedReduxData.uiState) : parsedReduxData.uiState;

        localStorage.setItem('uiState', JSON.stringify(uiStateData));
        console.log('Migrated uiState');
      } catch (error) {
        console.error('Failed to migrate uiState:', error);
      }
    }

    // Mark migration as completed
    localStorage.setItem('__jotai_migration_completed', 'true');
    console.log('✅ Migration from Redux to Jotai completed successfully');

    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    localStorage.setItem('__jotai_migration_completed', 'true');
    return false;
  }
};

/**
 * Checks if migration has already been completed
 */
export const isMigrationCompleted = (): boolean => {
  return localStorage.getItem('__jotai_migration_completed') === 'true';
};

/**
 * Backup the current Redux state before migration
 */
export const backupReduxState = (): boolean => {
  try {
    const reduxData = localStorage.getItem('persist:diary');
    if (reduxData) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      localStorage.setItem(`persist:diary_backup_${timestamp}`, reduxData);
      console.log('✅ Redux state backed up');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return false;
  }
};

/**
 * Runs the complete migration process safely
 */
export const runStateMigration = (): boolean => {
  console.log('🔄 Starting state migration from Redux to Jotai...');

  // Check if already migrated
  if (isMigrationCompleted()) {
    console.log('✅ Migration already completed, skipping');
    return true;
  }

  // Backup current state
  const backupSuccess = backupReduxState();
  if (!backupSuccess) {
    console.log('No Redux state to backup, proceeding with fresh Jotai state');
  }

  // Run migration
  const migrationSuccess = migrateReduxToJotai();

  if (migrationSuccess) {
    console.log('🎉 State migration completed successfully!');
  } else {
    console.log('⚠️ Migration not needed or failed, using default Jotai state');
  }

  return migrationSuccess;
};
