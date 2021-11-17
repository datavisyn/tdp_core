export declare class ResolveNow<T> implements PromiseLike<T> {
    private readonly v;
    constructor(v: T);
    then<TResult1, TResult2>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
    /**
     * similar to Promise.resolve but executes the result immediately without an intermediate tick
     * @param {PromiseLike<T> | T} result
     * @returns {PromiseLike<T>}
     */
    static resolveImmediately<T>(result: T | PromiseLike<T>): PromiseLike<T>;
}
