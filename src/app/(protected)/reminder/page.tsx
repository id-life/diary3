'use client';

import { useJotaiSelectors } from '@/hooks/useJotaiMigration';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/loading';
import ReminderListPage from '@/components/reminder/ReminderList';

export default function ReminderGatePage() {
  const { reminderRecords } = useJotaiSelectors();
  const router = useRouter();
  const [isStateReady, setIsStateReady] = useState(false);

  useEffect(() => {
    if (reminderRecords) {
      if (reminderRecords.length === 0) {
        router.replace('/reminder/add');
      } else {
        setIsStateReady(true);
      }
    }
  }, [reminderRecords, router]);

  if (isStateReady && reminderRecords && reminderRecords.length > 0) {
    return <ReminderListPage />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loading />
    </div>
  );
}
