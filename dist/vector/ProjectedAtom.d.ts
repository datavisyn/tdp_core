import { IValueTypeDesc } from '../data/valuetype';
import { IAtom, IAtomDataDescription, IAtomValue } from '../atom/IAtom';
import { RangeLike, Range } from '../range';
import { ASelectAble } from '../idtype';
import { IVector } from './IVector';
export declare class ProjectedAtom<T, D extends IValueTypeDesc, M, MD extends IValueTypeDesc> extends ASelectAble implements IAtom<T, D> {
    private v;
    private f;
    private thisArgument;
    readonly valuetype: D;
    private _idtype;
    readonly desc: IAtomDataDescription<D>;
    private cache;
    constructor(v: IVector<M, MD>, f: (data: M[], ids: Range, names: string[]) => IAtomValue<T>, thisArgument?: IVector<M, MD>, valuetype?: D, _idtype?: import("../idtype").IDType);
    private load;
    id(): Promise<Range>;
    name(): Promise<string>;
    data(): Promise<T>;
    get dim(): number[];
    get idtype(): import("../idtype").IDType;
    get idtypes(): import("../idtype").IDType[];
    ids(range?: Range): Promise<Range>;
    idView(idRange?: RangeLike): Promise<IAtom<T, D>>;
    persist(): {
        root: any;
        f: string;
        valuetype: D;
        idtype: string;
    };
    restore(persisted: any): this;
}
