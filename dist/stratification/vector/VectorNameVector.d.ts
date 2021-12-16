import { IAnyVector } from '../../vector';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from './ANameVector';
export declare class VectorNameVector extends ANameVector<IAnyVector> implements IStringVector {
    constructor(vector: IAnyVector);
    get idtype(): import("../..").IDType;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number;
    /**
     * converts the name of the given vector as a string vector
     * @param vector
     * @return {IStringVector}
     */
    static asNameVector(vector: IAnyVector): IStringVector;
}
