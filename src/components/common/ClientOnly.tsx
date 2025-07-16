'use client';

import { PropsWithChildren, useEffect, useState } from 'react';

export function ClientOnly({ children, className, ...delegated }: PropsWithChildren<{ className?: string }>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) return null;

  return (
    <div className={className} {...delegated}>
      {children}
    </div>
  );
}
