import { AVector } from '../../vector/AVector';
import { IStringValueTypeDesc, IDataType } from '../../data';
import { IVector, IVectorDataDescription } from '../../vector';
import { RangeLike } from '../../range';
import { IDType } from '../../idtype/IDType';
export declare type IStringVector = IVector<string, IStringValueTypeDesc>;
export declare abstract class ANameVector<T extends IDataType> extends AVector<string, IStringValueTypeDesc> {
    protected base: T;
    readonly desc: IVectorDataDescription<IStringValueTypeDesc>;
    constructor(base: T);
    get valuetype(): IStringValueTypeDesc;
    get idtype(): IDType;
    get idtypes(): IDType[];
    persist(): any;
    restore(persisted: any): IVector<string, IStringValueTypeDesc>;
    at(i: number): Promise<string>;
    abstract names(range?: RangeLike): Promise<string[]>;
    data(range?: RangeLike): Promise<string[]>;
    sort(compareFn?: (a: string, b: string) => number, thisArg?: any): Promise<IStringVector>;
    filter(callbackfn: (value: string, index: number) => boolean, thisArg?: any): Promise<IStringVector>;
}
//# sourceMappingURL=ANameVector.d.ts.map