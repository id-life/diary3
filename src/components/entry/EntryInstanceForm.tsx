import { entryTypesArrayAtom } from '@/atoms';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import { formatDateTime } from '@/utils/date';
import { InputNumber } from 'antd';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { EntryInstance } from '../../entry/types-constants';
import Button from '../button';
import { CloseSVG, EditDateSVG } from '../svg';

const EntryInstanceForm = ({ entryInstance }: { entryInstance: EntryInstance }) => {
  const { updateEntryInstance, deleteEntryInstance } = useJotaiActions();
  const { id, points, notes, entryTypeId, createdAt, updatedAt } = entryInstance;
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);

  // Find the corresponding entry type
  const entryType = useMemo(() => {
    return entryTypesArray.find((et) => et.id === entryTypeId);
  }, [entryTypesArray, entryTypeId]);

  const { register, handleSubmit, control } = useForm();
  const onSubmit = useCallback(
    (data: any) => {
      const points = data?.points ? parseFloat(data.points) : entryInstance.points;
      const notes = data?.notes ?? entryInstance.notes;
      const newEntryInstance = { ...entryInstance, points, notes, updatedAt: dayjs().valueOf() };
      updateEntryInstance(newEntryInstance);
    },
    [updateEntryInstance, entryInstance],
  );
  const onError = useCallback((errors: any) => {
    console.error('=======onError', errors);
  }, []);

  if (!entryType) {
    return null; // Don't render if entry type not found
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="relative overflow-hidden border border-gray-200 bg-white px-3 pb-3 pt-2 shadow-sm"
      key={id}
    >
      <CloseSVG
        className="absolute right-2 top-2 cursor-pointer stroke-black transition duration-300 hover:stroke-black/50"
        onClick={() => {
          deleteEntryInstance(entryInstance);
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent to-black"
        style={{
          background: `linear-gradient(90deg, #${entryType.themeColors[0]} 0%, #${entryType.themeColors[1]} 100%)`,
        }}
      />
      <div className="flex items-center gap-2">
        <h3 className="text-sm/3.5 font-semibold">{entryType.title}</h3>
        <div className="rounded bg-[#BCBBC4] px-1.5 py-1 text-xs/3 font-medium text-white">{entryType.routine}</div>
      </div>
      <div className="mt-2 flex justify-between gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-0.5 border-gray-100 text-xs/3 text-diary-navy">
            <EditDateSVG /> {formatDateTime(updatedAt)}
          </div>
          {/* Notes input */}
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 text-sm focus:ring-1"
            placeholder="添加备注..."
            defaultValue={notes}
            {...register('notes')}
            rows={1}
          />
        </div>
        <div className="flex flex-col items-center rounded bg-diary-navy/[0.04] p-1">
          <div className="text-xs opacity-75">Point</div>
          <Controller
            name="points"
            control={control}
            rules={{ required: 'points is required' }}
            defaultValue={points}
            render={({ field }) => (
              <InputNumber
                className="flex-1 rounded-lg border-gray-300"
                type="number"
                step={entryType.pointStep || 0.5}
                {...field}
              />
            )}
          />
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button type="primary" htmlType="submit" className="flex-1 rounded-lg font-medium">
          Update
        </Button>
      </div>
    </form>
  );
};

export default EntryInstanceForm;
