import { IEventListener } from 'visyn_core/base';
import { ILayoutContainer, ILayoutDump, ILayoutParentContainer, IRootLayoutContainer, IDropArea } from '../interfaces';

export interface IParentLayoutContainer extends ILayoutParentContainer {
  id: number;
  on(events: string | { [key: string]: IEventListener }, handler?: IEventListener);
  off(events: string | { [key: string]: IEventListener }, handler?: IEventListener);
  forEach(callback: (child: ILayoutContainer, index: number) => void);
  canDrop?(area: IDropArea): boolean;
  closest(id: number | ((container: ILayoutParentContainer) => boolean));
  push(child: ILayoutContainer): boolean;
  push(child: ILayoutContainer, index: number): boolean;
  replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
  remove(child: ILayoutContainer): boolean;
  resized();
  destroy();
  persist(): ILayoutDump;
  place?(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
  find(id: number | ((container: ILayoutContainer) => boolean));
  findAll(predicate: (container: ILayoutContainer) => boolean);
  rootParent?: IRootLayoutContainer & ILayoutParentContainer;
}

export abstract class IParentLayoutContainerUtils {
  static canDrop(area: IDropArea) {
    return false;
  }

  static get rootParent(): IRootLayoutContainer & ILayoutParentContainer {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let p: any = this;
    while (p.parent !== null) {
      p = p.parent;
    }
    return <IRootLayoutContainer & ILayoutParentContainer>p;
  }
}
