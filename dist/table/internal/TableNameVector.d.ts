import { ITable } from '../ITable';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../../stratification/vector/ANameVector';
export declare class TableNameVector extends ANameVector<ITable> implements IStringVector {
    constructor(table: ITable);
    get idtype(): import("../..").IDType;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number;
    /**
     * converts the rows of the given table as a string vector
     * @param table
     * @return {IStringVector}
     */
    static asNameVector(table: ITable): IStringVector;
}
