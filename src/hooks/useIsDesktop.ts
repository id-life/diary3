'use client';

import { useMediaQuery } from 'react-responsive';
import { useIsMounted } from './useIsMounted';

export const useIsDesktop = () => {
  const isDesktop = useMediaQuery({ minWidth: 769 });
  const isMounted = useIsMounted();
  return isMounted && isDesktop;
};
