import { AParentLayoutContainer } from './AParentLayoutContainer';
import { ILayoutContainer, ISize } from '../interfaces';
import { ILayoutContainerOption } from './ALayoutContainer';
import { EOrientation, IDropArea } from '../interfaces';
export interface ISequentialLayoutContainerOptions extends ILayoutContainerOption {
    readonly orientation: EOrientation;
}
export declare abstract class ASequentialLayoutContainer<T extends ISequentialLayoutContainerOptions> extends AParentLayoutContainer<T> {
    constructor(document: Document, options: Partial<T>);
    canDrop(area: IDropArea): boolean;
    defaultOptions(): T & {
        orientation: EOrientation;
    };
    get hideAbleHeader(): boolean;
    protected getPadding(): number;
    get minSize(): ISize;
    persist(): import("../interfaces").ILayoutDump & {
        type: string;
        orientation: string;
    };
    static wrap(child: ILayoutContainer): HTMLElement;
}
