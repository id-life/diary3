'use client';

import { useIsMounted } from '@/hooks/useIsMounted';
import { themeAtom, themeNames } from '@/atoms/app';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

export default function Theme() {
  const setTheme = useSetAtom(themeAtom);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) return;
    const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
    setTheme(randomTheme);
    document.documentElement.classList.add(randomTheme);
  }, [isMounted]);

  return <></>;
}
