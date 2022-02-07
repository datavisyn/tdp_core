import { IStratification } from '../IStratification';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../vector/ANameVector';
export declare class StratificationNameVector extends ANameVector<IStratification> implements IStringVector {
    constructor(strat: IStratification);
    get idtype(): import("../..").IDType;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number;
    /**
     * converts the rows of the given stratification as a string vector
     * @param stratification
     * @return {IStringVector}
     */
    static asNameVector(stratification: IStratification): IStringVector;
}
//# sourceMappingURL=StratificationNameVector.d.ts.map