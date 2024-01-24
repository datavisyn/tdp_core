import { ILayoutDump, ISize, PHOVEA_UI_IView, IViewLayoutContainer, LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
import { Dropper } from './Dropper';

export interface IViewLayoutContainerOptions extends ILayoutContainerOption {
  hideHeader: boolean;
}

export class HTMLView implements PHOVEA_UI_IView {
  readonly minSize: ISize = [0, 0];

  visible = true;

  readonly node: HTMLElement;

  constructor(html: string, doc: Document) {
    // HTML
    this.node = doc.createElement('div');
    this.node.innerHTML = html;
  }

  destroy() {
    // nothing to do
  }

  resized() {
    // nothing to do
  }

  dumpReference() {
    return -1;
  }
}

export class NodeView implements PHOVEA_UI_IView {
  readonly minSize: ISize = [0, 0];

  visible = true;

  constructor(public readonly node: HTMLElement) {}

  destroy() {
    // nothing to do
  }

  resized() {
    // nothing to do
  }

  dumpReference() {
    return -1;
  }
}

export class ViewLayoutContainer extends ALayoutContainer<IViewLayoutContainerOptions> implements IViewLayoutContainer {
  readonly node: HTMLElement;

  readonly type = 'view';

  constructor(
    public readonly view: PHOVEA_UI_IView,
    options: Partial<ILayoutContainerOption>,
  ) {
    super(view.node.ownerDocument, options);
    this.node = view.node.ownerDocument.createElement('article');
    this.node.dataset.layout = 'view';
    this.node.appendChild(view.node);

    // TODO: The expand view is broken currently, therefore we hide it temporarily.
    this.header.insertAdjacentHTML(
      'beforeend',
      `<button type="button" title="Expand view" class="size-toggle invisible" aria-label="Toggle View Size"><span><i class="fas fa-expand"></i></span></button>`,
    );

    const min = this.minSize;
    if (min[0] > 0) {
      view.node.style.minWidth = `${min[0]}px`;
    }
    if (min[1] > 0) {
      view.node.style.minHeight = `${min[1]}px`;
    }

    if (!this.options.fixedLayout) {
      Dropper.dropViews(this.node, this);
    }

    this.updateTitle();

    this.header.querySelector('.size-toggle').addEventListener('click', () => this.toggleMaximizedView());
    this.header.addEventListener('dblclick', () => this.toggleMaximizedView());
  }

  protected defaultOptions() {
    return Object.assign(super.defaultOptions(), {
      hideHeader: false,
    });
  }

  get hideAbleHeader() {
    return this.options.hideHeader;
  }

  get visible() {
    return this.view.visible;
  }

  set visible(visible: boolean) {
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_VISIBILITY_CHANGED), this.view.visible, (this.view.visible = visible));
  }

  get minSize() {
    return this.view.minSize ? this.view.minSize : <[number, number]>[0, 0];
  }

  resized() {
    if (this.view.resized) {
      this.view.resized();
    }
  }

  destroy() {
    super.destroy();
    if (this.parent) {
      this.parent.remove(this);
    }
    this.view.destroy();
  }

  persist() {
    const r: ILayoutDump = Object.assign(super.persist(), {
      type: 'view',
    });
    if (this.view instanceof HTMLView) {
      r.html = this.view.node.innerHTML;
    } else {
      r.view = this.view.dumpReference();
    }
    return r;
  }

  static restore(dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView, doc: Document) {
    const view = dump.html ? new HTMLView(dump.html, doc) : restoreView(dump.view);
    return new ViewLayoutContainer(view, ALayoutContainer.restoreOptions(dump));
  }

  static derive(view: PHOVEA_UI_IView) {
    return new ViewLayoutContainer(view, ALayoutContainer.deriveOptions(view.node));
  }
}
