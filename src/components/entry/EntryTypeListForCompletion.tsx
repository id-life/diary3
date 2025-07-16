import { entryInstancesMapAtom, entryTypesArrayAtom } from '@/atoms';
import { EntryType, RoutineEnum } from '@/entry/types-constants';
import { useInput } from '@/hooks/useInput';
import { sortEntryTypesArray } from '@/utils/entry';
import { getHiddenEntryTypes, hideEntryType, unhideEntryType } from '@/utils/hiddenEntryTypes';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Segmented from '../segmented';
import EntryTypeCard from './EntryTypeCard';

const options = [
  {
    label: 'All',
    value: 'all',
  },
  { value: RoutineEnum.daily },
  { value: RoutineEnum.weekly },
  { value: RoutineEnum.monthly },
  { value: RoutineEnum.adhoc },
];

const EntryTypeCardHideButton = (props: { entryType: EntryType; onHide: (entryTypeId: string) => void }) => {
  return (
    <button
      className="absolute right-2 top-2 rounded-full bg-black/10 p-1 opacity-60 transition-colors hover:bg-black/20 hover:opacity-100"
      onClick={() => props.onHide(props.entryType.id)}
      title="Hide entry"
    >
      <AiOutlineEyeInvisible className="h-4 w-4 text-white" />
    </button>
  );
};

const EntryTypeListForCompletion = ({ selectedDateStr }: { selectedDateStr: string }) => {
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const { inputValue, onInputChange } = useInput();
  const [segmentedValue, setSegmentedValue] = useState<'all' | RoutineEnum>('all');
  const [hiddenEntryTypes, setHiddenEntryTypes] = useState(() => getHiddenEntryTypes());

  const { doneList, restList, hiddenList } = useMemo(() => {
    const todayEntryInstances = entryInstancesMap[selectedDateStr];
    let doneEntryTypes = new Set(
      todayEntryInstances?.length ? todayEntryInstances.map(({ entryTypeId }: { entryTypeId: string }) => entryTypeId) : [],
    );

    // Separate visible and hidden entry types
    const visibleEntryTypes = entryTypesArray.filter(({ id }: EntryType) => !hiddenEntryTypes.has(id));
    const hiddenEntryTypesList = entryTypesArray.filter(({ id }: EntryType) => hiddenEntryTypes.has(id));

    return {
      restList: sortEntryTypesArray(
        visibleEntryTypes.filter(({ id, title, routine }: any) => {
          const isNotDone = doneEntryTypes?.size ? !doneEntryTypes.has(id) : true;
          const isInRoutine = segmentedValue === 'all' ? true : routine === segmentedValue;
          if (!isNotDone || !isInRoutine) return false;
          if (inputValue) {
            const idStr = id.toLowerCase();
            const titleStr = title.toLowerCase();
            const filterStr = inputValue.toLowerCase();
            return idStr.includes(filterStr) || titleStr.includes(filterStr);
          }
          return true;
        }),
        entryInstancesMap,
      ),
      doneList: doneEntryTypes?.size
        ? sortEntryTypesArray(
            visibleEntryTypes.filter(({ id }: any) => doneEntryTypes.has(id)),
            entryInstancesMap,
          )
        : [],
      hiddenList: hiddenEntryTypesList,
    };
  }, [entryInstancesMap, entryTypesArray, inputValue, segmentedValue, selectedDateStr, hiddenEntryTypes]);

  const handleUnhideEntryType = (entryTypeId: string) => {
    unhideEntryType(entryTypeId);
    setHiddenEntryTypes(getHiddenEntryTypes());
  };

  const handleHideEntryType = (entryTypeId: string) => {
    hideEntryType(entryTypeId);
    setHiddenEntryTypes(getHiddenEntryTypes());
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 bg-gradient p-2 text-white">
        <div className="flex items-center justify-center gap-2">
          filterStr:
          <input className="border bg-transparent p-2" value={inputValue} onChange={onInputChange} />
        </div>
        <Segmented
          defaultValue={segmentedValue}
          onChange={(value) => setSegmentedValue(value as 'all' | RoutineEnum)}
          options={options}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 4xl:grid-cols-4">
        {restList?.length
          ? restList.map((item) => (
              <div key={item.id} className="relative">
                <EntryTypeCard entryType={item} isEdit={false} selectedDayStr={selectedDateStr} />
                <EntryTypeCardHideButton entryType={item} onHide={handleHideEntryType} />
              </div>
            ))
          : null}
      </div>
      <div className="mt-4 flex items-center justify-center border-t pt-2 text-xl font-semibold">Today Done List</div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1 4xl:grid-cols-4">
        {doneList?.length
          ? doneList.map((item) => (
              <div key={item.id} className="relative">
                <EntryTypeCard isDone entryType={item} isEdit={false} selectedDayStr={selectedDateStr} />
                <EntryTypeCardHideButton entryType={item} onHide={handleHideEntryType} />
              </div>
            ))
          : null}
      </div>
      {hiddenList?.length ? (
        <>
          <div className="mt-4 flex items-center justify-center border-t pt-2 text-xl font-semibold">
            Hidden Entries Archive
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1 4xl:grid-cols-4">
            {hiddenList.map((item: EntryType) => (
              <div key={item.id} className="group relative">
                <EntryTypeCard
                  entryType={item}
                  isEdit={false}
                  selectedDayStr={selectedDateStr}
                  className="opacity-40 transition-opacity group-hover:opacity-60"
                />
                <button
                  className="absolute right-2 top-2 rounded-full bg-white/20 p-1 opacity-80 backdrop-blur-sm transition-colors hover:bg-white/30 hover:opacity-100"
                  onClick={() => handleUnhideEntryType(item.id)}
                  title="Unhide entry"
                >
                  <AiOutlineEye className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default EntryTypeListForCompletion;
