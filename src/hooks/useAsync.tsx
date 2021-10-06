import * as React from 'react';
import {useAsyncFunction} from './useAsyncFunction';

export type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export const useAsync = <T, E = Error>(asyncFunction: () => Promise<T>, immediate: boolean = true) => {
  return useAsyncFunction<typeof asyncFunction, E, T>(asyncFunction, React.useMemo<[] | null>(() => immediate ? [] : null, [immediate]));
};
