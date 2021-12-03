export class ResolveNow<T> implements PromiseLike<T> {
  constructor(private readonly v: T) {
  }

  // When using Typescript v2.7+ the typing can be further specified as `then<TResult1 = T, TResult2 = never>(...`
  then<TResult1, TResult2>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
    return ResolveNow.resolveImmediately(onfulfilled(this.v));
  }
  /**
   * similar to Promise.resolve but executes the result immediately without an intermediate tick
   * @param {PromiseLike<T> | T} result
   * @returns {PromiseLike<T>}
   */
  static resolveImmediately<T>(result: T | PromiseLike<T>): PromiseLike<T> {
    if (result instanceof Promise || (result && typeof (<any>result).then === 'function')) {
      return <PromiseLike<T>>result;
    }
    return <PromiseLike<T>>new ResolveNow(result);
  }
}
