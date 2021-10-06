export declare type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export declare const useAsyncFunction: <F extends (...args: any[]) => T, E = Error, T = ReturnType<F>>(asyncFunction: F, immediate?: Parameters<F>) => {
    execute: (...args: Parameters<F>) => Promise<T>;
    status: useAsyncStatus;
    value: T;
    error: E;
};
