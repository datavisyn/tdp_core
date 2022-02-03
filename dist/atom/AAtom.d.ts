import { Range, RangeLike } from '../range';
import { ASelectAble } from '../idtype';
import { IValueTypeDesc } from '../data/valuetype';
import { IAtom, IAtomDataDescription } from './IAtom';
/**
 * base class for different Atom implementations
 * @internal
 */
export declare abstract class AAtom<T, D extends IValueTypeDesc> extends ASelectAble {
    readonly desc: IAtomDataDescription<D>;
    constructor(desc: IAtomDataDescription<D>);
    get dim(): number[];
    get valuetype(): D;
    get idtype(): import("../idtype").IDType;
    get idtypes(): import("../idtype").IDType[];
    ids(range?: Range): Promise<Range>;
    idView(idRange?: RangeLike): Promise<IAtom<T, D>>;
    abstract id(): Promise<Range>;
    persist(): string;
    restore(persisted: any): this;
}
//# sourceMappingURL=AAtom.d.ts.map