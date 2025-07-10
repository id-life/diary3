import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { EntryInstance, getDateStringFromTimestamp } from '@/entry/types-constants';

// Core data atom with localStorage persistence
export const entryInstancesMapAtom = atomWithStorage<{ [key: string]: EntryInstance[] }>('entryInstances.entryInstancesMap', {});

// Action atoms for managing entry instances
export const initDayEntryInstancesAtom = atom(
  null,
  (get, set, payload: { dateStr: string }) => {
    const current = get(entryInstancesMapAtom);
    if (!current[payload.dateStr]) {
      set(entryInstancesMapAtom, {
        ...current,
        [payload.dateStr]: []
      });
    }
  }
);

export const createEntryInstanceAtom = atom(
  null,
  (get, set, entryInstance: EntryInstance) => {
    const dateStr = getDateStringFromTimestamp(entryInstance.createdAt);
    const current = get(entryInstancesMapAtom);
    
    set(entryInstancesMapAtom, {
      ...current,
      [dateStr]: current[dateStr] ? [...current[dateStr], entryInstance] : [entryInstance]
    });
  }
);

export const updateEntryInstanceAtom = atom(
  null,
  (get, set, entryInstance: EntryInstance) => {
    try {
      const dateStr = getDateStringFromTimestamp(entryInstance.createdAt);
      const current = get(entryInstancesMapAtom);
      
      if (current[dateStr]) {
        const indexToUpdate = current[dateStr].findIndex((ei) => ei.id === entryInstance.id);
        if (indexToUpdate >= 0) {
          const updatedDateEntries = [...current[dateStr]];
          updatedDateEntries[indexToUpdate] = entryInstance;
          
          set(entryInstancesMapAtom, {
            ...current,
            [dateStr]: updatedDateEntries
          });
        } else {
          console.warn(`Entry instance not found for update: ${entryInstance.id} on ${dateStr}`);
          // Optionally, create the entry if it doesn't exist
          set(entryInstancesMapAtom, {
            ...current,
            [dateStr]: [...current[dateStr], entryInstance]
          });
        }
      } else {
        console.warn(`Date entry not found for update: ${dateStr}, creating new date entry`);
        set(entryInstancesMapAtom, {
          ...current,
          [dateStr]: [entryInstance]
        });
      }
    } catch (error) {
      console.error('Failed to update entry instance:', error, entryInstance);
      throw new Error(`Failed to update entry instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const updateChangeEntryIdEntryInstanceAtom = atom(
  null,
  (get, set, payload: { preEntryTypeId: string; changeEntryTypeId: string }) => {
    try {
      const { preEntryTypeId, changeEntryTypeId } = payload;
      
      if (!preEntryTypeId || !changeEntryTypeId) {
        throw new Error('Invalid entry type IDs provided for entry type change');
      }
      
      const current = get(entryInstancesMapAtom);
      const updated = { ...current };
      
      let updatedCount = 0;
      for (const key in updated) {
        if (!updated[key]?.length) continue;
        
        updated[key] = updated[key].map((entryInstance) => {
          if (entryInstance.entryTypeId === preEntryTypeId) {
            updatedCount++;
            return { ...entryInstance, entryTypeId: changeEntryTypeId };
          }
          return entryInstance;
        });
      }
      
      console.log(`Updated ${updatedCount} entry instances from ${preEntryTypeId} to ${changeEntryTypeId}`);
      set(entryInstancesMapAtom, updated);
    } catch (error) {
      console.error('Failed to update entry type IDs:', error, payload);
      throw new Error(`Failed to update entry type IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const deleteEntryInstanceAtom = atom(
  null,
  (get, set, entryInstance: EntryInstance) => {
    const dateStr = getDateStringFromTimestamp(entryInstance.createdAt);
    const current = get(entryInstancesMapAtom);
    
    if (current[dateStr]) {
      const filtered = current[dateStr].filter((ei) => ei.id !== entryInstance.id);
      set(entryInstancesMapAtom, {
        ...current,
        [dateStr]: filtered
      });
    }
  }
);

export const deleteEntryInstanceByEntryTypeIdAtom = atom(
  null,
  (get, set, deleteEntryTypeId: string) => {
    try {
      if (!deleteEntryTypeId) {
        throw new Error('Invalid entry type ID provided for deletion');
      }
      
      const current = get(entryInstancesMapAtom);
      const updated = { ...current };
      
      let deletedCount = 0;
      for (const key in updated) {
        if (!updated[key]?.length) continue;
        const originalLength = updated[key].length;
        updated[key] = updated[key].filter(({ entryTypeId }) => entryTypeId !== deleteEntryTypeId);
        deletedCount += originalLength - updated[key].length;
      }
      
      console.log(`Deleted ${deletedCount} entry instances for entry type: ${deleteEntryTypeId}`);
      set(entryInstancesMapAtom, updated);
    } catch (error) {
      console.error('Failed to delete entry instances by type ID:', error, deleteEntryTypeId);
      throw new Error(`Failed to delete entry instances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const emptyEntryInstanceAtom = atom(
  null,
  (get, set) => {
    set(entryInstancesMapAtom, {});
  }
);

// Computed atoms
export const allDaysFilledBySomeEntryInstancesAtom = atom((get) => {
  const entryInstancesMap = get(entryInstancesMapAtom);
  return Object.keys(entryInstancesMap).sort();
});