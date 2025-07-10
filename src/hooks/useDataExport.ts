/**
 * Data Export Hook
 * 
 * Provides functionality to export current application state for database migration
 * and localStorage backup purposes.
 */

import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  entryTypesArrayAtom, 
  entryInstancesMapAtom, 
  reminderRecordsAtom, 
  uiStateAtom 
} from '@/atoms';
import { 
  exportLocalStorageToDatabase,
  exportMemoryStateToDatabase,
  createDatabaseReadyString,
  createExportFilename,
  downloadExportAsFile,
  copyExportToClipboard,
  validateExportData,
  type DatabaseExportFormat
} from '@/utils/localStorageExport';
import { useAccessToken } from './app';
import { saveBackupList } from '@/api/github';

export interface ExportOptions {
  source: 'localStorage' | 'memory';
  includeMetadata: boolean;
  validate: boolean;
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<DatabaseExportFormat | null>(null);
  
  // Get current state from atoms
  const entryTypes = useAtomValue(entryTypesArrayAtom);
  const entryInstances = useAtomValue(entryInstancesMapAtom);
  const reminderRecords = useAtomValue(reminderRecordsAtom);
  const uiState = useAtomValue(uiStateAtom);
  const { accessToken } = useAccessToken();

  /**
   * Export current state to database-ready format
   */
  const exportToDatabase = async (options: Partial<ExportOptions> = {}) => {
    const opts: ExportOptions = {
      source: 'memory',
      includeMetadata: true,
      validate: true,
      ...options
    };

    setIsExporting(true);
    const exportMsg = toast.loading('📦 Preparing export data...');

    try {
      let exportData: DatabaseExportFormat;

      if (opts.source === 'localStorage') {
        exportData = exportLocalStorageToDatabase();
      } else {
        exportData = exportMemoryStateToDatabase(
          entryTypes,
          entryInstances,
          reminderRecords,
          uiState
        );
      }

      // Validate if requested
      if (opts.validate) {
        const validation = validateExportData(exportData);
        if (!validation.isValid) {
          throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings.length > 0) {
          console.warn('Export warnings:', validation.warnings);
        }
      }

      setLastExport(exportData);
      
      toast.update(exportMsg, {
        render: '✅ Export data ready for database',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      return exportData;
    } catch (error) {
      console.error('Export failed:', error);
      toast.update(exportMsg, {
        render: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Save current state directly to database (GitHub backup)
   */
  const saveToDatabase = async (options: Partial<ExportOptions> = {}) => {
    if (!accessToken) {
      toast.error('Please login with GitHub OAuth first');
      return false;
    }

    try {
      const exportData = await exportToDatabase(options);
      const filename = createExportFilename();

      const saveMsg = toast.loading('💾 Saving to database...');

      await saveBackupList({ 
        content: exportData, 
        fileName: filename 
      });

      toast.update(saveMsg, {
        render: '✅ Successfully saved to database',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      return true;
    } catch (error) {
      console.error('Database save failed:', error);
      toast.error(`Database save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  /**
   * Copy export data to clipboard for manual database entry
   */
  const copyToDatabaseString = async (options: Partial<ExportOptions> = {}) => {
    try {
      const exportData = await exportToDatabase(options);
      const success = await copyExportToClipboard(exportData);
      
      if (success) {
        toast.success('📋 Database-ready string copied to clipboard!');
      } else {
        toast.error('❌ Failed to copy to clipboard');
      }
      
      return success;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  };

  /**
   * Download export data as JSON file
   */
  const downloadAsFile = async (options: Partial<ExportOptions> = {}) => {
    try {
      const exportData = await exportToDatabase(options);
      const filename = createExportFilename();
      
      downloadExportAsFile(exportData, filename);
      toast.success(`📁 Export downloaded as ${filename}`);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  /**
   * Get export data as string for display
   */
  const getExportString = async (options: Partial<ExportOptions> = {}): Promise<string | null> => {
    try {
      const exportData = await exportToDatabase(options);
      return createDatabaseReadyString(exportData);
    } catch (error) {
      console.error('Get export string failed:', error);
      return null;
    }
  };

  /**
   * Clear localStorage (for decoupling)
   */
  const clearLocalStorage = () => {
    const confirmMsg = 'This will clear all localStorage data. Continue?';
    if (window.confirm(confirmMsg)) {
      const keysToRemove = [
        'entryTypes.entryTypesArray',
        'entryInstances.entryInstancesMap',
        'reminderRecords.reminderRecords',
        'uiState',
        'persist:diary'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      toast.success('🧹 localStorage cleared successfully');
      return true;
    }
    return false;
  };

  /**
   * Get export statistics
   */
  const getExportStats = () => {
    return {
      entryTypesCount: entryTypes.length,
      entryInstancesCount: Object.values(entryInstances).reduce((total, instances) => total + instances.length, 0),
      reminderRecordsCount: reminderRecords.length,
      totalDatesWithEntries: Object.keys(entryInstances).length,
      hasLocalStorageData: !!localStorage.getItem('entryTypes.entryTypesArray'),
      isAuthenticated: !!accessToken,
    };
  };

  return {
    // State
    isExporting,
    lastExport,
    
    // Actions
    exportToDatabase,
    saveToDatabase,
    copyToDatabaseString,
    downloadAsFile,
    getExportString,
    clearLocalStorage,
    
    // Utilities
    getExportStats,
  };
};