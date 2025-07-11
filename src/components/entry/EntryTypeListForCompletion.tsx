import { selectEntryInstancesMap, selectEntryTypesArray, useAppSelector } from '@/entry/store';
import { useInput } from '@/hooks/useInput';
import { sortEntryTypesArray } from '@/utils/entry';
import { getHiddenEntryTypes, unhideEntryType, hideEntryType } from '@/utils/hiddenEntryTypes';
import { useMemo, useState } from 'react';
import EntryTypeCard from './EntryTypeCard';
import Segmented from '../segmented';
import Button from '../button';
import { RoutineEnum, EntryType } from '@/entry/types-constants';
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';

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
      className="absolute top-2 right-2 p-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors opacity-60 hover:opacity-100"
      onClick={() => props.onHide(props.entryType.id)}
      title="Hide entry"
    >
      <AiOutlineEyeInvisible className="w-4 h-4 text-white" />
    </button>
  );
};

const EntryTypeListForCompletion = ({ selectedDateStr }: { selectedDateStr: string }) => {
  const entryTypesArray = useAppSelector(selectEntryTypesArray);
  const entryInstancesMap = useAppSelector(selectEntryInstancesMap);
  const { inputValue, onInputChange } = useInput();
  const [segmentedValue, setSegmentedValue] = useState<'all' | RoutineEnum>('all');
  const [hiddenEntryTypes, setHiddenEntryTypes] = useState(() => getHiddenEntryTypes());
  
  const { doneList, restList, hiddenList } = useMemo(() => {
    const todayEntryInstances = entryInstancesMap[selectedDateStr];
    let doneEntryTypes = new Set(todayEntryInstances?.length ? todayEntryInstances.map(({ entryTypeId }) => entryTypeId) : []);
    
    const visibleEntryTypes = entryTypesArray.filter(({ id }) => !hiddenEntryTypes.has(id));
    const hiddenEntryTypesList = entryTypesArray.filter(({ id }) => hiddenEntryTypes.has(id));
    
    return {
      restList: sortEntryTypesArray(
        visibleEntryTypes.filter(({ id, title, routine }) => {
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
            visibleEntryTypes.filter(({ id }) => doneEntryTypes.has(id)),
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
          <div className="mt-4 flex items-center justify-center border-t pt-2 text-xl font-semibold">Hidden Entries Archive</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1 4xl:grid-cols-4">
            {hiddenList.map((item) => (
              <div key={item.id} className="relative group">
                <EntryTypeCard entryType={item} isEdit={false} selectedDayStr={selectedDateStr} className="opacity-40 group-hover:opacity-60 transition-opacity" />
                <button
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors opacity-80 hover:opacity-100 backdrop-blur-sm"
                  onClick={() => handleUnhideEntryType(item.id)}
                  title="Unhide entry"
                >
                  <AiOutlineEye className="w-4 h-4 text-white" />
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
