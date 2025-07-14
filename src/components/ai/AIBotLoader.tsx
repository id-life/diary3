'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function AIBotLoader() {
  const AIBot = useMemo(
    () =>
      dynamic(() => import('@/components/ai/AIBot'), {
        ssr: false,
        loading: () => (
          <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-white p-4 shadow-xl">
            <p>Loading AI...</p>
          </div>
        ),
      }),
    [],
  );

  return <AIBot />;
}
