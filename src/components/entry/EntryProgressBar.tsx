import { selectedTotalPointsAtom } from '@/atoms/chart';
import { cn } from '@/utils';
import { Progress } from 'antd';
import { useAtomValue } from 'jotai';

function EntryProgressBar({ className }: { className?: string }) {
  const points = useAtomValue(selectedTotalPointsAtom);

  const percent = Math.ceil((points * 10000) / 24) / 100;
  const gradient = {
    '0%': '#3385E4',
    '25%': '#6CD261',
    '50%': '#F2DB2D',
    '75%': '#EA7E30',
    '100%': '#924FDA',
  };

  return (
    <div className={cn('relative flex w-full gap-2 text-xs/3', className)}>
      <div className="absolute left-0 top-[0.4rem] z-[1] flex flex-col items-center gap-2">
        <i className="block rounded-full border-2 border-white bg-transparent p-1" />
        <span>0</span>
      </div>
      <div className="absolute left-1/3 top-[0.4rem] z-[1] flex flex-col items-center gap-2">
        <i className="block rounded-full border-2 border-white bg-transparent p-1" />
        <span>8</span>
      </div>
      <div className="absolute left-2/3 top-[0.4rem] z-[1] flex flex-col items-center gap-2">
        <i className="block rounded-full border-2 border-white bg-transparent p-1" />
        16
      </div>
      <div className="absolute -right-0.5 top-[0.4rem] z-[1] flex flex-col items-center gap-2">
        <i className="block rounded-full border-2 border-white bg-black p-1" />
        24
      </div>
      <Progress className="flex-grow" status="active" strokeColor={gradient} showInfo={false} percent={percent} />
      <div
        className="clip-path-message absolute top-10 z-10 w-fit -translate-y-[85%] rotate-180 bg-black px-1 pb-1.5 pt-0.5 text-[#FAFAFA]"
        style={{ left: `calc(${Math.min(percent, 100)}% - 0.4rem)` }}
      >
        <span className="block rotate-180 text-xs">{points}</span>
      </div>
    </div>
  );
}

export default EntryProgressBar;
