/**
 * This file defines interfaces for various data types and their metadata.
 */
import { IPersistable } from '../base/IPersistable';
import { IDType } from '../idtype/IDType';
import { ISelectAble, ASelectAble } from '../idtype/ASelectAble';
import { IHistogram } from './histogram';
import { IAdvancedStatistics, IStatistics } from '../base/statistics';
import { RangeLike, Range } from '../range';
import { IDataDescription } from './DataDescription';
import { IValueTypeDesc } from './valuetype';
/**
 * Basic data type interface
 */
export interface IDataType extends ISelectAble, IPersistable {
    /**
     * its description
     */
    readonly desc: IDataDescription;
    /**
     * dimensions of this datatype
     * rows, cols, ....
     */
    readonly dim: number[];
    idView(idRange?: RangeLike): Promise<IDataType>;
}
/**
 * dummy data type just holding the description
 */
export declare abstract class ADataType<T extends IDataDescription> extends ASelectAble implements IDataType {
    readonly desc: T;
    constructor(desc: T);
    get dim(): number[];
    ids(range?: RangeLike): Promise<Range>;
    idView(idRange?: RangeLike): Promise<ADataType<T>>;
    get idtypes(): IDType[];
    persist(): any;
    restore(persisted: any): this;
    toString(): any;
    /**
     * since there is no instanceOf for interfaces
     * @param v
     * @return {any}
     */
    static isADataType(v: IDataType): boolean;
}
export declare class DummyDataType extends ADataType<IDataDescription> {
    constructor(desc: IDataDescription);
}
export interface IHistAbleDataType<D extends IValueTypeDesc> extends IDataType {
    valuetype: D;
    hist(nbins?: number): Promise<IHistogram>;
    readonly length: number;
}
export interface IStatsAbleDataType<D extends IValueTypeDesc> extends IDataType {
    valuetype: D;
    stats(): Promise<IStatistics>;
    statsAdvanced(): Promise<IAdvancedStatistics>;
    readonly length: number;
}
//# sourceMappingURL=datatype.d.ts.map