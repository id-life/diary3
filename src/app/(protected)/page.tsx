'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import EntryPageContent from '@/components/entry/EntryPageContent';

export default function HomePage() {
  return (
    <ClientOnly>
      <EntryPageContent />
    </ClientOnly>
  );
}
