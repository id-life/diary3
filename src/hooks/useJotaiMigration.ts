/**
 * Hook for accessing Jotai atoms with compatibility layer for Redux migration
 * 
 * This hook provides a transition layer from Redux selectors to Jotai atoms
 * while maintaining the same API for components during migration.
 */

import { useAtomValue, useSetAtom } from 'jotai';
import {
  entryTypesArrayAtom,
  entryTypeIdsAtom,
  entryInstancesMapAtom,
  allDaysFilledBySomeEntryInstancesAtom,
  reminderRecordsAtom,
  dateStrAtom,
  uiStateAtom,
  createEntryTypeAtom,
  updateEntryTypeAtom,
  updateEntryTypeIdAtom,
  deleteEntryTypeAtom,
  createEntryInstanceAtom,
  updateEntryInstanceAtom,
  updateChangeEntryIdEntryInstanceAtom,
  deleteEntryInstanceAtom,
  deleteEntryInstanceByEntryTypeIdAtom,
  emptyEntryInstanceAtom,
  initDayEntryInstancesAtom,
  createReminderAtom,
  updateReminderAtom,
  deleteReminderAtom,
  initDateStrAtom,
  enterEntryTypeEditAtom,
  enterReminderEditAtom,
  exitEntryTypeEditAtom,
  exitReminderEditAtom,
} from '@/atoms';
import { EntryType, EntryInstance, ReminderRecord } from '@/entry/types-constants';

/**
 * Hook that replaces Redux selectors with Jotai atoms
 */
export const useJotaiSelectors = () => {
  // Data selectors
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryTypeIds = useAtomValue(entryTypeIdsAtom);
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const reminderRecords = useAtomValue(reminderRecordsAtom);
  const allDaysFilledBySomeEntryInstances = useAtomValue(allDaysFilledBySomeEntryInstancesAtom);
  
  // UI selectors
  const dateStr = useAtomValue(dateStrAtom);
  const uiState = useAtomValue(uiStateAtom);

  return {
    // Data
    entryTypesArray,
    entryTypeIds,
    entryInstancesMap,
    reminderRecords,
    allDaysFilledBySomeEntryInstances,
    
    // UI
    dateStr,
    uiState,
  };
};

/**
 * Hook that replaces Redux dispatch with Jotai setters
 */
export const useJotaiActions = () => {
  // Entry Types actions
  const createEntryType = useSetAtom(createEntryTypeAtom);
  const updateEntryType = useSetAtom(updateEntryTypeAtom);
  const updateEntryTypeId = useSetAtom(updateEntryTypeIdAtom);
  const deleteEntryType = useSetAtom(deleteEntryTypeAtom);

  // Entry Instances actions
  const createEntryInstance = useSetAtom(createEntryInstanceAtom);
  const updateEntryInstance = useSetAtom(updateEntryInstanceAtom);
  const updateChangeEntryIdEntryInstance = useSetAtom(updateChangeEntryIdEntryInstanceAtom);
  const deleteEntryInstance = useSetAtom(deleteEntryInstanceAtom);
  const deleteEntryInstanceByEntryTypeId = useSetAtom(deleteEntryInstanceByEntryTypeIdAtom);
  const emptyEntryInstance = useSetAtom(emptyEntryInstanceAtom);
  const initDayEntryInstances = useSetAtom(initDayEntryInstancesAtom);

  // Reminder Records actions
  const createReminder = useSetAtom(createReminderAtom);
  const updateReminder = useSetAtom(updateReminderAtom);
  const deleteReminder = useSetAtom(deleteReminderAtom);

  // UI actions
  const initDateStr = useSetAtom(initDateStrAtom);
  const enterEntryTypeEdit = useSetAtom(enterEntryTypeEditAtom);
  const enterReminderEdit = useSetAtom(enterReminderEditAtom);
  const exitEntryTypeEdit = useSetAtom(exitEntryTypeEditAtom);
  const exitReminderEdit = useSetAtom(exitReminderEditAtom);

  return {
    // Entry Types
    createEntryType,
    updateEntryType,
    updateEntryTypeId,
    deleteEntryType,

    // Entry Instances
    createEntryInstance,
    updateEntryInstance,
    updateChangeEntryIdEntryInstance,
    deleteEntryInstance,
    deleteEntryInstanceByEntryTypeId,
    emptyEntryInstance,
    initDayEntryInstances,

    // Reminder Records
    createReminder,
    updateReminder,
    deleteReminder,

    // UI
    initDateStr,
    enterEntryTypeEdit,
    enterReminderEdit,
    exitEntryTypeEdit,
    exitReminderEdit,
  };
};

/**
 * Combined hook that provides both selectors and actions
 * This is the main hook components should use for state management
 */
export const useJotaiStore = () => {
  const selectors = useJotaiSelectors();
  const actions = useJotaiActions();

  return {
    ...selectors,
    ...actions,
  };
};