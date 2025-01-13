import { IDropArea, ILayoutContainer, ILayoutDump, ILayoutParentContainer, IRootLayoutContainer, ISize } from '../interfaces';
import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
import { IParentLayoutContainer } from './IParentLayoutContainer';
export declare abstract class AParentLayoutContainer<T extends ILayoutContainerOption> extends ALayoutContainer<T> implements IParentLayoutContainer {
    readonly node: HTMLElement;
    abstract readonly minChildCount: number;
    protected readonly _children: ILayoutContainer[];
    private _visible;
    abstract readonly type: 'tabbing' | 'split' | 'lineup' | 'root';
    constructor(document: Document, options: Partial<T>);
    canDrop(area: IDropArea): boolean;
    get rootParent(): IRootLayoutContainer & ILayoutParentContainer;
    forEach(callback: (child: ILayoutContainer, index: number) => void): void;
    get children(): ILayoutContainer[];
    [Symbol.iterator](): IterableIterator<ILayoutContainer>;
    get length(): number;
    get visible(): boolean;
    set visible(visible: boolean);
    protected visibilityChanged(visible: boolean): void;
    abstract get minSize(): ISize;
    push(child: ILayoutContainer, index?: number): boolean;
    abstract place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    protected setupChild(child: ILayoutContainer): void;
    protected addedChild(child: ILayoutContainer, index: number): void;
    replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
    remove(child: ILayoutContainer): boolean;
    clear(): void;
    protected takeDownChild(child: ILayoutContainer): void;
    resized(): void;
    destroy(): void;
    persist(): ILayoutDump;
    find(id: number | ((container: ILayoutContainer) => boolean)): ILayoutContainer;
    findAll(predicate: (container: ILayoutContainer) => boolean): ILayoutContainer[];
}
//# sourceMappingURL=AParentLayoutContainer.d.ts.map