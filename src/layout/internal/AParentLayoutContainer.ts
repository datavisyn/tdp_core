import { IDropArea, ILayoutContainer, ILayoutDump, ILayoutParentContainer, IRootLayoutContainer, ISize, LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
import { IParentLayoutContainer } from './IParentLayoutContainer';

export abstract class AParentLayoutContainer<T extends ILayoutContainerOption> extends ALayoutContainer<T> implements IParentLayoutContainer {
  readonly node: HTMLElement;

  abstract readonly minChildCount: number;

  protected readonly _children: ILayoutContainer[] = [];

  private _visible = false;

  abstract readonly type: 'tabbing' | 'split' | 'lineup' | 'root';

  constructor(document: Document, options: Partial<T>) {
    super(document, options);
    this.node = document.createElement('main');
    this.node.classList.add('phovea-layout');
  }

  canDrop(area: IDropArea) {
    return false;
  }

  get rootParent(): IRootLayoutContainer & ILayoutParentContainer {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let p: ILayoutParentContainer = this;
    while (p.parent !== null) {
      p = p.parent;
    }
    return <IRootLayoutContainer & ILayoutParentContainer>p;
  }

  forEach(callback: (child: ILayoutContainer, index: number) => void) {
    this._children.forEach(callback);
  }

  get children() {
    return this._children.slice();
  }

  [Symbol.iterator]() {
    return this._children[Symbol.iterator]();
  }

  get length() {
    return this._children.length;
  }

  get visible() {
    return this._visible;
  }

  set visible(visible: boolean) {
    if (this._visible === visible) {
      return;
    }
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_VISIBILITY_CHANGED), this._visible, (this._visible = visible));
    this.visibilityChanged(visible);
  }

  protected visibilityChanged(visible: boolean): void {
    this.forEach((c) => (c.visible = visible));
  }

  abstract get minSize(): ISize;

  push(child: ILayoutContainer, index = -1) {
    this.setupChild(child);
    if (index >= this._children.length || index < 0) {
      index = this._children.length;
      this._children.push(child);
    } else {
      this._children.splice(index, 0, child);
    }
    this.addedChild(child, index);
    return true;
  }

  abstract place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;

  protected setupChild(child: ILayoutContainer) {
    if (child.parent) {
      child.parent.remove(child);
    }
    (<any>child).parent = this;
  }

  protected addedChild(child: ILayoutContainer, index: number) {
    child.resized();
    this.propagate(child, LayoutContainerEvents.EVENT_LAYOUT_CHANGED, LayoutContainerEvents.EVENT_MAXIMIZE, LayoutContainerEvents.EVENT_RESTORE_SIZE);
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_ADDED), child, index);
  }

  replace(child: ILayoutContainer, replacement: ILayoutContainer) {
    const index = this._children.indexOf(child);
    console.assert(index >= 0);

    this.takeDownChild(child);
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED), child);
    this.setupChild(replacement);
    this._children.splice(index, 1, replacement);
    this.addedChild(replacement, index);
    return true;
  }

  remove(child: ILayoutContainer) {
    this.takeDownChild(child);
    this._children.splice(this._children.indexOf(child), 1);
    if (this.minChildCount > this.length && this.parent) {
      if (this.length > 1) {
        // remove and inline my children (just one since the remove will be called again
        this.parent.push(this._children[1]);
      } else if (this.length > 0) {
        this.parent.replace(this, this._children[0]);
      } else {
        this.parent.remove(this);
      }
    }
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED), child);
    return true;
  }

  clear() {
    if (this.length === 0) {
      return;
    }
    this._children.forEach((old) => this.takeDownChild(old));
    this._children.splice(0, this._children.length);
    if (this.minChildCount > this.length && this.parent) {
      this.parent.remove(this);
    }
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED));
  }

  protected takeDownChild(child: ILayoutContainer) {
    this.stopPropagation(child, LayoutContainerEvents.EVENT_LAYOUT_CHANGED, LayoutContainerEvents.EVENT_MAXIMIZE, LayoutContainerEvents.EVENT_RESTORE_SIZE);
    child.visible = false;
    (<any>child).parent = null;
  }

  resized() {
    this.forEach((d) => d.resized());
  }

  destroy() {
    super.destroy();
    if (this.parent) {
      this.parent.remove(this);
    }
    this.forEach((d) => d.destroy());
  }

  persist(): ILayoutDump {
    return Object.assign(super.persist(), {
      children: this._children.map((d) => d.persist()),
    });
  }

  // @ts-ignore
  find(id: number | ((container: ILayoutContainer) => boolean)): ILayoutContainer {
    if (super.find(id) != null) {
      return <ILayoutContainer>this;
    }
    for (const child of this._children) {
      const r = child.find(id);
      if (r != null) {
        return r;
      }
    }
    return null;
  }

  findAll(predicate: (container: ILayoutContainer) => boolean) {
    const base = super.findAll(predicate);
    return base.concat(...this._children.map((d) => d.findAll(predicate)));
  }
}
