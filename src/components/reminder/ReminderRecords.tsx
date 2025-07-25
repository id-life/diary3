import { useJotaiSelectors } from '@/hooks/useJotaiMigration';
import ReminderRecordCard from './ReminderRecordCard';

export default function ReminderRecords() {
  // TODO: Replace with direct atom usage
  const { reminderRecords } = useJotaiSelectors();

  if (!reminderRecords || reminderRecords.length === 0) {
    return <div className="py-8 text-center text-gray-500">No reminders found.</div>;
  }

  return (
    <div className="mt-5 flex flex-col gap-3">
      {reminderRecords.map((record: any) => (
        <ReminderRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
