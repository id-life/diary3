import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { entryInstancesMapAtom } from '@/atoms';
import { useEntryStreakGetters } from '@/hooks/entryType';
import { calcEntryTypeLongestStreaks } from '@/utils/entry';
import { EntryType, RoutineEnum, StreakStatus, getDatePeriods } from '../../entry/types-constants';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ClockSVG, TrashSVG } from '../svg';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const statusColorMap: { [key in Exclude<StreakStatus, 'COMPLETED'>]: string } = {
  [StreakStatus.UNCREATED]: 'bg-gray-100',
  [StreakStatus.INCOMPLETE]: 'bg-rose-200',
  [StreakStatus.WARNING]: 'bg-amber-200',
  [StreakStatus.COMPLETED]: 'bg-green-200',
};

type EntryStreakCardProps = {
  entryType: EntryType;
  routine: RoutineEnum;
};

export function EntryStreakCard({ entryType, routine }: EntryStreakCardProps) {
  const isDesktop = useIsDesktop();
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const { deleteEntryType, deleteEntryInstanceByEntryTypeId, enterEntryTypeEdit } = useJotaiActions();

  const { getStatus, getHeader, getCurrentStreak } = useEntryStreakGetters(routine);

  const periods = useMemo(() => getDatePeriods(routine, 7), [routine]);

  const currentStreak = useMemo(() => getCurrentStreak(entryType), [getCurrentStreak, entryType]);
  const longestStreak = useMemo(() => {
    const streaks = calcEntryTypeLongestStreaks(entryInstancesMap, routine);
    return streaks[entryType.id] ?? 0;
  }, [entryInstancesMap, routine, entryType.id]);

  const handleEdit = () => {
    enterEntryTypeEdit({ entryTypeId: entryType.id });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${entryType.title}" and all its records?`)) {
      deleteEntryType(entryType.id);
      deleteEntryInstanceByEntryTypeId(entryType.id);
    }
  };

  const primaryColor = `#${entryType.themeColors[0]}`;

  return (
    <Card className={clsx('flex w-full flex-col gap-3 p-3 text-diary-primary', isDesktop && 'w-auto')} onClick={handleEdit}>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-xs">
        <span className="mr-auto rounded-[4px] px-1.5 py-1 font-medium text-white" style={{ backgroundColor: primaryColor }}>
          {entryType.title}
        </span>
        <span className="flex items-center gap-0.5 ">
          <ClockSVG className="opacity-50" />
          {dayjs().format('ddd YYYY MMM DD')}
        </span>
        <div className="inline-flex items-center rounded-[4px] border border-gray-200 p-0.5 text-sm text-xs">
          <span className="pl-1.5 pr-1 text-gray-500">Point</span>
          <span className="rounded-[4px] bg-gray-100 px-1.5 py-0.5 font-semibold text-diary-navy">
            {entryType.defaultPoints}
          </span>
        </div>
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon"
          className="flex h-5 w-5 items-center justify-center rounded bg-[#FF000433] text-[#FF0004]"
        >
          <TrashSVG className="size-3" />
        </Button>
      </div>

      {periods.length > 0 && (
        <div className="grid grid-cols-7 gap-[0.5625rem] md:gap-3">
          {periods.map((period, index) => {
            const status = getStatus(period, entryType, index === periods.length - 1);
            const isCompleted = status === StreakStatus.COMPLETED;

            return (
              <div key={period.start} className="flex flex-col items-center gap-1.5">
                <div
                  className={clsx('aspect-square w-full rounded-[4px]', !isCompleted && statusColorMap[status])}
                  style={isCompleted ? { backgroundColor: primaryColor } : {}}
                />
                <span className="whitespace-pre-wrap text-center text-xs">{getHeader(period)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-end justify-between">
        <div className="space-x-1">
          <span className="text-xl font-semibold">{currentStreak}</span>
          <span className="text-[0.625rem] opacity-50">Combo</span>
        </div>
        {entryType.routine !== RoutineEnum.adhoc && (
          <div className="text-[0.625rem] opacity-50">
            Total ({currentStreak}/{longestStreak})
          </div>
        )}
      </div>
    </Card>
  );
}
