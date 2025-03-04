import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-20 flex h-full flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center">
      {children}
    </div>
  );
}
