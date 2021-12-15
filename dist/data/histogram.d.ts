import { Range } from '../range/Range';
import { Range1D } from '../range/Range1D';
import { CompositeRange1D } from '../range/CompositeRange1D';
import { IIterable } from '../base/IIterable';
export interface IHistogram extends IIterable<number> {
    readonly bins: number;
    readonly largestFrequency: number;
    /**
     * largest frequency without missing
     */
    readonly largestBin: number;
    readonly count: number;
    /**
     * number of valid entries;
     */
    readonly validCount: number;
    frequency(bin: number): number;
    range(bin: number): Range;
    binOf(value: any): number;
    readonly missing: number;
    readonly missingRange: Range;
    forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void;
}
export interface ICatHistogram extends IHistogram {
    readonly categories: string[];
    readonly colors: string[];
}
export declare class AHistogram implements IHistogram {
    private _bins;
    private _missing;
    private _ranges;
    private _missingRange;
    constructor(bins: number, hist?: number[]);
    get largestFrequency(): number;
    get largestBin(): any;
    get count(): number;
    get validCount(): number;
    get bins(): number;
    binOf(value: any): number;
    frequency(bin: number): number;
    range(bin: number): Range;
    get missing(): number;
    get missingRange(): Range;
    pushAll(arr: IIterable<any>, indices?: Range1D, size?: number): void;
    forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void;
}
export declare class Histogram extends AHistogram {
    private valueRange;
    constructor(bins: number, valueRange: number[], hist?: number[]);
    binOf(value: any): number;
    private binOfImpl;
    static hist(arr: IIterable<number>, indices: Range1D, size: number, bins: number, range: number[]): IHistogram;
    static wrapHist(hist: number[], valueRange: number[]): Histogram;
}
export declare class CatHistogram extends AHistogram implements ICatHistogram {
    private values;
    readonly categories: string[];
    readonly colors: string[];
    constructor(values: any[], categories: string[], colors: string[]);
    binOf(value: any): number;
    static categoricalHist<T>(arr: IIterable<T>, indices: Range1D, size: number, categories: T[], labels: string[], colors: string[]): IHistogram;
}
export declare class RangeHistogram implements ICatHistogram {
    private readonly _range;
    constructor(_range: CompositeRange1D);
    get categories(): string[];
    get colors(): string[];
    get largestFrequency(): any;
    get largestBin(): any;
    get count(): number;
    get validCount(): number;
    get bins(): number;
    binOf(value: any): number;
    frequency(bin: number): number;
    range(bin: number): Range;
    get missing(): number;
    get missingRange(): Range;
    forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void;
    static rangeHist(range: CompositeRange1D): RangeHistogram;
}
