import { useJotaiActions } from '@/hooks/useJotaiMigration';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { ReminderRecord, ReminderType } from '../../entry/types-constants';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useRouter } from 'next/navigation';
import { BellSVG, TrashSVG } from '../svg';

export type ReminderRecordCardProps = {
  record: ReminderRecord;
};

const ReminderRecordCard = ({ record }: ReminderRecordCardProps) => {
  const router = useRouter();
  const { deleteReminder, enterReminderEdit } = useJotaiActions();
  const { id, title, content, type, weekDay, monthDay, month } = record;

  const dateTag = useMemo(() => {
    if (type === ReminderType.weekly)
      return dayjs()
        .day(weekDay ?? 0)
        .format('ddd'); // e.g., "Sun"
    if (type === ReminderType.monthly)
      return dayjs()
        .date(monthDay ?? 1)
        .format('MMM DD'); // e.g., "Jul 08"
    if (type === ReminderType.annual)
      return dayjs()
        .month(month ?? 0)
        .format('MMM'); // e.g., "Jul"
    return null;
  }, [type, weekDay, monthDay, month]);

  const handleEdit = () => {
    enterReminderEdit({ reminderId: id });
    router.push('/reminder/add');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the reminder "${title}"?`)) {
      deleteReminder(id);
    }
  };

  return (
    <Card
      className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-[14px] py-3 pl-[14px] pr-[15px]"
      onClick={handleEdit}
    >
      <div className="flex-shrink-0 text-gray-400">
        <BellSVG />
      </div>

      <div className="flex-grow space-y-2 text-xs">
        <div className="flex items-center font-medium">
          <span className="text-sm font-semibold text-diary-primary">{title}</span>
          <span className="ml-2 rounded-[4px] bg-[#bcbbc4] px-1.5 py-1 text-white">{type}</span>
          {dateTag && <span className="ml-1.5 rounded bg-[#bcbbc4] px-1.5 py-1 text-white">{dateTag}</span>}
        </div>
        <p>{content}</p>
      </div>

      <Button
        onClick={handleDelete}
        variant="ghost"
        size="icon"
        className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[4px] bg-[#FF000433] text-[#FF0004]"
      >
        <TrashSVG />
      </Button>
    </Card>
  );
};

export default ReminderRecordCard;
