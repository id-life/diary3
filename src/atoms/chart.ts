import dayjs from 'dayjs';
import { atom } from 'jotai';
import { selectedChartDateAtom } from './app';
import { entryInstancesMapAtom } from './entryInstances';
import { EntryInstance } from '@/entry/types-constants';

export const selectedTotalPointsAtom = atom<number>((get) => {
  const entryInstancesMap = get(entryInstancesMapAtom);
  const selectedDay = get(selectedChartDateAtom) || dayjs().format('YYYY-MM-DD');
  return entryInstancesMap[selectedDay]?.length
    ? entryInstancesMap[selectedDay].reduce(
        (pre: number, cur: any) => pre + (typeof cur?.points === 'number' ? cur.points : parseFloat(cur.points)),
        0,
      )
    : 0;
});

export const selectedEntryInstancesArrayAtom = atom<EntryInstance[]>((get) => {
  const entryInstancesMap = get(entryInstancesMapAtom);
  const selectedDay = get(selectedChartDateAtom) || dayjs().format('YYYY-MM-DD');
  return entryInstancesMap[selectedDay] || [];
});
