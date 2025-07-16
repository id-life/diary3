'use client';

import { Fragment, PropsWithChildren, useEffect, useState } from 'react';

export function ClientOnly({ children, ...delegated }: PropsWithChildren) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) return null;

  return <Fragment {...delegated}>{children}</Fragment>;
}
