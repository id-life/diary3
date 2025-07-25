import { entryInstancesMapAtom, initDateStrAtom, initDayEntryInstancesAtom } from '@/atoms';
import { GlobalState, globalStateAtom } from '@/atoms/app';
import { legacyLoginUserAtom } from '@/atoms/databaseFirst';
import { StorageKey } from '@/constants/storage';
import { getDateStringFromNow } from '@/entry/types-constants';
import { calcRecordedCurrentStreaks, calcRecordedLongestStreaks } from '@/utils/entry';
import { isMigrationCompleted, runStateMigration } from '@/utils/stateMigration';
import dayjs from 'dayjs';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

export const useInitGlobalState = () => {
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const setGlobalState = useSetAtom(globalStateAtom);
  const setInitDateStr = useSetAtom(initDateStrAtom);
  const setInitDayEntryInstances = useSetAtom(initDayEntryInstancesAtom);
  const legacyLoginUser = useAtomValue(legacyLoginUserAtom);

  useEffect(() => {
    // Run state migration BEFORE atoms are used
    const runMigrationAndInit = async () => {
      const migrationSuccess = runStateMigration();
      if (migrationSuccess || isMigrationCompleted()) {
        // Force atoms to re-initialize with migrated data
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    runMigrationAndInit();
  }, []);

  useEffect(() => {
    const now = dayjs();
    const entryKeys = Object.keys(entryInstancesMap);
    const totalEntries = entryKeys?.length ? entryKeys.reduce((pre, cur) => pre + (entryInstancesMap[cur]?.length ?? 0), 0) : 0;

    const registeredSince = now.diff(dayjs(legacyLoginUser?.loginTime ?? now), 'day');

    const states: GlobalState = {
      registeredSince,
      entryDays: entryKeys?.length ?? 0,
      totalEntries,
      historicalLongestStreakByEntry: calcRecordedLongestStreaks(entryInstancesMap),
      currentStreakByEntry: calcRecordedCurrentStreaks(entryInstancesMap),
    };

    setGlobalState(states);

    const dateStrNow = getDateStringFromNow();
    setInitDateStr({ dateStr: dateStrNow });
    setInitDayEntryInstances({ dateStr: dateStrNow });
  }, [entryInstancesMap, legacyLoginUser, setGlobalState, setInitDateStr, setInitDayEntryInstances]);
};

// new - Custom storage for token to avoid JSON double quotes
export const localToken = atomWithStorage<string | null>(
  StorageKey.AUTH_TOKEN,
  null,
  {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null;
      try {
        const value = localStorage.getItem(key);
        return value; // Return raw string, no JSON.parse
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string | null) => {
      if (typeof window === 'undefined') return;
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value); // Store raw string, no JSON.stringify
        }
      } catch (error) {
        console.warn('Failed to set localStorage item:', error);
      }
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove localStorage item:', error);
      }
    },
  },
  { getOnInit: true },
);
export function useAccessToken() {
  const [localAccessToken, setLocalAccessToken] = useAtom(localToken);
  return { accessToken: localAccessToken, setAccessToken: setLocalAccessToken };
}
