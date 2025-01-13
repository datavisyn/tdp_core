import { AParentLayoutContainer } from './AParentLayoutContainer';
import { IBuildAbleOrViewLike, IDropArea, ILayoutContainer, ILayoutDump, IRootLayoutContainer, LayoutContainerEvents, PHOVEA_UI_IView } from '../interfaces';
import { ILayoutContainerOption } from './ALayoutContainer';
import { TabbingLayoutContainer } from './TabbingLayoutContainer';

export class RootLayoutContainer extends AParentLayoutContainer<ILayoutContainerOption> implements IRootLayoutContainer {
  readonly minChildCount = 0;

  readonly type = 'root';

  private viewDump: {
    parent: {
      viewParent: HTMLElement;
      headerParent: HTMLElement;
    };
    sibling: {
      viewSibling: HTMLElement;
      headerSibling: HTMLElement;
    };
  } | null = null;

  constructor(
    document: Document,
    public readonly build: (layout: IBuildAbleOrViewLike) => ILayoutContainer,
    private readonly restorer: (dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView) => ILayoutContainer,
  ) {
    super(document, {
      name: '',
      fixed: true,
    });
    this.node.dataset.layout = 'root';
    this.visible = true;

    this.on(LayoutContainerEvents.EVENT_MAXIMIZE, (_evt, view: ILayoutContainer) => {
      const section = this.node.ownerDocument.createElement('section');
      section.classList.add('maximized-view');

      this.viewDump = {
        parent: {
          viewParent: <HTMLElement>view.node.parentElement,
          headerParent: <HTMLElement>view.header.parentElement,
        },
        sibling: {
          viewSibling: <HTMLElement>view.node.nextElementSibling,
          headerSibling: <HTMLElement>view.header.nextElementSibling,
        },
      };

      section.appendChild(view.header);
      section.appendChild(view.node);
      this.node.insertAdjacentElement('afterbegin', section);

      view.resized();
    });

    this.on(LayoutContainerEvents.EVENT_RESTORE_SIZE, (_evt, view: ILayoutContainer) => {
      if (!this.viewDump) {
        return;
      }
      this.viewDump.parent.viewParent.insertBefore(view.node, this.viewDump.sibling.viewSibling);
      this.viewDump.parent.headerParent.insertBefore(view.header, this.viewDump.sibling.headerSibling);
      this.viewDump = null;
      this.node.querySelector('.maximized-view').remove();

      view.resized();
    });
  }

  set root(root: ILayoutContainer) {
    if (this._children.length > 0) {
      this.replace(this.root, root);
    } else {
      this.push(root);
    }
  }

  get root() {
    return this._children[0];
  }

  get minSize() {
    return this._children[0].minSize;
  }

  protected addedChild(child: ILayoutContainer, index: number) {
    super.addedChild(child, index);
    if (child instanceof TabbingLayoutContainer) {
      // need the header
      this.node.appendChild(child.header);
    }
    this.node.appendChild(child.node);
    child.visible = this.visible;
  }

  place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea) {
    return this.push(child);
  }

  protected takeDownChild(child: ILayoutContainer) {
    if (child instanceof TabbingLayoutContainer) {
      this.node.removeChild(child.header);
    }
    this.node.removeChild(child.node);
    super.takeDownChild(child);
  }

  restore(dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView) {
    console.assert(dump.type === 'root');
    this.clear();
    const children = (dump.children || []).map((d) => this.restorer(d, restoreView));
    if (children.length === 0) {
      return;
    }
    this.root = children[0];
    children.slice(1).forEach((c) => this.push(c));
  }

  persist() {
    return Object.assign(super.persist(), {
      type: 'root',
    });
  }

  static restore(dump: ILayoutDump, doc: Document, build: IBuildLayout, restorer: IRestoreLayout, restoreView: IViewRestorer) {
    const r = new RootLayoutContainer(doc, (layout) => build(r, layout), restorer);
    r.restore(dump, restoreView);
    return r;
  }
}

interface IBuildLayout {
  (root: RootLayoutContainer, layout: IBuildAbleOrViewLike): ILayoutContainer;
}
interface IViewRestorer {
  (referenceId: number): PHOVEA_UI_IView;
}
interface IRestoreLayout {
  (dump: ILayoutDump, restoreView: IViewRestorer): ILayoutContainer;
}
