'use client';
import { entryInstancesMapAtom } from '@/atoms';
import EntryChart from '@/components/entry/EntryChart';
import EntryInstanceList from '@/components/entry/EntryInstanceList';
import EntryTypeListForCompletion from '@/components/entry/EntryTypeListForCompletion';
import { usePrevious } from '@/hooks/usePrevious';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useCallback, useLayoutEffect, useRef } from 'react';
import EntryHeader from './EntryHeader';
import EntryProgressBar from './EntryProgressBar';

export default function EntryPageContent() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const todayStr = dayjs().format('YYYY-MM-DD');

  // Get today's entry instances count for monitoring changes
  const todayInstancesCount = entryInstancesMap[todayStr]?.length || 0;
  const prevCount = usePrevious(todayInstancesCount);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // Scroll to bottom when new entries are added
  useLayoutEffect(() => {
    // Only scroll if count increased (new entry added)
    if (prevCount !== undefined && todayInstancesCount > prevCount) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [todayInstancesCount, prevCount, scrollToBottom]);

  return (
    <div ref={scrollContainerRef} className="flex h-full flex-col gap-3 overflow-auto px-4 pb-40 text-center">
      <EntryHeader>
        <EntryProgressBar className="grow" />
      </EntryHeader>
      <EntryChart />
      <EntryInstanceList className="-mt-18" />
      <EntryTypeListForCompletion />
    </div>
  );
}
