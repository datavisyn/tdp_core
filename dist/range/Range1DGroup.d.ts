import { Range1D, IRange1DGroup } from './Range1D';
export declare class Range1DGroup extends Range1D implements IRange1DGroup {
    name: string;
    color: string;
    constructor(name: string, color: string, base?: Range1D);
    preMultiply(sub: Range1D, size?: number): Range1DGroup;
    union(other: Range1D, size?: number): Range1DGroup;
    intersect(other: Range1D, size?: number): Range1DGroup;
    without(without: Range1D, size?: number): Range1DGroup;
    clone(): Range1DGroup;
    toString(): string;
    toSet(size?: number): Range1DGroup;
    fromLike(indices: number[]): Range1DGroup;
    /**
     * TODO document
     * @param range
     * @return {Range1DGroup}
     */
    static asUngrouped(range: Range1D): Range1DGroup;
}
