'use client';
import EntryChart from '@/components/entry/EntryChart';
import EntryInstanceList from '@/components/entry/EntryInstanceList';
import EntryTypeListForCompletion from '@/components/entry/EntryTypeListForCompletion';
import EntryHeader from './EntryHeader';

export default function EntryPageContent() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-auto px-4 pb-10 text-center">
      <EntryHeader />
      <EntryChart />
      <EntryInstanceList />
      <EntryTypeListForCompletion />
    </div>
  );
}
