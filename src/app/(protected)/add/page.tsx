'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { entryTypesArrayAtom } from '@/atoms';
import EntryHeader from '@/components/entry/EntryHeader';
import { StreaksContainer } from '@/components/entry/StreaksContainer';
import Segmented from '@/components/segmented';
import { RoutineEnum } from '@/entry/types-constants';

export default function AddPage() {
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineEnum>(RoutineEnum.daily);

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto px-4 pb-40 text-center">
      <EntryHeader layout="centered">
        <span className="mx-auto text-lg font-semibold">Streaks Table</span>
      </EntryHeader>

      <Segmented
        options={[
          { label: 'Daily', value: RoutineEnum.daily },
          { label: 'Weekly', value: RoutineEnum.weekly },
          { label: 'Monthly', value: RoutineEnum.monthly },
          { label: 'Adhoc', value: RoutineEnum.adhoc },
        ]}
        value={selectedRoutine}
        onChange={(value) => setSelectedRoutine(value as RoutineEnum)}
        className="w-full bg-transparent text-sm"
        optionClass="text-[#8C8A99]"
        selectedClass="!text-diary-primary font-semibold"
        selectedBgClass="bg-[#e4e4e7] rounded-[8px]"
      />

      <StreaksContainer entryTypesArray={entryTypesArray} routine={selectedRoutine} />
    </div>
  );
}
