/**
 * This file defines interfaces for various data types and their metadata.
 */
import { IDType } from 'visyn_core/idtype';
import { IPersistable } from '../base/IPersistable';
import { IDataDescription } from './DataDescription';
import { EventHandler } from '../base/event';
/**
 * Basic data type interface
 */
export interface IDataType extends IPersistable {
    /**
     * its description
     */
    readonly desc: IDataDescription;
    /**
     * dimensions of this datatype
     * rows, cols, ....
     */
    readonly dim: number[];
}
/**
 * dummy data type just holding the description
 */
export declare abstract class ADataType<T extends IDataDescription> extends EventHandler implements IDataType {
    readonly desc: T;
    constructor(desc: T);
    get dim(): number[];
    idView(ids?: string[]): Promise<ADataType<T>>;
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
}
//# sourceMappingURL=datatype.d.ts.map