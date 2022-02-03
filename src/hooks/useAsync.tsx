import * as React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

// https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise
type Awaited<T> = T extends PromiseLike<infer U> ? { 0: Awaited<U>; 1: U }[U extends PromiseLike<any> ? 0 : 1] : T;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Wraps an (async) function and provides value, status and error states.
 *
 * Compares the `immediate` array using [use-deep-compare-effect](https://github.com/kentcdodds/use-deep-compare-effect) such that it does not have to be memoized.
 *
 * **Usage:**
 * ```typescript
 * // Somewhere outside
 * async function fetchData(id: number): Promise<string> {
 *   return fetch(...);
 * }
 *
 * // In the component
 * ...
 * const {status, error, execute: wrappedFetchData} = useAsync(fetchData);
 * // Or with single, but immediate execution
 * const {status, error, execute: wrappedFetchData} = useAsync(fetchData, [123]);
 * ...
 * wrappedFetchData(123)
 * ```
 *
 * @param asyncFunction Async function to be wrapped.
 * @param immediate Null if function should not be triggered immediately, or the initial parameter array if immediate.
 */
export const useAsync = <F extends (...args: any[]) => any, E = Error, T = Awaited<ReturnType<F>>>(
  asyncFunction: F,
  immediate: Parameters<F> | null = null,
) => {
  const [status, setStatus] = React.useState<useAsyncStatus>('idle');
  const [value, setValue] = React.useState<T | null>(null);
  const [error, setError] = React.useState<E | null>(null);
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = React.useCallback(
    (...args: Parameters<typeof asyncFunction>) => {
      setStatus('pending');
      setValue(null);
      setError(null);
      return Promise.resolve(asyncFunction(...args))
        .then((response: T) => {
          setValue(response);
          setStatus('success');
          return response;
        })
        .catch((e: E) => {
          setError(e);
          setStatus('error');
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw e;
        });
    },
    [asyncFunction],
  );
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useDeepCompareEffect(() => {
    if (immediate) {
      execute(...immediate);
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
