import { Range } from './Range';
import { Range1D } from './Range1D';
import { RangeLike } from './RangeLike';
interface IParseDimResult {
    act: number;
    dim: Range1D;
}
export declare class ParseRangeUtils {
    /**
     * parse the give code created toString
     * @param code
     * @returns {Range}
     */
    static parseRange(code: string): Range;
    static parseNamedRange1D(code: string, act: number): IParseDimResult;
    static parseRange1D(code: string, act: number): IParseDimResult;
    /**
     * Interprets the parameter options and returns an appropriate range
     *
     * If it is null, returns a new range with all elements.
     * If the RangeLike is a range, then the range is returned unchanged.
     * If it is an array, the numbers in the array are treated as indices for a range.
     * If it is a string, the range is parsed according to the grammar defined in parser.ts
     *
     * @param arange something like a range
     * @returns {Range}
     */
    static parseRangeLike(arange?: RangeLike): Range;
}
export {};
