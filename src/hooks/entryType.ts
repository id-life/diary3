import { EntryType, RoutineEnum, StreakStatus, getEntryInstanceIdFromEntryType } from '@/entry/types-constants';
import { entryInstancesMapAtom } from '@/atoms';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useJotaiActions } from './useJotaiMigration';
import { toast } from 'react-toastify';

export const useEntryStreakGetters = (routine: RoutineEnum) => {
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const getHeader = useCallback(
    ({ start, end }: { start: string; end: string }) => {
      const s = dayjs(start);
      const e = dayjs(end);
      if (routine === RoutineEnum.daily) return e.format('MMM\nDD');
      else if (routine === RoutineEnum.weekly) return `${s.format('MMM DD')}-${e.format('MMM DD')}`;
      else if (routine === RoutineEnum.monthly) return e.format('MMM');
    },
    [routine],
  );
  const getStatus = useCallback(
    (period: { start: string; end: string }, entryType: EntryType, isLatest?: boolean): StreakStatus => {
      const { id, createdAt } = entryType;
      const { start, end } = period;
      const createAt = dayjs(createdAt);
      const s = dayjs(start);
      const e = dayjs(end);
      switch (routine) {
        case RoutineEnum.daily: {
          // s~e day have one entry is completed
          if (createAt.isAfter(e)) return StreakStatus.UNCREATED;
          const entries = entryInstancesMap[s.format('YYYY-MM-DD')];
          if (!entries?.length) return isLatest ? StreakStatus.WARNING : StreakStatus.INCOMPLETE;
          const isDone = entries.findIndex(({ entryTypeId }: any) => entryTypeId === id) !== -1;
          if (isDone) return StreakStatus.COMPLETED;
          else return isLatest ? StreakStatus.WARNING : StreakStatus.INCOMPLETE;
        }
        case RoutineEnum.weekly: {
          // s~e week have one entry is completed
          if (createAt.isAfter(e)) return StreakStatus.UNCREATED;
          for (let day = s; day.isBefore(e) || day.isSame(e); day = day.add(1, 'day')) {
            const entries = entryInstancesMap[day.format('YYYY-MM-DD')];
            if (entries?.length && entries.findIndex(({ entryTypeId }: any) => entryTypeId === id) !== -1) {
              return StreakStatus.COMPLETED;
            }
          }
          return isLatest ? StreakStatus.WARNING : StreakStatus.INCOMPLETE;
        }
        case RoutineEnum.monthly: {
          // s~e month have one entry is completed
          if (createAt.isAfter(e)) return StreakStatus.UNCREATED;
          for (let day = s; day.isBefore(e) || day.isSame(e); day = day.add(1, 'day')) {
            const entries = entryInstancesMap[day.format('YYYY-MM-DD')];
            if (entries?.length && entries.findIndex(({ entryTypeId }: any) => entryTypeId === id) !== -1) {
              return StreakStatus.COMPLETED;
            }
          }
          return isLatest ? StreakStatus.WARNING : StreakStatus.INCOMPLETE;
        }
        default:
          return StreakStatus.UNCREATED;
      }
    },
    [entryInstancesMap, routine],
  );
  return {
    getHeader,
    getStatus,
  };
};

export const useCreateNewEntryInstance = (entryType: EntryType) => {
  const { createEntryInstance } = useJotaiActions();

  const createEntryInstanceWithDefaults = useCallback(
    (selectedDayStr?: string | null, customPoints?: number, customNotes?: string) => {
      const selectedDay = selectedDayStr ? dayjs(selectedDayStr) : dayjs();
      const [y, m, d] = [selectedDay.year(), selectedDay.month(), selectedDay.date()];
      const now = dayjs().year(y).month(m).date(d);

      const newEntryInstance = {
        id: getEntryInstanceIdFromEntryType(entryType, now),
        createdAt: now.valueOf(),
        updatedAt: now.valueOf(),
        entryTypeId: entryType.id,
        points: customPoints ?? entryType.defaultPoints,
        notes: customNotes ?? '',
      };

      createEntryInstance(newEntryInstance);

      // Show success toast with entry type title
      toast.success(`Completed "${entryType.title}"`);

      return newEntryInstance;
    },
    [entryType, createEntryInstance],
  );

  return {
    createEntryInstanceWithDefaults,
  };
};
