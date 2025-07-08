import { GlobalState, globalStateAtom } from '@/atoms/app';
import { StorageKey } from '@/constants/storage';
import { initDayEntryInstances } from '@/entry/entry-instances-slice';
import { selectEntryInstancesMap, selectLoginUser, useAppDispatch, useAppSelector } from '@/entry/store';
import { getDateStringFromNow } from '@/entry/types-constants';
import { initDateStr } from '@/entry/ui-slice';
import { calcRecordedCurrentStreaks, calcRecordedLongestStreaks } from '@/utils/entry';
import dayjs from 'dayjs';
import { useAtom, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

export const useInitGlobalState = () => {
  const loginUser = useAppSelector(selectLoginUser);
  const entryInstancesMap = useAppSelector(selectEntryInstancesMap);
  const setGlobalState = useSetAtom(globalStateAtom);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loginUser || loginUser.loginTime === null) {
      return;
    }

    const now = dayjs();
    const registeredSince = now.diff(dayjs(loginUser.loginTime), 'day');
    const entryKeys = Object.keys(entryInstancesMap);
    const totalEntries = entryKeys?.length ? entryKeys.reduce((pre, cur) => pre + (entryInstancesMap[cur]?.length ?? 0), 0) : 0;
    const states: GlobalState = {
      registeredSince,
      entryDays: entryKeys?.length ?? 0,
      totalEntries,
      historicalLongestStreakByEntry: calcRecordedLongestStreaks(entryInstancesMap),
      currentStreakByEntry: calcRecordedCurrentStreaks(entryInstancesMap),
    };

    setGlobalState(states);

    const dateStrNow = getDateStringFromNow();
    dispatch(initDateStr({ dateStr: dateStrNow }));
    dispatch(initDayEntryInstances({ dateStr: dateStrNow }));
  }, [entryInstancesMap, loginUser, setGlobalState, dispatch]);
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
