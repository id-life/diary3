'use client';

import ReminderAddForm from '@/components/reminder/ReminderAddForm';
import ReminderRecords from '@/components/reminder/ReminderRecords';

export default function ReminderPage() {
  return (
    <>
      <h1 className="text-center font-DDin text-2xl font-bold">Add Reminder</h1>
      <ReminderAddForm />
      <ReminderRecords />
    </>
  );
}
