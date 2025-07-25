'use client';

import EntryHeader from '@/components/entry/EntryHeader';
import ReminderAddForm from '@/components/reminder/ReminderAddForm';
import { updatingReminderIdAtom } from '@/atoms';
import { useAtomValue } from 'jotai';

export default function AddReminderPage() {
  const updatingReminderId = useAtomValue(updatingReminderIdAtom);
  const isEditMode = !!updatingReminderId;

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4">
      <EntryHeader layout="centered">
        <h1 className="text-center text-lg font-semibold">{isEditMode ? 'Edit Reminder' : 'Create Reminder'}</h1>
      </EntryHeader>

      <ReminderAddForm />
    </div>
  );
}
