export class ResolveNow {
    constructor(v) {
        this.v = v;
    }
    // When using Typescript v2.7+ the typing can be further specified as `then<TResult1 = T, TResult2 = never>(...`
    then(onfulfilled, onrejected) {
        return ResolveNow.resolveImmediately(onfulfilled(this.v));
    }
    /**
     * similar to Promise.resolve but executes the result immediately without an intermediate tick
     * @param {PromiseLike<T> | T} result
     * @returns {PromiseLike<T>}
     */
    static resolveImmediately(result) {
        if (result instanceof Promise || (result && typeof result.then === 'function')) {
            return result;
        }
        return new ResolveNow(result);
    }
}
//# sourceMappingURL=promise.js.map