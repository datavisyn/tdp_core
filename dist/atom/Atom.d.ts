import { IValueTypeDesc } from '../data/valuetype';
import { IAtom, IAtomDataDescription, IAtomValue, IInlinedAtomDataDescription } from './IAtom';
import { AAtom } from './AAtom';
import { Range } from '../range';
export declare class Atom<T, D extends IValueTypeDesc> extends AAtom<T, D> implements IAtom<T, D> {
    private readonly loaded;
    constructor(desc: IAtomDataDescription<D>, loaded: IAtomValue<T>);
    id(): Promise<Range>;
    name(): Promise<string>;
    data(): Promise<T>;
    static create<T, D extends IValueTypeDesc>(desc: IAtomDataDescription<D> | IInlinedAtomDataDescription<T, D>): IAtom<T, D>;
    static asAtom<T>(name: string, value: T, options?: IAsAtomOptions): Atom<T, IValueTypeDesc>;
}
export interface IAsAtomOptions {
    name?: string;
    idtype?: string;
    rowassigner?(ids: string[]): Range;
}
