import { Range, RangeLike } from '../../range';
import { CompositeRange1D } from '../../range/CompositeRange1D';
import { IDataType, ADataType, IValueTypeDesc } from '../../data';
import { IHistogram } from '../../data/histogram';
import { ICategoricalVector, IVector } from '../../vector/IVector';
import { IStratification, IStratificationDataDescription } from '../IStratification';
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class StratificationVector extends ADataType<IStratificationDataDescription> implements IStratification {
    private v;
    private r;
    constructor(v: IVector<any, IValueTypeDesc>, r: CompositeRange1D);
    get idtype(): import("../..").IDType;
    get groups(): import("../IStratification").IGroup[];
    group(group: number): IStratification;
    hist(bins?: number, range?: RangeLike): Promise<IHistogram>;
    vector(): Promise<ICategoricalVector>;
    asVector(): Promise<ICategoricalVector>;
    origin(): Promise<IDataType>;
    range(): Promise<CompositeRange1D>;
    idRange(): Promise<CompositeRange1D>;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    get idtypes(): import("../..").IDType[];
    size(): number;
    get length(): number;
    get ngroups(): number;
    get dim(): number[];
    persist(): {
        root: any;
        asstrat: boolean;
    };
}
//# sourceMappingURL=StratificationVector.d.ts.map