import { IDType } from 'visyn_core/idtype';
import { INamedSet } from './interfaces';
export declare class NamedSetList {
    private readonly idType;
    private readonly sessionCreator;
    readonly node: HTMLElement;
    private data;
    private filter;
    private loaded;
    constructor(idType: IDType, sessionCreator: (namedSet: INamedSet) => void, doc?: Document);
    get(index: number): INamedSet;
    private build;
    private edit;
    update(): void;
    private updateGroup;
    push(...namedSet: INamedSet[]): void;
    remove(namedSet: INamedSet): void;
    replace(oldNamedSet: INamedSet, newNamedSet: INamedSet): void;
    protected findFilters(): Promise<(metaData: object) => boolean>;
    protected list(): Promise<INamedSet[]>;
}
//# sourceMappingURL=NamedSetList.d.ts.map