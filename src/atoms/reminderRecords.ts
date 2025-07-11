import { atom } from 'jotai';
import { ReminderRecord } from '@/entry/types-constants';
import { toast } from 'react-toastify';
import { hybridReminderRecordsAtom } from './databaseFirst';

// Core data atom with database-first approach
export const reminderRecordsAtom = hybridReminderRecordsAtom;

// Action atoms for managing reminder records
export const createReminderAtom = atom(
  null,
  (get, set, reminderRecord: ReminderRecord) => {
    const current = get(reminderRecordsAtom);
    set(reminderRecordsAtom, [...current, reminderRecord]);
    toast.success(`Create ${reminderRecord.title} successfully`);
  }
);

export const updateReminderAtom = atom(
  null,
  (get, set, reminderRecord: ReminderRecord) => {
    const current = get(reminderRecordsAtom);
    const indexToUpdate = current.findIndex((reminder: any) => reminder.id === reminderRecord.id);
    
    if (indexToUpdate >= 0) {
      const updated = [...current];
      updated[indexToUpdate] = reminderRecord;
      set(reminderRecordsAtom, updated);
      toast.success(`Update ${reminderRecord.title} successfully`);
    }
  }
);

export const deleteReminderAtom = atom(
  null,
  (get, set, reminderId: string) => {
    const current = get(reminderRecordsAtom);
    const filtered = current.filter((reminder: any) => reminder.id !== reminderId);
    set(reminderRecordsAtom, filtered);
  }
);