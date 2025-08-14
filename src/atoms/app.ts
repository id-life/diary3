import { atom } from 'jotai';
import dayjs from 'dayjs';
import { legacyLoginUserAtom } from './databaseFirst';
import { entryInstancesMapAtom } from './entryInstances';
import { calcRecordedCurrentStreaks, calcRecordedLongestStreaks } from '@/utils/entry';

export const selectedChartDateAtom = atom<string | null>(null);

export const backupDialogOpenAtom = atom(false);

export type GlobalState = {
  registeredSince: number;
  entryDays: number;
  totalEntries: number;
  historicalLongestStreakByEntry: number;
  currentStreakByEntry: number;
};

export const globalStateAtom = atom<GlobalState | null>((get) => {
  const entryInstancesMap = get(entryInstancesMapAtom);
  const legacyLoginUser = get(legacyLoginUserAtom);

  if (!legacyLoginUser || !entryInstancesMap) {
    return null;
  }

  const now = dayjs();
  const loginTime = legacyLoginUser.loginTime;

  const entryKeys = Object.keys(entryInstancesMap);
  const totalEntries = entryKeys.reduce((pre, cur) => pre + (entryInstancesMap[cur]?.length ?? 0), 0);

  const currentStreak = calcRecordedCurrentStreaks(entryInstancesMap);
  const longestStreak = calcRecordedLongestStreaks(entryInstancesMap);

  return {
    registeredSince: loginTime ? now.diff(dayjs(loginTime), 'day') : 0,
    entryDays: entryKeys.length,
    totalEntries,
    historicalLongestStreakByEntry: longestStreak,
    currentStreakByEntry: currentStreak,
  };
});

export const chartDateRangeAtom = atom<string[]>([]);

export const themeNames = [
  'diary-theme-1',
  'diary-theme-1',
  'diary-theme-2',
  'diary-theme-2',
  'diary-theme-2',
  'diary-theme-3',
  'diary-theme-3',
  'diary-theme-4',
];

export const themeAtom = atom(themeNames[0]);

export const addDialogOpenAtom = atom(false);
