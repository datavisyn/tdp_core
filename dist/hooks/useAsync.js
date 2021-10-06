import { useAsyncFunction } from './useAsyncFunction';
export const useAsync = (asyncFunction, immediate = true) => {
    return useAsyncFunction(asyncFunction, immediate ? [] : null);
};
//# sourceMappingURL=useAsync.js.map