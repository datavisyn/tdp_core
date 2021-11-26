export declare type useAsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export declare const useAsync: <T, E = Error>(asyncFunction: () => Promise<T>, immediate?: boolean) => {
    execute: () => Promise<T>;
    status: useAsyncStatus;
    value: T;
    error: E;
};
