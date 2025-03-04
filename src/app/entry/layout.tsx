import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="container mt-20 flex h-full flex-col gap-4 overflow-auto px-4 py-6 text-center">{children}</div>;
}
