import { entryTypesArrayAtom } from '@/atoms';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import { formatDateTime } from '@/utils/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { EntryInstance } from '../../entry/types-constants';
import { CloseSVG, EditDateSVG, MinusSvg, PlusSvg, PointStepSVG } from '../svg';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils';

const EntryInstanceForm = ({ entryInstance }: { entryInstance: EntryInstance }) => {
  const { updateEntryInstance, deleteEntryInstance } = useJotaiActions();
  const { id, points, notes, entryTypeId, createdAt, updatedAt } = entryInstance;
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);

  const [localNotes, setLocalNotes] = useState(notes);

  const entryType = useMemo(() => {
    return entryTypesArray.find((et) => et.id === entryTypeId);
  }, [entryTypesArray, entryTypeId]);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const updateGlobalNotes = useCallback(
    (newNotes: string) => {
      const newEntryInstance = { ...entryInstance, notes: newNotes, updatedAt: dayjs().valueOf() };
      updateEntryInstance(newEntryInstance);
    },
    [updateEntryInstance, entryInstance],
  );

  const debouncedUpdateNotes = useDebounce(updateGlobalNotes, 500);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newNotes = e.target.value;
      setLocalNotes(newNotes);
      debouncedUpdateNotes(newNotes);
    },
    [debouncedUpdateNotes],
  );

  const handlePointsChange = useCallback(
    (value: number | null) => {
      const points = Math.max(0, value || 0);
      const newEntryInstance = { ...entryInstance, points, updatedAt: dayjs().valueOf() };
      updateEntryInstance(newEntryInstance);
    },
    [updateEntryInstance, entryInstance],
  );

  if (!entryType) {
    return null;
  }

  return (
    <div className="relative overflow-hidden border border-gray-200 bg-white p-3 shadow-sm" key={id}>
      <CloseSVG
        className="absolute right-2 top-2 size-[10px] cursor-pointer stroke-black transition duration-300 hover:stroke-black/50"
        onClick={() => {
          deleteEntryInstance(entryInstance);
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{
          backgroundColor: `#${entryType.themeColor}`,
        }}
      />
      <div className="flex justify-between gap-5">
        <div className="flex min-w-0 grow flex-col">
          <h3 className="break-words text-start align-middle text-sm/3.5 font-semibold leading-[20px]">
            <span className="mr-2">{entryType.title}</span>
            <span className="inline-flex rounded bg-[#BCBBC4] px-1.5 py-1 align-baseline text-xs/3 font-medium text-white">
              {entryType.routine}
            </span>
          </h3>
          <div className="mt-[11px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-0.5 border-gray-100 text-xs text-diary-primary">
                <EditDateSVG /> {formatDateTime(updatedAt)}
              </div>
              {/* Notes input */}
              <input
                className="mt-auto flex h-6 resize-none items-center rounded-[4px] border border-diary-primary/10 px-1.5 text-xs focus:ring-1"
                placeholder="Add Note..."
                value={localNotes}
                onChange={handleNotesChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-auto flex size-[68px] flex-shrink-0 flex-col items-center justify-between rounded-[4px] bg-diary-navy/[0.04] pt-1">
          {/* Top: "Point" Label */}
          <div className="mb-1.5 text-xs font-medium leading-[16px] text-[#8a8898]">Point</div>

          {/* Middle: Point Value */}
          <div className="text-base font-semibold leading-[16px] text-[#1e1b39]">{points}</div>

          {/* Bottom: Controls */}
          <div className="mt-0.5 flex w-full items-center justify-between">
            <button
              className="flex flex-shrink-0 transition-opacity hover:opacity-70 disabled:opacity-40"
              disabled={points <= 0}
              onClick={() => handlePointsChange(points - (entryType.pointStep || 0.5))}
            >
              <MinusSvg className="size-6 cursor-pointer text-[#8a8898]" />
            </button>
            <div className="flex flex-grow items-center justify-center gap-0.5">
              <PointStepSVG
                className={cn('size-2 fill-diary-navy opacity-50', {
                  hidden: !Number.isInteger(entryType.pointStep),
                })}
              />
              <div className="text-[10px] font-semibold leading-[10px] text-[#8a8898]">{entryType.pointStep || 0.5}</div>
            </div>
            <button
              className="flex flex-shrink-0 transition-opacity hover:opacity-70"
              onClick={() => handlePointsChange(points + (entryType.pointStep || 0.5))}
            >
              <PlusSvg className="size-6 cursor-pointer text-[#8a8898]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryInstanceForm;
