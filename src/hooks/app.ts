import { GlobalState, globalStateAtom } from '@/atoms/app';
import { StorageKey } from '@/constants/storage';
import { getDateStringFromNow } from '@/entry/types-constants';
import { calcRecordedCurrentStreaks, calcRecordedLongestStreaks } from '@/utils/entry';
import { runStateMigration, isMigrationCompleted } from '@/utils/stateMigration';
import dayjs from 'dayjs';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';
import { 
  entryInstancesMapAtom, 
  initDayEntryInstancesAtom,
  initDateStrAtom
} from '@/atoms';

export const useInitGlobalState = () => {
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const setGlobalState = useSetAtom(globalStateAtom);
  const setInitDateStr = useSetAtom(initDateStrAtom);
  const setInitDayEntryInstances = useSetAtom(initDayEntryInstancesAtom);

  useEffect(() => {
    // Run state migration BEFORE atoms are used
    const runMigrationAndInit = async () => {
      const migrationSuccess = runStateMigration();
      if (migrationSuccess || isMigrationCompleted()) {
        // Force atoms to re-initialize with migrated data
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };
    
    runMigrationAndInit();
  }, []);

  useEffect(() => {
    const now = dayjs();
    const entryKeys = Object.keys(entryInstancesMap);
    const totalEntries = entryKeys?.length ? entryKeys.reduce((pre, cur) => pre + (entryInstancesMap[cur]?.length ?? 0), 0) : 0;
    const states: GlobalState = {
      registeredSince: 0, // TODO: old data should be update in database.
      entryDays: entryKeys?.length ?? 0,
      totalEntries,
      historicalLongestStreakByEntry: calcRecordedLongestStreaks(entryInstancesMap),
      currentStreakByEntry: calcRecordedCurrentStreaks(entryInstancesMap),
    };

    setGlobalState(states);

    const dateStrNow = getDateStringFromNow();
    setInitDateStr({ dateStr: dateStrNow });
    setInitDayEntryInstances({ dateStr: dateStrNow });
  }, [entryInstancesMap, setGlobalState, setInitDateStr, setInitDayEntryInstances]);
};

// new - Custom storage for token to avoid JSON double quotes
export const localToken = atomWithStorage<string | null>(
  StorageKey.AUTH_TOKEN,
  null,
  {
    getItem: (key: string) => {
      const value = localStorage.getItem(key);
      return value; // Return raw string, no JSON.parse
    },
    setItem: (key: string, value: string | null) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value); // Store raw string, no JSON.stringify
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  },
  { getOnInit: true },
);
export function useAccessToken() {
  const [localAccessToken, setLocalAccessToken] = useAtom(localToken);
  return { accessToken: localAccessToken, setAccessToken: setLocalAccessToken };
}
