
import { useJotaiSelectors } from '@/hooks/useJotaiMigration';
import ReminderRecordCard from './ReminderRecordCard';

export default function ReminderRecords() {
  // TODO: Replace with direct atom usage
  const { reminderRecords } = useJotaiSelectors();

  return (
    <div className="flex flex-col gap-2">
      {reminderRecords.map((record: any) => (
        <ReminderRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
