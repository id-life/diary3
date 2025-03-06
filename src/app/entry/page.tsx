'use client';

import EntryChart from '@/components/entry/EntryChart';
import EntryInstanceList from '@/components/entry/EntryInstanceList';
import EntryProgressBar from '@/components/entry/EntryProgressBar';
import EntryTypeListForCompletion from '@/components/entry/EntryTypeListForCompletion';
import HeaderDatetime from '@/components/entry/HeaderDatetime';
import { selectEntryInstancesMap, useAppSelector } from '@/entry/store';
import { selectedChartDateAtom } from '@/atoms/app';
import { formatDate } from '@/utils/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { CalendarIcon, ChevronDown, Clock, MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export default function EntryPage() {
  const entryInstancesMap = useAppSelector(selectEntryInstancesMap);
  const selectedChartDate = useAtomValue(selectedChartDateAtom);
  const selectedDay = useMemo(() => selectedChartDate || dayjs().format('YYYY-MM-DD'), [selectedChartDate]);
  const selectedTotalPoints = useMemo(
    () =>
      entryInstancesMap[selectedDay]?.length
        ? entryInstancesMap[selectedDay].reduce(
            (pre, cur) => pre + (typeof cur?.points === 'number' ? cur.points : parseFloat(cur.points)),
            0,
          )
        : 0,
    [entryInstancesMap, selectedDay],
  );
  const entryInstancesArray = useMemo(() => entryInstancesMap[selectedDay], [entryInstancesMap, selectedDay]);

  // console.log({ selectedDay, selectedChartDate, selectedTotalPoints });
  return (
    <div className="flex grow flex-col gap-4 pr-2">
      <div className="mb-3 rounded-lg bg-[#f7f7f7] px-5 py-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">3:52:59pm Sun 2023 Aug 13</div>
            <div className="mt-2 text-sm font-medium text-gray-600">Current Points</div>
            <div className="mt-1 text-4xl font-bold">18.5</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md bg-white p-3 shadow-sm">
              <div className="text-xs text-gray-500">Daily</div>
              <div className="text-xl font-bold">15</div>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm">
              <div className="text-xs text-gray-500">Weekly</div>
              <div className="text-xl font-bold">2.6</div>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm">
              <div className="text-xs text-gray-500">Monthly</div>
              <div className="text-xl font-bold">0.7</div>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm">
              <div className="text-xs text-gray-500">Impromptu</div>
              <div className="text-xl font-bold">0.2</div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={77} className="h-2" />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>8</span>
            <span>16</span>
            <span>24</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Tabs defaultValue="diary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="diary" className="relative">
              Diary
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#6865ff]"></div>
            </TabsTrigger>
            <TabsTrigger value="statistic">Statistic</TabsTrigger>
          </TabsList>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="text-sm">2023/08/13</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add instance
              </Button>
              <div className="text-sm text-gray-400">Middle : Entry List</div>
            </div>
          </div>

          <TabsContent value="diary" className="mt-0">
            <div className="mb-6 flex gap-2">
              <Button variant="default" size="sm" className="rounded-full bg-[#1e1b39] hover:bg-[#2d2a53]">
                All
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Todo
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Done
              </Button>
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1">
                  Current steaks
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <EntryItem title="Brushteeth" type="Daily" typeColor="bg-blue-500" score={8.0} checked={false} />

              <EntryItem title="Brushteeth" type="Daily" typeColor="bg-blue-500" score={5.0} checked={true} />

              <EntryItem title="Night Ride" type="Weekly" typeColor="bg-purple-500" score={8.0} checked={false} />

              <EntryItem title="Night Ride" type="Monthly" typeColor="bg-green-500" score={8.0} checked={false} />

              <EntryItem title="Night Ride" type="Adhoc" typeColor="bg-teal-500" score={8.0} checked={false} />
            </div>
          </TabsContent>

          <TabsContent value="statistic">
            <div className="py-12 text-center text-gray-500">Statistics content will be displayed here</div>
          </TabsContent>
        </Tabs>
      </div>
      <HeaderDatetime />
      <EntryProgressBar points={selectedTotalPoints} />
      <h2 className="mt-4 flex items-center justify-center pt-2 text-xl font-semibold">
        Selected Date {formatDate(selectedDay)}
      </h2>
      <EntryChart entryInstancesMap={entryInstancesMap} />
      <EntryInstanceList entryInstancesArray={entryInstancesArray} />
      <EntryTypeListForCompletion selectedDateStr={selectedDay} />
    </div>
  );
}

interface EntryItemProps {
  title: string;
  type: string;
  typeColor: string;
  score: number;
  checked: boolean;
}

function EntryItem({ title, type, typeColor, score, checked }: EntryItemProps) {
  return (
    <div className={`rounded-lg border p-4 ${checked ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} className="mt-1" />

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">{title}</span>
            <div className="flex items-center gap-1">
              <Badge className={`${typeColor} text-xs font-normal text-white`}>{type}</Badge>
              <Badge variant="outline" className="bg-gray-100 text-xs font-normal">
                M-23
              </Badge>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Create at Thu 03 Aug 2023</span>
            <Clock className="ml-2 h-3 w-3" />
            <span>Update at Thu 03 Aug 2023</span>
          </div>

          <Textarea placeholder="add remarks..." className="min-h-[40px] resize-none border-0 bg-gray-100 text-sm" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-2xl font-bold">{score.toFixed(1)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
