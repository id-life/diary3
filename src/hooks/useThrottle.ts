import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';

/**
 * return the throttled version of the passed function, only call once every `delay` milliseconds
 * @param {any} fn - the function to throttle
 * @param [delay=300] - the amount of time to wait between calls to the restricted function.
 * @returns a function that is limited to 300ms
 */
export function useThrottle(fn: any, delay = 300) {
  const options = { leading: true, trailing: false }; // add custom lodash options
  const fnRef = useRef(fn);
  // use mutable ref to make useCallback/throttle not depend on `fn` dep
  useEffect(() => {
    fnRef.current = fn;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle((...args) => fnRef.current(...args), delay, options),
    [delay],
  );
}
