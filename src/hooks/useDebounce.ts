import { debounce } from 'lodash-es';
import { useRef, useEffect, useCallback } from 'react';

/**
 * return the debounced version of the passed function, only call after delay when no new calls are made
 * @param {any} fn - the function to debounce
 * @param [delay=300] - the amount of time to wait after the last call
 * @returns a debounced function
 */
export function useDebounce(fn: any, delay = 300) {
  const options = { leading: false, trailing: true }; // wait for trailing call
  const fnRef = useRef(fn);
  // use mutable ref to make useCallback/debounce not depend on `fn` dep
  useEffect(() => {
    fnRef.current = fn;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce((...args) => fnRef.current(...args), delay, options),
    [delay],
  );
}
