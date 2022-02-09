import { RangeLike, Range, CompositeRange1D } from '../range';
import { ICategoricalValueTypeDesc } from '../data';
import { ICategoricalVector, IVectorDataDescription } from '../vector';
import { AVector } from '../vector/AVector';
import { IStratification } from './IStratification';
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class StratificationCategoricalVector extends AVector<string, ICategoricalValueTypeDesc> implements ICategoricalVector {
    private strat;
    private range;
    readonly valuetype: ICategoricalValueTypeDesc;
    readonly desc: IVectorDataDescription<ICategoricalValueTypeDesc>;
    private _cache;
    constructor(strat: IStratification, range: CompositeRange1D);
    get idtype(): import("..").IDType;
    get idtypes(): import("..").IDType[];
    persist(): {
        root: any;
    };
    restore(persisted: any): ICategoricalVector;
    private load;
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    at(i: number): Promise<string>;
    data(range?: RangeLike): Promise<any>;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): any;
    sort(compareFn?: (a: string, b: string) => number, thisArg?: any): Promise<ICategoricalVector>;
    filter(callbackfn: (value: string, index: number) => boolean, thisArg?: any): Promise<ICategoricalVector>;
}
//# sourceMappingURL=StratificationCategoricalVector.d.ts.map