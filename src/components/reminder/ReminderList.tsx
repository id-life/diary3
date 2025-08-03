'use client';

import EntryHeader from '@/components/entry/EntryHeader';
import ReminderRecords from '@/components/reminder/ReminderRecords';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ReminderListPage() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex-grow px-4">
        <EntryHeader layout="centered">
          <span className="text-center text-lg font-semibold">Reminder</span>
        </EntryHeader>

        <ReminderRecords />
      </div>

      <div className="sticky bottom-0 px-6 pb-10">
        <Link href="/reminder/add" passHref>
          <Button variant="primary" className="font-semibol w-full rounded-[0.5rem] text-sm">
            Create Reminder
          </Button>
        </Link>
      </div>
    </div>
  );
}
