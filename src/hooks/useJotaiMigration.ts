// Temporary stub for removed useJotaiMigration hook
// This will be replaced with direct atom usage in each component

import { 
  entryTypesArrayAtom, 
  entryInstancesMapAtom, 
  reminderRecordsAtom, 
  uiStateAtom,
  entryTypeIdsAtom,
  createEntryTypeAtom,
  updateEntryTypeAtom,
  deleteEntryTypeAtom,
  createEntryInstanceAtom,
  updateEntryInstanceAtom,
  deleteEntryInstanceAtom,
  deleteEntryInstanceByEntryTypeIdAtom,
  updateChangeEntryIdEntryInstanceAtom,
  createReminderAtom,
  updateReminderAtom,
  deleteReminderAtom,
  enterEntryTypeEditAtom,
  exitEntryTypeEditAtom,
  enterReminderEditAtom,
  exitReminderEditAtom
} from '@/atoms';
import { useAtomValue, useSetAtom } from 'jotai';

// This is a temporary compatibility layer
export const useJotaiSelectors = () => {
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const reminderRecords = useAtomValue(reminderRecordsAtom);
  const uiState = useAtomValue(uiStateAtom);
  const entryTypeIds = useAtomValue(entryTypeIdsAtom);

  return {
    entryTypesArray,
    entryInstancesMap,
    reminderRecords,
    uiState,
    entryTypeIds,
  };
};

export const useJotaiActions = () => {
  const createEntryType = useSetAtom(createEntryTypeAtom);
  const updateEntryType = useSetAtom(updateEntryTypeAtom);
  const deleteEntryType = useSetAtom(deleteEntryTypeAtom);
  const createEntryInstance = useSetAtom(createEntryInstanceAtom);
  const updateEntryInstance = useSetAtom(updateEntryInstanceAtom);
  const deleteEntryInstance = useSetAtom(deleteEntryInstanceAtom);
  const deleteEntryInstanceByEntryTypeId = useSetAtom(deleteEntryInstanceByEntryTypeIdAtom);
  const updateChangeEntryIdEntryInstance = useSetAtom(updateChangeEntryIdEntryInstanceAtom);
  const createReminder = useSetAtom(createReminderAtom);
  const updateReminder = useSetAtom(updateReminderAtom);
  const deleteReminder = useSetAtom(deleteReminderAtom);
  const enterEntryTypeEdit = useSetAtom(enterEntryTypeEditAtom);
  const exitEntryTypeEdit = useSetAtom(exitEntryTypeEditAtom);
  const enterReminderEdit = useSetAtom(enterReminderEditAtom);
  const exitReminderEdit = useSetAtom(exitReminderEditAtom);

  return {
    createEntryType,
    updateEntryType,
    deleteEntryType,
    createEntryInstance,
    updateEntryInstance,
    deleteEntryInstance,
    deleteEntryInstanceByEntryTypeId,
    updateChangeEntryIdEntryInstance,
    createReminder,
    updateReminder,
    deleteReminder,
    enterEntryTypeEdit,
    exitEntryTypeEdit,
    enterReminderEdit,
    exitReminderEdit,
    // Legacy names for compatibility
    updateEntryTypeId: updateEntryType,
  };
};