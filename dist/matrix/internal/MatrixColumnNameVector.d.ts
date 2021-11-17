import { IAnyMatrix } from '../IMatrix';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../../stratification/vector/ANameVector';
export declare class MatrixColumnNameVector extends ANameVector<IAnyMatrix> implements IStringVector {
    constructor(matrix: IAnyMatrix);
    get idtype(): import("../..").IDType;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number;
    persist(): {
        root: any;
        names: string;
    };
    /**
     * converts the cols of the given matrix as a string vector
     * @param matrix
     * @return {IStringVector}
     */
    static asNameVector(matrix: IAnyMatrix): IStringVector;
}
