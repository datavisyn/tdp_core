import { AParentLayoutContainer } from './AParentLayoutContainer';
import { IDropArea, ILayoutContainer, ILayoutDump, ISize, ITabbingLayoutContainer, LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
import { DnDUtils } from '../../app';
import { LAYOUT_CONTAINER_WRAPPER } from '../constants';

export interface ITabbingLayoutContainerOptions extends ILayoutContainerOption {
  readonly active: number;
}

export class TabbingLayoutContainer extends AParentLayoutContainer<ITabbingLayoutContainerOptions> implements ITabbingLayoutContainer {
  private static readonly TAB_REORDER = `<div data-layout="tab-reorder">&nbsp;</div>`;

  readonly minChildCount = 0;

  readonly type = 'tabbing';

  private readonly mouseEnter = () => this.header.classList.add('show-header'); // show full header when hovering over the minimal header

  private readonly mouseLeave = () => this.header.classList.remove('show-header'); // hide header again

  private _active: ILayoutContainer | null = null;

  constructor(document: Document, options: Partial<ITabbingLayoutContainerOptions>, ...children: ILayoutContainer[]) {
    super(document, options);
    this.node.dataset.layout = 'tabbing';
    this.header.dataset.layout = 'tabbing';
    children.forEach((d) => this.push(d));
    if (this.options.active != null && this.length >= this.options.active) {
      this.active = this._children[this.options.active];
    }

    if (!this.options.fixedLayout) {
      DnDUtils.getInstance().dropAble(
        this.header,
        [ALayoutContainer.MIME_TYPE],
        (result) => {
          const id = parseInt(result.data[ALayoutContainer.MIME_TYPE], 10);
          console.assert(id >= 0);
          // find id and move it here
          const root = this.rootParent;
          const toMove = root.find(id);
          if (toMove === null || toMove === this || (toMove instanceof AParentLayoutContainer && this.parents.indexOf(toMove) >= 0)) {
            // can't move parent into me
            return false;
          }
          const alreadyChild = this._children.indexOf(toMove) >= 0;
          if (alreadyChild) {
            this.moveChild(toMove, this.length);
          } else {
            // not a child already
            this.push(toMove);
          }
          return true;
        },
        null,
        true,
      );
    }

    if (this.options.fixed) {
      this.header.classList.add('fixed');
      this.toggleFrozenLayout();

      this.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, () => {
        this.toggleFrozenLayout();
      });
    }
  }

  canDrop(area: IDropArea) {
    return area === 'center';
  }

  place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea) {
    console.assert(area === 'center');
    return this.push(child);
  }

  protected defaultOptions(): ITabbingLayoutContainerOptions {
    return Object.assign(super.defaultOptions(), {
      active: null,
    });
  }

  get active() {
    return this._active;
  }

  set active(child: ILayoutContainer) {
    console.assert(!child || this._children.indexOf(child) >= 0);
    if (this._active === child) {
      return;
    }
    this.activeChanged(this._active, (this._active = child));
  }

  private reorderAble(reorder: HTMLElement) {
    DnDUtils.getInstance().dropAble(
      reorder,
      [ALayoutContainer.MIME_TYPE],
      (result) => {
        const id = parseInt(result.data[ALayoutContainer.MIME_TYPE], 10);
        console.assert(id >= 0);
        // find id and move it here
        const root = this.rootParent;
        const toMove = root.find(id);
        if (toMove === null || toMove === this || (toMove instanceof AParentLayoutContainer && this.parents.indexOf(toMove) >= 0)) {
          // can't move parent into me
          return false;
        }
        // next sibling = managed header
        const index = this._children.findIndex((d) => d.header === reorder.nextSibling);
        const alreadyChild = this._children.indexOf(toMove) >= 0;
        if (alreadyChild) {
          this.moveChild(toMove, index);
        } else {
          // not a child already
          this.push(toMove, index);
        }
        return true;
      },
      null,
      true,
    );
  }

  protected addedChild(child: ILayoutContainer, index: number) {
    super.addedChild(child, index);
    child.visible = child === this.active;

    child.header.onclick = () => {
      this.active = child;
    };
    this.header.insertAdjacentHTML('beforeend', TabbingLayoutContainer.TAB_REORDER);
    const reorder = <HTMLElement>this.header.lastElementChild!;
    this.reorderAble(reorder);
    if (index < 0 || index >= this.length - 1) {
      this.header.appendChild(child.header);
      const parametersHeader = this.node.ownerDocument.createElement('header');
      const s = child.node.ownerDocument.createElement('section');
      s.classList.add(LAYOUT_CONTAINER_WRAPPER);
      s.appendChild(parametersHeader);
      s.appendChild(child.node);
      this.node.appendChild(s);
    } else {
      this.header.insertBefore(child.header, this._children[index + 1].header.previousSibling);
      this.header.insertBefore(reorder, child.header);
      this.node.insertBefore(child.node, this._children[index + 1].node);
    }

    if (this.active === null) {
      this.active = child;
    }
  }

  private moveChild(child: ILayoutContainer, index: number) {
    const old = this._children.indexOf(child);
    const atEnd = index === this.length;
    if (old === index || (atEnd && old === index - 1)) {
      // already at the right position
      return;
    }
    this._children.splice(old, 1);
    if (old < index) {
      index -= 1; // since we removed it already
    }
    this._children.splice(index, 0, child);
    // update header
    const reorder = child.header.previousSibling;
    if (atEnd) {
      // reorder
      this.header.appendChild(reorder);
      this.header.appendChild(child.header);
      this.node.appendChild(child.node.parentElement);
      return;
    }
    const next = this._children[index + 1];
    this.header.insertBefore(child.header, next.header.previousSibling); // 2 extra items
    this.header.insertBefore(reorder, child.header);
    this.node.insertBefore(child.node.parentElement, next.node.parentElement);
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_TAB_REORDED), child, index);
  }

  replace(child: ILayoutContainer, replacement: ILayoutContainer) {
    const wasActive = child === this.active;
    super.replace(child, replacement);
    if (wasActive) {
      this.active = replacement;
    }
    return true;
  }

  protected takeDownChild(child: ILayoutContainer) {
    if (this.active === child) {
      const index = this._children.indexOf(child);
      this.active = this.length === 1 ? null : index === 0 ? this._children[1] : this._children[index - 1]!;
    }
    child.header.onclick = null;
    // reorder
    this.header.removeChild(child.header.previousSibling);
    this.header.removeChild(child.header);
    this.node.removeChild(child.node.parentElement);
    super.takeDownChild(child);
  }

  get minSize() {
    // max
    return <ISize>this._children.reduce(
      (a, c) => {
        const cmin = c.minSize;
        return [Math.max(a[0], cmin[0]), Math.max(a[1], cmin[1])];
      },
      [0, 0],
    );
  }

  private activeChanged(oldActive: ILayoutContainer | null, newActive: ILayoutContainer | null) {
    if (oldActive) {
      oldActive.header.classList.remove('active');
      oldActive.node.parentElement.classList.remove('active');
      oldActive.visible = false;
    }
    if (newActive) {
      newActive.header.classList.add('active');
      newActive.node.parentElement.classList.add('active');
      newActive.visible = this.visible;
    }
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHANGE_ACTIVE_TAB), oldActive, newActive);
  }

  protected visibilityChanged(visible: boolean): void {
    if (this.active) {
      this.active.visible = visible;
    }
  }

  persist() {
    return Object.assign(super.persist(), {
      type: 'tabbing',
      active: this._active ? this._children.indexOf(this._active) : null,
    });
  }

  static restore(dump: ILayoutDump, restore: (dump: ILayoutDump) => ILayoutContainer, doc: Document) {
    const r = new TabbingLayoutContainer(doc, ALayoutContainer.restoreOptions(dump));
    dump.children.forEach((d) => r.push(restore(d)));
    if (r.active != null) {
      r.active = r.children[<number>dump.active];
    }
    return r;
  }

  static derive(node: HTMLElement, derive: (node: HTMLElement) => ILayoutContainer) {
    const r = new TabbingLayoutContainer(node.ownerDocument, ALayoutContainer.deriveOptions(node));
    const children = Array.from(node.children);

    const activeIndex = children.findIndex((c: HTMLElement) => c.classList.contains('active'));

    children.forEach((c: HTMLElement) => r.push(derive(c)));
    if (activeIndex > 0) {
      r.active = r.children[activeIndex];
    }
    return r;
  }

  private toggleFrozenLayout() {
    if (this.children.length < 2) {
      // frozen layout to apply minimal style to the header and hide views
      this.header.classList.add('floating-header');
      this.header.addEventListener('mouseenter', this.mouseEnter);
      this.header.addEventListener('mouseleave', this.mouseLeave);
    } else {
      this.header.classList.remove('floating-header');
      this.header.removeEventListener('mouseenter', this.mouseEnter);
      this.header.removeEventListener('mouseleave', this.mouseLeave);
    }
  }
}
