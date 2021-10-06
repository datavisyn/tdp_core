import * as React from 'react';
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
//# sourceMappingURL=useAsync copy.js.map