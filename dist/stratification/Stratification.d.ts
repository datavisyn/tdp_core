import { RangeLike, Range, CompositeRange1D } from '../range';
import { ADataType, IDataType } from '../data';
import { ICategoricalVector } from '../vector';
import { IHistogram } from '../data/histogram';
import { IStratification, IStratificationDataDescription } from './IStratification';
import { IStratificationLoader } from './loader';
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class Stratification extends ADataType<IStratificationDataDescription> implements IStratification {
    private loader;
    private _v;
    constructor(desc: IStratificationDataDescription, loader: IStratificationLoader);
    get idtype(): import("../idtype").IDType;
    get groups(): import("./IStratification").IGroup[];
    group(group: number): IStratification;
    hist(bins?: number, range?: Range): Promise<IHistogram>;
    vector(): Promise<ICategoricalVector>;
    asVector(): Promise<ICategoricalVector>;
    origin(): Promise<IDataType>;
    range(): Promise<CompositeRange1D>;
    idRange(): Promise<CompositeRange1D>;
    names(range?: RangeLike): Promise<any>;
    ids(range?: RangeLike): Promise<Range>;
    get idtypes(): import("../idtype").IDType[];
    size(): number;
    get length(): number;
    get ngroups(): number;
    get dim(): number[];
    persist(): string;
    static guessColor(stratification: string, group: string): "blue" | "red" | "#e41a1b" | "#377eb8" | "gray";
    /**
     * module entry point for creating a datatype
     * @param desc
     * @returns {IVector}
     */
    static create(desc: IStratificationDataDescription): Stratification;
    static wrap(desc: IStratificationDataDescription, rows: string[], rowIds: number[], range: CompositeRange1D): Stratification;
    static asStratification(rows: string[], range: CompositeRange1D, options?: IAsStratifcationOptions): Stratification;
    static wrapCategoricalVector(v: ICategoricalVector): Stratification;
}
export interface IAsStratifcationOptions {
    name?: string;
    idtype?: string;
    rowassigner?(ids: string[]): Range;
}
