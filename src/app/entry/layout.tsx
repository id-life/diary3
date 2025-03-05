import { Sidebar } from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative flex h-screen items-start gap-5 overflow-auto pt-20 text-center">
      <Sidebar />
      <ScrollArea className="h-full w-full pt-7.5">{children}</ScrollArea>
    </div>
  );
}
