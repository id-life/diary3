import { useJotaiSelectors } from '@/hooks/useJotaiMigration';
import ReminderRecordCard from './ReminderRecordCard';

export default function ReminderRecords() {
  const { reminderRecords } = useJotaiSelectors();

  return (
    <div className="flex flex-col gap-2">
      {reminderRecords.map((record) => (
        <ReminderRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
