import { IIterable } from './IIterable';
/**
 * simple number statistics similar to DoubleStatistics in Caleydo
 * TODO use a standard library for that
 */
export interface IStatistics {
    readonly min: number;
    readonly max: number;
    readonly sum: number;
    readonly mean: number;
    readonly var: number;
    readonly sd: number;
    readonly n: number;
    readonly nans: number;
    readonly moment2: number;
    readonly moment3: number;
    readonly moment4: number;
    readonly kurtosis: number;
    readonly skewness: number;
}
export interface IAdvancedStatistics extends IStatistics {
    readonly median: number;
    readonly q1: number;
    readonly q3: number;
}
export declare class Statistics implements IStatistics {
    min: number;
    max: number;
    sum: number;
    mean: number;
    private _var;
    n: number;
    nans: number;
    moment2: number;
    moment3: number;
    moment4: number;
    get var(): number;
    /** Returns the standard deviation */
    get sd(): number;
    get kurtosis(): number;
    get skewness(): number;
    push(x: number): void;
    static computeStats(...arr: IIterable<number>[]): IStatistics;
}
export declare class AdvancedStatistics extends Statistics implements IAdvancedStatistics {
    readonly median: number;
    readonly q1: number;
    readonly q3: number;
    constructor(median: number, q1: number, q3: number);
    static computeAdvancedStats(arr: number[]): IAdvancedStatistics;
}
//# sourceMappingURL=statistics.d.ts.map