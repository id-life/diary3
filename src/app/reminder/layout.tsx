import { Sidebar } from '@/components/layout/sidebar';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative mt-20 flex h-screen items-start gap-5 overflow-auto text-center">
      <Sidebar />
      <div className="flex flex-col items-center gap-8 pt-4">{children}</div>
    </div>
  );
}
