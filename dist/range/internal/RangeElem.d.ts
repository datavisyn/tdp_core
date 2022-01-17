import { IRangeElem } from './IRangeElem';
import { IIterator } from '../../base/iterator';
import { SingleRangeElem } from './SingleRangeElem';
export declare class RangeElem implements IRangeElem {
    readonly from: number;
    readonly to: number;
    readonly step: number;
    constructor(from: number, to?: number, step?: number);
    get isAll(): boolean;
    get isSingle(): boolean;
    get isUnbound(): boolean;
    static all(): RangeElem;
    static none(): RangeElem;
    static single(val: number): SingleRangeElem;
    static range(from: number, to?: number, step?: number): RangeElem | SingleRangeElem;
    size(size?: number): number;
    clone(): RangeElem;
    reverse(): RangeElem;
    invert(index: number, size?: number): number;
    /**
     * creates an iterator of this range
     * @param size the underlying size for negative indices
     */
    iter(size?: number): IIterator<number>;
    get __iterator__(): IIterator<number>;
    contains(value: number, size?: number): boolean;
    toString(): string;
    static parse(code: string): RangeElem | SingleRangeElem;
}
