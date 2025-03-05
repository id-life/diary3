'use client';

import { useInitGlobalState } from '@/hooks/app';
import React from 'react';

export default function GlobalClientComp({ children }: { children?: React.ReactNode }) {
  useInitGlobalState();

  return <>{children}</>;
}
