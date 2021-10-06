import * as React from 'react';
import { useAsyncFunction } from './useAsyncFunction';
export const useAsync = (asyncFunction, immediate = true) => {
    return useAsyncFunction(asyncFunction, React.useMemo(() => immediate ? [] : null, [immediate]));
};
//# sourceMappingURL=useAsync.js.map