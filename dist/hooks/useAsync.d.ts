declare type Awaited<T> = T extends PromiseLike<infer U> ? {
    0: Awaited<U>;
    1: U;
}[U extends PromiseLike<any> ? 0 : 1] : T;
export declare type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';
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
export declare const useAsync: <F extends (...args: any[]) => any, E = Error, T = Awaited<ReturnType<F>>>(asyncFunction: F, immediate?: Parameters<F>) => {
    execute: (...args: Parameters<F>) => Promise<T>;
    status: useAsyncStatus;
    value: T;
    error: E;
};
export {};
//# sourceMappingURL=useAsync.d.ts.map