import * as React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
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
export const useAsync = (asyncFunction, immediate = null) => {
    const [status, setStatus] = React.useState('idle');
    const [value, setValue] = React.useState(null);
    const [error, setError] = React.useState(null);
    const latestPromiseRef = React.useRef();
    const mountedRef = React.useRef(false);
    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);
    // The execute function wraps asyncFunction and
    // handles setting state for pending, value, and error.
    // useCallback ensures the below useEffect is not called
    // on every render, but only if asyncFunction changes.
    const execute = React.useCallback((...args) => {
        setStatus('pending');
        // Do not unset the value, as we mostly want to retain the last value to avoid flickering, i.e. for "silent" updates.
        // setValue(null);
        setError(null);
        const currentPromise = Promise.resolve(asyncFunction(...args))
            .then((response) => {
            if (mountedRef.current && currentPromise === latestPromiseRef.current) {
                setValue(response);
                setStatus('success');
            }
            return response;
        })
            .catch((e) => {
            if (mountedRef.current && currentPromise === latestPromiseRef.current) {
                setValue(null);
                setError(e);
                setStatus('error');
            }
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw e;
        });
        latestPromiseRef.current = currentPromise;
        return currentPromise;
    }, [asyncFunction]);
    // Call execute if we want to fire it right away.
    // Otherwise execute can be called later, such as
    // in an onClick handler.
    useDeepCompareEffect(() => {
        if (immediate) {
            try {
                execute(...immediate);
            }
            catch (e) {
                // ignore any immediate error
            }
        }
    }, [execute, immediate]);
    return { execute, status, value, error };
};
//# sourceMappingURL=useAsync.js.map