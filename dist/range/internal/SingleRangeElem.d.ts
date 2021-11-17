import { IRangeElem } from './IRangeElem';
import { IIterator } from '../../base/iterator';
export declare class SingleRangeElem implements IRangeElem {
    readonly from: number;
    constructor(from: number);
    get step(): number;
    get to(): number;
    get isAll(): boolean;
    get isSingle(): boolean;
    get isUnbound(): boolean;
    size(size?: number): number;
    clone(): SingleRangeElem;
    contains(value: number, size?: number): boolean;
    reverse(): SingleRangeElem;
    invert(index: number, size?: number): number;
    iter(size?: number): IIterator<number>;
    get __iterator__(): IIterator<number>;
    toString(): string;
}
