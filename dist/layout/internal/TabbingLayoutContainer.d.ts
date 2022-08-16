import { AParentLayoutContainer } from './AParentLayoutContainer';
import { ILayoutContainer, ILayoutDump, ISize, ITabbingLayoutContainer, IDropArea } from '../interfaces';
import { ILayoutContainerOption } from './ALayoutContainer';
export interface ITabbingLayoutContainerOptions extends ILayoutContainerOption {
    readonly active: number;
}
export declare class TabbingLayoutContainer extends AParentLayoutContainer<ITabbingLayoutContainerOptions> implements ITabbingLayoutContainer {
    private static readonly TAB_REORDER;
    readonly minChildCount = 0;
    readonly type = "tabbing";
    private readonly mouseEnter;
    private readonly mouseLeave;
    private _active;
    constructor(document: Document, options: Partial<ITabbingLayoutContainerOptions>, ...children: ILayoutContainer[]);
    canDrop(area: IDropArea): boolean;
    place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    protected defaultOptions(): ITabbingLayoutContainerOptions;
    get active(): ILayoutContainer;
    set active(child: ILayoutContainer);
    private reorderAble;
    protected addedChild(child: ILayoutContainer, index: number): void;
    private moveChild;
    replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
    protected takeDownChild(child: ILayoutContainer): void;
    get minSize(): ISize;
    private activeChanged;
    protected visibilityChanged(visible: boolean): void;
    persist(): ILayoutDump & {
        type: string;
        active: number;
    };
    static restore(dump: ILayoutDump, restore: (dump: ILayoutDump) => ILayoutContainer, doc: Document): TabbingLayoutContainer;
    static derive(node: HTMLElement, derive: (node: HTMLElement) => ILayoutContainer): TabbingLayoutContainer;
    private toggleFrozenLayout;
}
//# sourceMappingURL=TabbingLayoutContainer.d.ts.map