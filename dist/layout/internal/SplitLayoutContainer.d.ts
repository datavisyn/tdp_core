import { IDropArea, ILayoutContainer, ILayoutDump, ISplitLayoutContainer } from '../interfaces';
import { ASequentialLayoutContainer, ISequentialLayoutContainerOptions } from './ASequentialLayoutContainer';
export declare class SplitLayoutContainer extends ASequentialLayoutContainer<ISequentialLayoutContainerOptions> implements ISplitLayoutContainer {
    private static readonly SEPARATOR;
    private static readonly SEPARATOR_WIDTH;
    readonly minChildCount = 2;
    readonly type = "split";
    private readonly _ratios;
    constructor(document: Document, options: Partial<ISequentialLayoutContainerOptions>, ratio?: number, child1?: ILayoutContainer, child2?: ILayoutContainer);
    defaultOptions(): any;
    place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    private isSeparator;
    private enableDragging;
    setRatio(index: number, ratio: number): void;
    private setRatioImpl;
    private squeeze;
    private updateRatios;
    get ratios(): number[];
    set ratios(values: number[]);
    protected getPadding(): number;
    push(child: ILayoutContainer, index?: number, ratio?: number): boolean;
    protected addedChild(child: ILayoutContainer, index: number): void;
    replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
    protected takeDownChild(child: ILayoutContainer): void;
    remove(child: ILayoutContainer): boolean;
    persist(): ILayoutDump & {
        type: string;
        orientation: string;
    } & {
        type: string;
        ratios: number[];
        fixedLayout: boolean;
    };
    static restore(dump: ILayoutDump, restore: (dump: ILayoutDump) => ILayoutContainer, doc: Document): SplitLayoutContainer;
    static derive(node: HTMLElement, derive: (node: HTMLElement) => ILayoutContainer): SplitLayoutContainer;
}
//# sourceMappingURL=SplitLayoutContainer.d.ts.map