import { globalStateAtom } from '@/atoms';
import { safeNumberValue } from '@/utils';
import { useAtomValue } from 'jotai';
import { PropsWithChildren, useMemo } from 'react';

interface IProps extends PropsWithChildren {}

export default function EntryHeader({ children }: IProps) {
  const globalState = useAtomValue(globalStateAtom);
  const currentStreakByEntry = useMemo(() => safeNumberValue(globalState?.currentStreakByEntry), [globalState]);

  return (
    <div className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-[#FDFEFE] px-4 pb-4 pt-5 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-center gap-1">
        <span className="text-[1.625rem]/10 font-semibold">{currentStreakByEntry}</span>
        <span className="text-left text-xs/3">
          STREAK
          <br />
          DAY{currentStreakByEntry > 1 ? 'S' : ''}
        </span>
      </div>
      {children}
    </div>
  );
}
