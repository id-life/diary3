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
import { BiSolidUpArrow } from 'react-icons/bi';
import Segmented from '../segmented';
import { FillEyeInvisibleSvg, FillEyeSvg, SearchSVG } from '../svg';

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

const EntryTypeCardHideButton = ({
  entryType,
  onHide,
  onUnHide,
}: {
  entryType: EntryType;
  onHide?: (entryTypeId: string) => void;
  onUnHide?: (entryTypeId: string) => void;
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (onUnHide) {
          onUnHide?.(entryType?.id);
        } else {
          onHide?.(entryType?.id);
        }
      }}
      title={onUnHide ? 'Unhide entry' : 'Hide entry'}
    >
      {onUnHide ? <FillEyeInvisibleSvg className="h-[14px] text-current" /> : <FillEyeSvg className="h-[14px] text-white" />}
    </button>
  );
};

const EntrySimpleCard = ({
  entryType,
  onHide,
  onUnHide,
  className,
  isDone,
  isHidden,
}: {
  entryType: EntryType;
  onHide?: (entryTypeId: string) => void;
  onUnHide?: (entryTypeId: string) => void;
  className?: string;
  isDone?: boolean;
  isHidden?: boolean;
}) => {
  const { title, themeColor } = entryType;
  const { createEntryInstanceWithDefaults } = useCreateNewEntryInstance(entryType);
  const selectedDay = useAtomValue(selectedChartDateAtom);
  return (
    <div
      className={cn(
        'relative flex cursor-pointer items-center gap-1.5 rounded-[4px] px-1.5 py-[3px] text-xs/3 font-medium text-white transition duration-300 hover:scale-105',
        className,
      )}
      style={
        isDone || isHidden ? { background: `#${themeColor}33`, color: `#${themeColor}` } : { backgroundColor: `#${themeColor}` }
      }
      onClick={() => createEntryInstanceWithDefaults(selectedDay)}
    >
      {title}
      <EntryTypeCardHideButton entryType={entryType} onHide={onHide} onUnHide={onUnHide} />
    </div>
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      <div className="h-15 shrink-0 cursor-pointer overflow-hidden" onClick={toggleExpanded}>
        <div className="flex-center">
          <BiSolidUpArrow
            className={cn('h-[10px] w-[14px] text-[#838190] transition duration-300', { 'rotate-180': isExpanded })}
          />
        </div>
        {/* Filter Section */}
        <div className="mt-2 flex items-center gap-2">
          <div
            className={cn('transition-all duration-300', {
              'w-0 opacity-0': isSearchFocused,
            })}
          >
            <Segmented
              optionClass="px-1.5"
              onClick={(e) => e.stopPropagation()}
              defaultValue={segmentedValue}
              onChange={(value) => setSegmentedValue(value as 'all' | RoutineEnum)}
              options={options}
              className="whitespace-nowrap"
            />
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('search-input')?.focus();
            }}
            className={cn(
              'flex h-10 min-w-0 flex-1 items-center gap-[5px] rounded-[8px] border border-primary/10 px-1 py-2 pl-1.5 transition-all duration-300',
            )}
          >
            <div className="relative flex h-full min-w-0 flex-1 items-center">
              <input
                id="search-input"
                className="absolute inset-0 z-10 h-full w-full border-none bg-transparent text-xs font-medium opacity-0 focus:outline-none"
                value={inputValue}
                onChange={onInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {!isSearchFocused && !inputValue && (
                <span className="w-full truncate text-left text-xs font-medium text-[#8A8998]">Search</span>
              )}
              {(isSearchFocused || inputValue) && (
                <span className="w-full truncate text-left text-xs font-medium text-current">{inputValue || ''}</span>
              )}
            </div>
            <SearchSVG className="size-6 shrink-0 fill-diary-primary/30" />
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
        <div className="mt-3 flex grow flex-col gap-2 overflow-auto pb-4">
          {restList?.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2.5 gap-y-3">
                {restList.map((item) => (
                  <EntrySimpleCard key={item.id} entryType={item} onHide={handleHideEntryType} />
                ))}
              </div>
            </div>
          )}

          {/* Hidden Tasks */}
          {hiddenList?.length > 0 && (
            <div className="mb-3">
              <h3 className="mb-3 text-xs font-medium">Hidden</h3>
              <div className="flex flex-wrap gap-2.5 gap-y-3">
                {hiddenList.map((item: EntryType) => (
                  <EntrySimpleCard key={item.id} entryType={item} onUnHide={handleUnhideEntryType} isHidden={true} />
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
