import { ILayoutContainer, ILayoutDump, EOrientation, IDropArea } from '../interfaces';
import { ASequentialLayoutContainer, ISequentialLayoutContainerOptions } from './ASequentialLayoutContainer';
export interface ILineUpLayoutContainer extends ISequentialLayoutContainerOptions {
    stackLayout: boolean;
}
export declare class LineUpLayoutContainer extends ASequentialLayoutContainer<ILineUpLayoutContainer> {
    readonly minChildCount = 1;
    readonly type = "lineup";
    constructor(document: Document, options: Partial<ILineUpLayoutContainer>, ...children: ILayoutContainer[]);
    place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    protected addedChild(child: ILayoutContainer, index: number): void;
    protected takeDownChild(child: ILayoutContainer): void;
    persist(): ILayoutDump & {
        type: string;
        orientation: string;
    } & {
        type: string;
        stackLayout: boolean;
    };
    static restore(dump: ILayoutDump, restore: (dump: ILayoutDump) => ILayoutContainer, doc: Document): LineUpLayoutContainer;
    static derive(node: HTMLElement, derive: (node: HTMLElement) => ILayoutContainer): LineUpLayoutContainer;
    defaultOptions(): ILineUpLayoutContainer & {
        orientation: EOrientation;
    } & {
        stackLayout: boolean;
    };
}
//# sourceMappingURL=LineUpLayoutContainer.d.ts.map