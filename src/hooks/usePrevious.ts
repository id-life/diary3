import { useRef } from 'react';
import { useLayoutEffect } from 'react';

// Custom hook to track previous value
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
