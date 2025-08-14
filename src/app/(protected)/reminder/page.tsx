'use client';

import { useJotaiSelectors } from '@/hooks/useJotaiMigration';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/loading';
import ReminderListPage from '@/components/reminder/ReminderList';

export default function ReminderGatePage() {
  const { reminderRecords } = useJotaiSelectors();
  const router = useRouter();

  useEffect(() => {
    if (reminderRecords && reminderRecords.length === 0) {
      router.replace('/reminder/add');
    }
  }, [reminderRecords, router]);

  if (reminderRecords === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (reminderRecords.length > 0) {
    return <ReminderListPage />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loading />
    </div>
  );
}
