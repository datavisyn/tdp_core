import { Range, RangeLike } from '../range';
import { CompositeRange1D } from '../range/CompositeRange1D';
import { ASelectAble, IDType } from '../idtype';
import { IValueTypeDesc } from '../data';
import { IHistogram } from '../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../base/statistics';
import { IVector } from './IVector';
import { IAtom, IAtomValue } from '../atom/IAtom';
/**
 * base class for different Vector implementations, views, transposed,...
 * @internal
 */
export declare abstract class AVector<T, D extends IValueTypeDesc> extends ASelectAble {
    protected root: IVector<T, D>;
    constructor(root: IVector<T, D>);
    get dim(): number[];
    abstract data(range?: RangeLike): Promise<any[]>;
    abstract size(): number;
    get length(): number;
    view(range?: RangeLike): IVector<T, D>;
    idView(idRange?: RangeLike): Promise<IVector<T, D>>;
    stats(range?: RangeLike): Promise<IStatistics>;
    statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;
    get indices(): Range;
    /**
     * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
     */
    groups(): Promise<CompositeRange1D>;
    hist(bins?: number, range?: RangeLike): Promise<IHistogram>;
    every(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<boolean>;
    some(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<boolean>;
    forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): Promise<void>;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U>;
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U>;
    reduceAtom<U, UD extends IValueTypeDesc>(f: (data: T[], ids: Range, names: string[]) => IAtomValue<U>, thisArgument?: any, valuetype?: UD, idtype?: IDType): IAtom<U, UD>;
    restore(persisted: any): IVector<T, D> | IAtom<unknown, any>;
}
/**
 * view on the vector restricted by a range
 * @internal
 */
export declare class VectorView<T, D extends IValueTypeDesc> extends AVector<T, D> {
    private range;
    /**
     * @param root underlying matrix
     * @param range range selection
     */
    constructor(root: IVector<T, D>, range: Range);
    get desc(): import("./IVector").IVectorDataDescription<D>;
    persist(): {
        root: any;
        range: string;
    };
    size(): number;
    at(i: number): Promise<T>;
    data(range?: RangeLike): Promise<T[]>;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    view(range?: RangeLike): VectorView<T, D>;
    get valuetype(): D;
    get idtype(): IDType;
    get idtypes(): IDType[];
    sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>>;
    filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>>;
}
