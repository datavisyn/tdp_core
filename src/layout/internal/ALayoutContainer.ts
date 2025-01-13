import { EventHandler } from 'visyn_core/base';

import { DnDUtils, UniqueIdManager } from '../../app';
import { ILayoutContainer, ILayoutDump, ILayoutParentContainer, LayoutContainerEvents } from '../interfaces';
import { IParentLayoutContainer } from './IParentLayoutContainer';

export interface ILayoutContainerOption {
  name: string;
  readonly fixed: boolean;
  readonly autoWrap: boolean | string;
  /**
   * if true the user can't drag and drop view, but the separator can still be changed, i.e. it is an intermediate solution between a non-fixed and a fixed layout
   */
  fixedLayout: boolean;
}
export abstract class ALayoutContainer<T extends ILayoutContainerOption> extends EventHandler {
  static readonly MIME_TYPE = 'text/x-phovea-layout-container';

  parent: IParentLayoutContainer | null = null;

  protected readonly options: T;

  readonly header: HTMLElement;

  readonly id = UniqueIdManager.getInstance().uniqueId(ALayoutContainer.MIME_TYPE);

  private readonly keyDownListener = (evt: KeyboardEvent) => {
    if (evt.keyCode === 27) {
      // Escape
      this.toggleMaximizedView();
    }
  };

  protected isMaximized = false;

  constructor(document: Document, options: Partial<T>) {
    super();
    console.assert(document != null);
    this.options = Object.assign(this.defaultOptions(), options);

    if (this.options.fixed) {
      this.options.fixedLayout = true;
    }

    this.header = document.createElement('header');
    this.header.innerHTML = `
        <button type="button" class="btn-close float-end" ${this.options.fixed ? 'hidden' : ''} aria-label="Close"></button>
        <span>${this.name}</span>`;

    // remove
    this.header.firstElementChild.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.destroy();
    });

    // drag
    if (!this.options.fixedLayout) {
      DnDUtils.getInstance().dragAble(
        this.header,
        () => {
          return {
            effectAllowed: 'move',
            data: {
              'text/plain': this.name,
              [ALayoutContainer.MIME_TYPE]: String(this.id),
            },
          };
        },
        true,
      );
    }
  }

  get parents() {
    const r: IParentLayoutContainer[] = [];
    let p = this.parent;
    while (p !== null) {
      r.push(p);
      p = p.parent;
    }
    return r;
  }

  get hideAbleHeader() {
    return false;
  }

  get autoWrapOnDrop() {
    return this.options.autoWrap;
  }

  protected defaultOptions(): T {
    return <any>{
      name: 'View',
      fixed: false,
      hideAbleHeader: false,
      autoWrap: false,
      fixedLayout: false,
    };
  }

  destroy() {
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_DESTROYED), this);
  }

  get name() {
    return this.options.name;
  }

  set name(name: string) {
    if (this.options.name === name) {
      return;
    }
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_NAME_CHANGED), this.options.name, (this.options.name = name));
    this.updateName(name);
  }

  protected updateName(name: string) {
    this.header.children[1].textContent = name;
  }

  persist(): ILayoutDump {
    return {
      type: '',
      name: this.name,
      fixed: this.options.fixed,
      autoWrap: this.options.autoWrap,
      fixedLayout: this.options.fixedLayout,
    };
  }

  static restoreOptions(dump: ILayoutDump): Partial<ILayoutContainerOption> {
    return {
      name: dump.name,
      fixed: dump.fixed,
      autoWrap: dump.autoWrap === true,
      fixedLayout: dump.fixedLayout === true,
    };
  }

  static deriveOptions(node: HTMLElement): Partial<ILayoutContainerOption> {
    return {
      name: node.dataset.name || 'View',
      fixed: node.dataset.fixed !== undefined,
      autoWrap: node.dataset.autoWrap !== undefined,
      fixedLayout: node.dataset.fixedLayout !== undefined,
    };
  }

  find(id: number | ((container: ILayoutContainer) => boolean)) {
    return (typeof id === 'number' && this.id === id) || (typeof id === 'function' && id(<any>this)) ? this : null;
  }

  findAll(predicate: (container: ILayoutContainer) => boolean): ILayoutContainer[] {
    return predicate(<any>this) ? [<any>this] : [];
  }

  closest(id: number | ((container: ILayoutParentContainer) => boolean)) {
    if (!this.parent) {
      return null;
    }
    const { parent } = this;
    if ((typeof id === 'number' && parent.id === id) || (typeof id === 'function' && id(parent))) {
      return parent;
    }
    return parent.closest(id);
  }

  protected toggleMaximizedView() {
    const sizeToggle = <HTMLElement>this.header.querySelector('.size-toggle');
    const sizeToggleIcon = sizeToggle.querySelector('i');
    const closeButton = this.header.querySelector('.btn-close');
    this.isMaximized = !this.isMaximized;

    if (this.isMaximized) {
      closeButton.toggleAttribute('hidden');
      sizeToggle.title = 'Restore default size';
      sizeToggleIcon.classList.remove('fa-expand');
      sizeToggleIcon.classList.add('fa-compress');

      this.header.ownerDocument.addEventListener('keydown', this.keyDownListener);

      this.fire(LayoutContainerEvents.EVENT_MAXIMIZE, this);
    } else {
      if (!this.options.fixedLayout) {
        closeButton.removeAttribute('hidden');
      }

      sizeToggle.title = 'Expand view';
      sizeToggleIcon.classList.add('fa-expand');
      sizeToggleIcon.classList.remove('fa-compress');

      this.header.ownerDocument.removeEventListener('keydown', this.keyDownListener);

      this.fire(LayoutContainerEvents.EVENT_RESTORE_SIZE, this);
    }

    this.updateTitle();
  }

  protected updateTitle() {
    this.header.title = `Double click to ${this.isMaximized ? 'restore default size' : 'expand view'}`;
  }

  static withChanged(event: string) {
    return `${event}${EventHandler.MULTI_EVENT_SEPARATOR}${LayoutContainerEvents.EVENT_LAYOUT_CHANGED}`;
  }
}
