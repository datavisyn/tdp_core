import { IEventListener } from 'visyn_core/base';
import { IDropArea, ILayoutContainer, ILayoutDump, ILayoutParentContainer, IRootLayoutContainer } from '../interfaces';
export interface IParentLayoutContainer extends ILayoutParentContainer {
    id: number;
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): any;
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): any;
    forEach(callback: (child: ILayoutContainer, index: number) => void): any;
    canDrop?(area: IDropArea): boolean;
    closest(id: number | ((container: ILayoutParentContainer) => boolean)): any;
    push(child: ILayoutContainer): boolean;
    push(child: ILayoutContainer, index: number): boolean;
    replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
    remove(child: ILayoutContainer): boolean;
    resized(): any;
    destroy(): any;
    persist(): ILayoutDump;
    place?(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    find(id: number | ((container: ILayoutContainer) => boolean)): any;
    findAll(predicate: (container: ILayoutContainer) => boolean): any;
    rootParent?: IRootLayoutContainer & ILayoutParentContainer;
}
export declare abstract class IParentLayoutContainerUtils {
    static canDrop(area: IDropArea): boolean;
    static get rootParent(): IRootLayoutContainer & ILayoutParentContainer;
}
//# sourceMappingURL=IParentLayoutContainer.d.ts.map