import { useAsyncStatus } from './useAsync';
/**
 * Wraps an (async) function and provides value, status and error states.
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
 * const {status, error, execute: wrappedFetchData} = useAsyncFunction(fetchData);
 * // Or with single, but immediate execution
 * const {status, error, execute: wrappedFetchData} = useAsyncFunction(fetchData, React.useMemo(() => [123], []));
 * ...
 * wrappedFetchData(123)
 * ```
 *
 * @param asyncFunction Async function to be wrapped.
 * @param immediate Null if function should not be triggered immediately, or the initial parameter array if immediate.
 */
export declare const useAsyncFunction: <F extends (...args: any[]) => T | Promise<T>, E = Error, T = ReturnType<F>>(asyncFunction: F, immediate?: Parameters<F>) => {
    execute: (...args: Parameters<F>) => Promise<T>;
    status: useAsyncStatus;
    value: T;
    error: E;
};
