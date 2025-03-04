'use client';

import EntryChart from '@/components/entry/EntryChart';
import EntryInstanceList from '@/components/entry/EntryInstanceList';
import EntryProgressBar from '@/components/entry/EntryProgressBar';
import EntryTypeListForCompletion from '@/components/entry/EntryTypeListForCompletion';
import HeaderDatetime from '@/components/entry/HeaderDatetime';
import { selectEntryInstancesMap, useAppSelector } from '@/entry/store';
import { selectedChartDateAtom } from '@/atoms/app';
import { formatDate } from '@/utils/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export default function EntryPage() {
  const entryInstancesMap = useAppSelector(selectEntryInstancesMap);
  const selectedChartDate = useAtomValue(selectedChartDateAtom);
  const selectedDay = useMemo(() => selectedChartDate || dayjs().format('YYYY-MM-DD'), [selectedChartDate]);
  const selectedTotalPoints = useMemo(
    () =>
      entryInstancesMap[selectedDay]?.length
        ? entryInstancesMap[selectedDay].reduce(
            (pre, cur) => pre + (typeof cur?.points === 'number' ? cur.points : parseFloat(cur.points)),
            0,
          )
        : 0,
    [entryInstancesMap, selectedDay],
  );
  const entryInstancesArray = useMemo(() => entryInstancesMap[selectedDay], [entryInstancesMap, selectedDay]);

  // console.log({ selectedDay, selectedChartDate, selectedTotalPoints });
  return (
    <>
      <HeaderDatetime />
      <EntryProgressBar points={selectedTotalPoints} />
      <h2 className="mt-4 flex items-center justify-center pt-2 text-xl font-semibold">
        Selected Date {formatDate(selectedDay)}
      </h2>
      <EntryChart entryInstancesMap={entryInstancesMap} />
      <EntryInstanceList entryInstancesArray={entryInstancesArray} />
      <EntryTypeListForCompletion selectedDateStr={selectedDay} />
    </>
  );
}
