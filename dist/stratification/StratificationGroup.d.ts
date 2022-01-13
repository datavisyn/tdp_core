import { Range, RangeLike, CompositeRange1D, Range1DGroup } from '../range';
import type { IDataType } from '../data/datatype';
import { ASelectAble } from '../idtype';
import type { ICategoricalVector } from '../vector';
import { IHistogram } from '../data/histogram';
import type { IStratification, IGroup } from './IStratification';
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class StratificationGroup extends ASelectAble implements IStratification {
    private root;
    private groupIndex;
    private groupDesc;
    constructor(root: IStratification, groupIndex: number, groupDesc: IGroup);
    get desc(): import("./IStratification").IStratificationDataDescription;
    get groups(): IGroup[];
    get ngroups(): number;
    group(groupIndex: number): IStratification;
    get idtype(): import("../idtype").IDType;
    hist(bins?: number, range?: RangeLike): Promise<IHistogram>;
    vector(): Promise<ICategoricalVector>;
    asVector(): Promise<ICategoricalVector>;
    origin(): Promise<IDataType>;
    range(): Promise<CompositeRange1D>;
    idRange(): Promise<CompositeRange1D>;
    rangeGroup(): Promise<Range1DGroup>;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    idView(idRange?: RangeLike): Promise<any>;
    toString(): {
        root: any;
        group: number;
    };
    get idtypes(): import("../idtype").IDType[];
    size(): number[];
    get length(): number;
    get dim(): number[];
    persist(): {
        root: any;
        group: number;
    };
    restore(persisted: any): this;
}
