export interface IIterable<T> {
  forEach(callbackfn: (value: T) => void, thisArg?: any): void;
}

