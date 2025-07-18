import { entryInstancesMapAtom, entryTypesArrayAtom, selectedChartDateAtom } from '@/atoms';
import { selectedEntryInstancesArrayAtom } from '@/atoms/chart';
import { EntryType, RoutineEnum } from '@/entry/types-constants';
import { useInput } from '@/hooks/useInput';
import { useCreateNewEntryInstance } from '@/hooks/entryType';
import { cn } from '@/utils';
import { sortEntryTypesArray } from '@/utils/entry';
import { getHiddenEntryTypes, hideEntryType, unhideEntryType } from '@/utils/hiddenEntryTypes';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BiSolidUpArrow } from 'react-icons/bi';
import Segmented from '../segmented';
import { SearchSVG } from '../svg';

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
const EntrySimpleCard = ({
  entryType,
  onHide,
  className,
  isDone,
}: {
  entryType: EntryType;
  onHide: (entryTypeId: string) => void;
  className?: string;
  isDone?: boolean;
}) => {
  const { title, themeColors } = entryType;
  const { createEntryInstanceWithDefaults } = useCreateNewEntryInstance(entryType);
  const selectedDay = useAtomValue(selectedChartDateAtom);
  return (
    <div
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs/3 font-medium text-white transition duration-300 hover:scale-105',
        className,
      )}
      style={
        isDone
          ? { background: `#${themeColors[0]}33`, color: `#${themeColors[0]}` }
          : { background: `linear-gradient(90deg, #${themeColors[0]} 0%, #${themeColors[1]} 100%)` }
      }
      onClick={() => createEntryInstanceWithDefaults(selectedDay)}
    >
      {title}
      <EntryTypeCardHideButton entryType={entryType} onHide={onHide} />
    </div>
  );
};
const EntryTypeCardHideButton = ({ entryType, onHide }: { entryType: EntryType; onHide: (entryTypeId: string) => void }) => {
  return (
    <button
      className="rounded-full opacity-60 transition-colors hover:opacity-100"
      onClick={(e) => {
        e.stopPropagation();
        onHide(entryType?.id);
      }}
      title="Hide entry"
    >
      <AiOutlineEye className="h-3 text-white" />
    </button>
  );
};

const EntryTypeListForCompletion = () => {
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const selectedEntryInstancesArray = useAtomValue(selectedEntryInstancesArrayAtom);
  const { inputValue, onInputChange } = useInput();
  const [segmentedValue, setSegmentedValue] = useState<'all' | RoutineEnum>('all');
  const [hiddenEntryTypes, setHiddenEntryTypes] = useState(() => getHiddenEntryTypes());
  const [isExpanded, setIsExpanded] = useState(false);

  const { doneList, restList, hiddenList } = useMemo(() => {
    let doneEntryTypes = new Set(
      selectedEntryInstancesArray?.length
        ? selectedEntryInstancesArray.map(({ entryTypeId }: { entryTypeId: string }) => entryTypeId)
        : [],
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
  }, [selectedEntryInstancesArray, entryTypesArray, entryInstancesMap, hiddenEntryTypes, segmentedValue, inputValue]);

  const handleUnhideEntryType = (entryTypeId: string) => {
    unhideEntryType(entryTypeId);
    setHiddenEntryTypes(getHiddenEntryTypes());
  };

  const handleHideEntryType = (entryTypeId: string) => {
    hideEntryType(entryTypeId);
    setHiddenEntryTypes(getHiddenEntryTypes());
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed bottom-[3.25rem] left-0 right-0 z-50 flex flex-col overflow-auto border-t bg-white px-3 py-2 drop-shadow-[0px_-4px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ${
        isExpanded ? 'h-[80vh]' : 'h-35'
      }`}
    >
      <div className="h-[3.25rem] shrink-0 cursor-pointer overflow-hidden" onClick={toggleExpanded}>
        <div className="flex-center">
          <BiSolidUpArrow className={cn('size-3 text-[#838190] transition duration-300', { 'rotate-180': isExpanded })} />
        </div>
        {/* Filter Section */}
        <div className="flex items-center justify-between gap-2">
          <Segmented
            onClick={(e) => e.stopPropagation()}
            defaultValue={segmentedValue}
            onChange={(value) => setSegmentedValue(value as 'all' | RoutineEnum)}
            options={options}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 items-center gap-1 rounded border border-gray-300 bg-white px-1.5 py-2"
          >
            <input
              className="border-none bg-transparent text-xs/3 font-medium placeholder:text-[#8A8998]"
              placeholder="Search..."
              value={inputValue}
              onChange={onInputChange}
            />
            <SearchSVG className="size-6 fill-diary-navy opacity-30" />
          </div>
        </div>
      </div>
      {!isExpanded && restList?.length > 0 && (
        <div className="flex flex-wrap gap-2.5 gap-y-3 overflow-auto pt-3">
          {restList.map((item) => (
            <EntrySimpleCard key={item.id} entryType={item} onHide={handleHideEntryType} />
          ))}
          {/* Completed Tasks */}
          {doneList?.length > 0 &&
            doneList.map((item) => <EntrySimpleCard key={item.id} entryType={item} onHide={handleHideEntryType} isDone />)}
        </div>
      )}
      {/* Expandable Content */}
      {isExpanded && (
        <div className="flex grow flex-col gap-2 overflow-auto pb-4">
          {restList?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">TODO List</h3>
              <div className="flex flex-wrap gap-2.5 gap-y-3">
                {restList.map((item) => (
                  <EntrySimpleCard key={item.id} entryType={item} onHide={handleHideEntryType} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {doneList?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-green-600">Completed</h3>
              <div className="flex flex-wrap gap-2.5 gap-y-3">
                {doneList.map((item) => (
                  <EntrySimpleCard key={item.id} entryType={item} onHide={handleHideEntryType} isDone />
                ))}
              </div>
            </div>
          )}

          {/* Hidden Tasks */}
          {hiddenList?.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-500">Hidden</h3>
              <div className="flex flex-wrap gap-2.5 gap-y-3">
                {hiddenList.map((item: EntryType) => (
                  <EntrySimpleCard
                    className="opacity-50 hover:opacity-80"
                    key={item.id}
                    entryType={item}
                    onHide={handleHideEntryType}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {restList.length === 0 && doneList.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>Empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryTypeListForCompletion;
