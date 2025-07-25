'use client';
import { formatDate } from '@/utils/date';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { PiStepsDuotone } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import { EntryType } from '../../entry/types-constants';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import { Button } from '../ui/button';
import Tooltip from '../tooltip';
import EntryTypeCompletionForm from './EntryTypeCompletionForm';
import DiaryIcons from '../icon/DiaryIcons';
import { selectedChartDateAtom } from '@/atoms';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';

const EntryTypeCardDeleteButton = (props: { entryType: EntryType }) => {
  const { deleteEntryType, deleteEntryInstanceByEntryTypeId } = useJotaiActions();

  return (
    <Button
      variant="danger"
      size="small"
      className="rounded-lg border-diary-danger bg-transparent text-diary-danger hover:opacity-80"
      onClick={() => {
        deleteEntryType(props.entryType.id);
        deleteEntryInstanceByEntryTypeId(props.entryType.id);
      }}
    >
      <AiFillDelete className="h-full w-6" />
    </Button>
  );
};

const EntryTypeCardEditButton = (props: { entryType: EntryType }) => {
  const { enterEntryTypeEdit } = useJotaiActions();

  return (
    <Button
      size="small"
      className="rounded-lg hover:bg-transparent"
      onClick={() => enterEntryTypeEdit({ entryTypeId: props.entryType.id })}
    >
      <AiFillEdit className="h-full w-6" />
    </Button>
  );
};

export type EntryTypeCardProps = {
  entryType: EntryType;
  isEdit: boolean;
  className?: string;
  selectedDayStr?: string;
  isDone?: boolean;
};
const EntryTypeCard = (props: EntryTypeCardProps) => {
  const selectedDayStr = useAtomValue(selectedChartDateAtom);
  const { entryType, isEdit, className, isDone } = props;
  const { title, routine, themeColors, createdAt, updatedAt, pointStep, defaultPoints } = entryType;
  return isEdit ? (
    <div className={twMerge('flex justify-between gap-2 bg-white text-white', className)}>
      <div
        className="flex flex-grow items-center gap-1.5 rounded-lg px-2"
        style={{ background: `linear-gradient(90deg, #${themeColors[0]} 0%, #${themeColors[1]} 100%)` }}
      >
        <div className="flex flex-col">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">{title}</div>
          <p className="text-xs">{formatDate(createdAt)}</p>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center whitespace-nowrap text-xs">
          <p className="flex items-center gap-1">
            points <span className="font-DDin text-base/5 font-bold">{defaultPoints}</span>
          </p>
          {pointStep ? (
            <p className="flex items-center gap-1">
              pointStep <span className="font-DDin text-base/5 font-bold">{pointStep}</span>
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex gap-2">
        <EntryTypeCardEditButton entryType={entryType} />
        <EntryTypeCardDeleteButton entryType={entryType} />
      </div>
    </div>
  ) : (
    <div
      className={twMerge('relative flex flex-wrap items-center gap-3 rounded-lg px-4 py-2 text-white', className)}
      style={{ background: `linear-gradient(90deg, #${themeColors[0]} 0%, #${themeColors[1]} 100%)` }}
    >
      <div className="flex w-10 items-center justify-center">
        <DiaryIcons.CheckSvg className="text-xl opacity-0" />
      </div>
      <div className="flex flex-grow flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xl font-medium">
          {title}
          <Tooltip placement="top" offsetX={8} title="routine">
            <div className="rounded border border-white bg-white/25 p-1 font-DDin text-xs font-bold">{routine}</div>
          </Tooltip>
          {pointStep ? (
            <Tooltip placement="top" offsetX={8} title="pointStep">
              <div className="flex items-center gap-1 rounded border border-white bg-white/25 px-1 py-0.5 font-DDin text-sm font-bold">
                <PiStepsDuotone className="text-base" />
                {pointStep}
              </div>
            </Tooltip>
          ) : null}
        </div>
        <div className="flex justify-between gap-1 text-left">
          <div className="flex flex-col">
            <p className="opacity-60">Create at</p>
            <p>{formatDate(createdAt)} </p>
          </div>
          <div className="flex flex-col">
            <p className="opacity-60">Update at</p>
            <p>{formatDate(updatedAt)} </p>
          </div>
        </div>
      </div>
      <Tooltip placement="top" offsetX={8} title="defaultPoints">
        <div className="flex flex-grow flex-col items-center gap-2 font-DDin text-3xl font-bold">{defaultPoints}</div>
      </Tooltip>
      <EntryTypeCompletionForm entryType={props.entryType} selectedDayStr={selectedDayStr || dayjs().format('YYYY-MM-DD')} />
    </div>
  );
};

export default EntryTypeCard;
