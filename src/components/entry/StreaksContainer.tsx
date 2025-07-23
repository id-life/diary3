import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { entryInstancesMapAtom, entryTypesArrayAtom } from '@/atoms';
import { EntryType, RoutineEnum } from '@/entry/types-constants';
import { calcEntryTypeLongestStreaks } from '@/utils/entry';
import { EntryStreakCard } from './EntryStreakCard';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import clsx from 'clsx';

type StreaksContainerProps = {
  entryTypesArray: EntryType[];
  routine: RoutineEnum;
};

export function StreaksContainer({ entryTypesArray, routine }: StreaksContainerProps) {
  const isDesktop = useIsDesktop();
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);

  const sortedEntryTypes = useMemo(() => {
    const routineTypes = entryTypesArray.filter((item) => item.routine === routine);
    const entryTypeMaxStreaks = calcEntryTypeLongestStreaks(entryInstancesMap, routine);

    routineTypes.sort((a, b) => {
      const maxA = entryTypeMaxStreaks[a.id] ?? 0;
      const maxB = entryTypeMaxStreaks[b.id] ?? 0;
      if (maxA !== maxB) {
        return maxB - maxA;
      }
      return b.defaultPoints - a.defaultPoints;
    });

    return routineTypes;
  }, [entryInstancesMap, entryTypesArray, routine]);

  if (sortedEntryTypes.length === 0) {
    return <div className="py-8 text-center text-gray-500">No {routine} habits found.</div>;
  }

  return (
    <div className={clsx('flex gap-3', isDesktop ? 'flex-row flex-wrap gap-4' : 'flex-col')}>
      {sortedEntryTypes.map((entryType) => (
        <EntryStreakCard key={entryType.id} entryType={entryType} routine={routine} />
      ))}
    </div>
  );
}
