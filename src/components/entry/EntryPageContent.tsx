'use client';
import { globalStateAtom } from '@/atoms';
import EntryChart from '@/components/entry/EntryChart';
import EntryInstanceList from '@/components/entry/EntryInstanceList';
import EntryProgressBar from '@/components/entry/EntryProgressBar';
import EntryTypeListForCompletion from '@/components/entry/EntryTypeListForCompletion';
import { safeNumberValue } from '@/utils';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export default function EntryPageContent() {
  const globalState = useAtomValue(globalStateAtom);
  const currentStreakByEntry = useMemo(() => safeNumberValue(globalState?.currentStreakByEntry), [globalState]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4 pb-10 text-center">
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-[#FDFEFE] px-4 pb-4 pt-5 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center gap-1">
          <span className="text-[1.625rem]/10 font-semibold">{currentStreakByEntry}</span>
          <span className="text-left text-xs/3">
            STREAK
            <br />
            DAY{currentStreakByEntry > 1 ? 'S' : ''}
          </span>
        </div>
        <EntryProgressBar className="grow" />
      </div>
      <EntryChart />
      <EntryInstanceList />
      <EntryTypeListForCompletion />
    </div>
  );
}
