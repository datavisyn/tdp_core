import { EventHandler } from 'visyn_core/base';
import { ILayoutDump, ILayoutContainer, ILayoutParentContainer } from '../interfaces';
import { IParentLayoutContainer } from './IParentLayoutContainer';
export interface ILayoutContainerOption {
    name: string;
    readonly fixed: boolean;
    readonly autoWrap: boolean | string;
    /**
     * if true the user can't drag and drop view, but the separator can still be changed, i.e. it is an intermediate solution between a non-fixed and a fixed layout
     */
    fixedLayout: boolean;
}
export declare abstract class ALayoutContainer<T extends ILayoutContainerOption> extends EventHandler {
    static readonly MIME_TYPE = "text/x-phovea-layout-container";
    parent: IParentLayoutContainer | null;
    protected readonly options: T;
    readonly header: HTMLElement;
    readonly id: number;
    private readonly keyDownListener;
    protected isMaximized: boolean;
    constructor(document: Document, options: Partial<T>);
    get parents(): IParentLayoutContainer[];
    get hideAbleHeader(): boolean;
    get autoWrapOnDrop(): string | boolean;
    protected defaultOptions(): T;
    destroy(): void;
    get name(): string;
    set name(name: string);
    protected updateName(name: string): void;
    persist(): ILayoutDump;
    static restoreOptions(dump: ILayoutDump): Partial<ILayoutContainerOption>;
    static deriveOptions(node: HTMLElement): Partial<ILayoutContainerOption>;
    find(id: number | ((container: ILayoutContainer) => boolean)): this;
    findAll(predicate: (container: ILayoutContainer) => boolean): ILayoutContainer[];
    closest(id: number | ((container: ILayoutParentContainer) => boolean)): any;
    protected toggleMaximizedView(): void;
    protected updateTitle(): void;
    static withChanged(event: string): string;
}
//# sourceMappingURL=ALayoutContainer.d.ts.map