import { Range, RangeLike, CompositeRange1D } from '../range';
import { IDataType, IDataDescription } from '../data';
import { IDType } from '../idtype';
import { IHistogram } from '../data/histogram';
import { ICategoricalVector } from '../vector/IVector';
export interface IGroup {
    readonly name: string;
    readonly color: string;
    readonly size: number;
}
export interface IStratificationDataDescription extends IDataDescription {
    readonly idtype: string;
    readonly size: number;
    readonly groups: IGroup[];
    readonly ngroups: number;
    /**
     * fqname of the origin dataset, e.g. vector, table
     */
    readonly origin?: string;
}
export interface IStratification extends IDataType {
    readonly desc: IStratificationDataDescription;
    range(): Promise<CompositeRange1D>;
    idRange(): Promise<CompositeRange1D>;
    /**
     * @deprecated use asVector instead
     */
    vector(): Promise<ICategoricalVector>;
    asVector(): Promise<ICategoricalVector>;
    names(): Promise<string[]>;
    names(range: RangeLike): Promise<string[]>;
    ids(): Promise<Range>;
    ids(range: RangeLike): Promise<Range>;
    hist(bins?: number, range?: RangeLike): Promise<IHistogram>;
    readonly length: number;
    readonly ngroups: number;
    readonly groups: IGroup[];
    readonly idtype: IDType;
    group(group: number): IStratification;
    origin(): Promise<IDataType>;
    size(): any;
}
//# sourceMappingURL=IStratification.d.ts.map