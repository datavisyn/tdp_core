import * as React from 'react';

export type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export const useAsync = <T, E = Error>(asyncFunction: () => Promise<T>, immediate = true) => {
  const [status, setStatus] = React.useState<useAsyncStatus>('idle');
  const [value, setValue] = React.useState<T | null>(null);
  const [error, setError] = React.useState<E | null>(null);
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = React.useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((response: T) => {
        setValue(response);
        setStatus('success');
        return response;
      })
      .catch((error: E) => {
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
      execute();
    }
  }, [execute, immediate]);
  return { execute, status, value, error };
};