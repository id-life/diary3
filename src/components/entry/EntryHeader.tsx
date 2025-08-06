import { globalStateAtom } from '@/atoms';
import { safeNumberValue } from '@/utils';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import { PropsWithChildren, useMemo } from 'react';
import { HiChevronLeft } from 'react-icons/hi';
interface IProps extends PropsWithChildren {
  layout?: 'flow' | 'centered';
  backLink?: string;
}

interface ILeftContentProps {
  backLink?: string;
  currentStreakByEntry: number;
}

const StreakDisplay = ({ currentStreakByEntry }: { currentStreakByEntry: number }) => (
  <div className="flex items-center justify-center gap-1">
    <span className="text-[1.625rem]/10 font-semibold">{currentStreakByEntry}</span>
    <span className="text-left text-xs/3">
      STREAK
      <br />
      DAY{currentStreakByEntry > 1 ? 'S' : ''}
    </span>
  </div>
);

const LeftContent = ({ backLink, currentStreakByEntry }: ILeftContentProps) => {
  if (backLink) {
    return (
      <Link href={backLink}>
        <HiChevronLeft className="size-6 text-diary-navy" />
      </Link>
    );
  }
  return <StreakDisplay currentStreakByEntry={currentStreakByEntry} />;
};

export default function EntryHeader({ children, layout = 'flow', backLink }: IProps) {
  const globalState = useAtomValue(globalStateAtom);
  const currentStreakByEntry = useMemo(() => safeNumberValue(globalState?.currentStreakByEntry), [globalState]);

  if (layout === 'centered') {
    return (
      <div className="z-20 relative sticky top-0 -mx-4 flex items-center justify-center bg-background px-4 pb-4 pt-5 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pt-1">
          <LeftContent backLink={backLink} currentStreakByEntry={currentStreakByEntry} />
        </div>
        {children}
      </div>
    );
  }

  return (
<div className="sticky top-0 z-30 flex items-center gap-2 bg-white px-4 pb-4 pt-5 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.05)]">      <LeftContent currentStreakByEntry={currentStreakByEntry} />
      {children}
    </div>
  );
}
