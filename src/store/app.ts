import { atom } from 'jotai';

export const selectedChartDateAtom = atom<string | null>(null);

export const loadDialogOpenAtom = atom(false);

export const cloudBackupDialogOpenAtom = atom(false);

export type GlobalState = {
  registeredSince: number;
  entryDays: number;
  totalEntries: number;
  historicalLongestStreakByEntry: number;
  currentStreakByEntry: number;
};
export const globalStateAtom = atom<GlobalState | null>(null);

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
