import { IIterator } from '../../base/iterator';
/**
 * fix negative indices given the total size
 * @param v
 * @param size
 * @returns {number}
 */
export interface IRangeElem {
    readonly isAll: boolean;
    readonly isUnbound: boolean;
    readonly isSingle: boolean;
    size(size?: number): number;
    clone(): IRangeElem;
    invert(index: number, size?: number): number;
    readonly __iterator__: IIterator<number>;
    iter(size?: number): IIterator<number>;
    toString(): string;
    readonly from: number;
    readonly step: number;
    readonly to: number;
    reverse(): IRangeElem;
    contains(value: number, size?: number): boolean;
}
