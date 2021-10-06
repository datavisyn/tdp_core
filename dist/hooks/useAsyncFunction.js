import * as React from 'react';
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
export const useAsyncFunction = (asyncFunction, immediate = null) => {
    const [status, setStatus] = React.useState('idle');
    const [value, setValue] = React.useState(null);
    const [error, setError] = React.useState(null);
    // The execute function wraps asyncFunction and
    // handles setting state for pending, value, and error.
    // useCallback ensures the below useEffect is not called
    // on every render, but only if asyncFunction changes.
    const execute = React.useCallback((...args) => {
        setStatus('pending');
        setValue(null);
        setError(null);
        return Promise.resolve(asyncFunction(...args))
            .then((response) => {
            setValue(response);
            setStatus('success');
            return response;
        })
            .catch((error) => {
            setError(error);
            setStatus('error');
            throw error;
        });
    }, [asyncFunction]);
    // Call execute if we want to fire it right away.
    // Otherwise execute can be called later, such as
    // in an onClick handler.
    React.useEffect(() => {
        if (immediate) {
            execute(...immediate);
        }
    }, [execute, immediate]);
    return { execute, status, value, error };
};
//# sourceMappingURL=useAsyncFunction.js.map