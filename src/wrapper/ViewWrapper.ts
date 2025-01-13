import { EventHandler, IBaseViewPluginDesc, IEvent, IEventListener } from 'visyn_core/base';
import { I18nextManager } from 'visyn_core/i18n';
import { IDType, IDTypeManager } from 'visyn_core/idtype';

import { ISelection, IView, IViewContext, IViewPluginDesc, IViewWrapperDump } from '../base/interfaces';
import { NodeUtils, ObjectNode, ObjectRefUtils, ProvenanceGraph } from '../clue/provenance';
import { Dialog } from '../components';
import { IViewProvider } from '../lineup/IViewProvider';
import { TourUtils } from '../tour/TourUtils';
import { TDPApplicationUtils } from '../utils/TDPApplicationUtils';
import { AView } from '../views/AView';
import { ViewUtils } from '../views/ViewUtils';

export class ViewWrapper extends EventHandler implements IViewProvider {
  static readonly EVENT_VIEW_INITIALIZED = 'viewInitialized';

  static readonly EVENT_VIEW_CREATED = 'viewCreated';

  static readonly EVENT_VIEW_DESTROYED = 'viewDestroyed';

  private instance: IView = null; // lazy

  private instancePromise: PromiseLike<IView> = null;

  private allowed: boolean;

  readonly node: HTMLElement;

  readonly content: HTMLElement;

  off(events: typeof ViewWrapper.EVENT_VIEW_CREATED, handler?: (event: IEvent, view: IView) => void): this;
  off(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, handler?: (event: IEvent, view: IView) => void): this;
  off(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, handler?: (event: IEvent, view: IView, viewWrapper: ViewWrapper) => void): this;
  off(events: typeof AView.EVENT_ITEM_SELECT, handler?: (event: IEvent, oldSelection: ISelection, newSelection: ISelection, name: string) => void): this;
  off(events: string | { [key: string]: IEventListener }, handler?: IEventListener) {
    return super.on(events, handler);
  }

  on(events: typeof ViewWrapper.EVENT_VIEW_CREATED, handler?: (event: IEvent, view: IView) => void): this;
  on(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, handler?: (event: IEvent, view: IView) => void): this;
  on(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, handler?: (event: IEvent, view: IView, viewWrapper: ViewWrapper) => void): this;
  on(events: typeof AView.EVENT_ITEM_SELECT, handler?: (event: IEvent, oldSelection: ISelection, newSelection: ISelection, name: string) => void): this;
  on(events: string | { [key: string]: IEventListener }, handler?: IEventListener) {
    return super.on(events, handler);
  }

  fire(events: typeof ViewWrapper.EVENT_VIEW_CREATED, view: IView, viewWrapper: ViewWrapper): this;
  fire(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, view: IView, viewWrapper: ViewWrapper): this;
  fire(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, view: IView, viewWrapper: ViewWrapper): this;
  fire(events: typeof AView.EVENT_ITEM_SELECT, oldSelection: ISelection, newSelection: ISelection, name: string): this;
  fire(events: string, ...args: any[]) {
    return super.fire(events, ...args);
  }

  /**
   * Provenance graph reference of this object
   */
  readonly ref: ObjectNode<ViewWrapper>;

  /**
   * Provenance graph context
   */
  private context: IViewContext;

  private listenerItemSelect = (_event: any, oldSelection: ISelection, newSelection: ISelection, name: string = AView.DEFAULT_SELECTION_NAME) => {
    this.fire(AView.EVENT_ITEM_SELECT, oldSelection, newSelection, name);
  };

  // caches before the instance exists but things are set
  private readonly preInstanceItemSelections = new Map<string, ISelection>();

  private readonly preInstanceParameter = new Map<string, any>();

  private readonly inputSelections = new Map<string, ISelection>();

  constructor(
    public readonly plugin: IViewPluginDesc,
    private readonly graph: ProvenanceGraph,
    document: Document,
    private readonly viewOptionGenerator: () => any = () => ({}),
  ) {
    super();

    this.preInstanceItemSelections.set(AView.DEFAULT_SELECTION_NAME, { idtype: null, ids: [] });

    this.node = document.createElement('article');
    this.node.classList.add('tdp-view-wrapper');
    this.allowed = ViewUtils.canAccess(plugin);
    this.node.innerHTML = `
    <header>
      <div class="parameters container-fluid ps-0 pe-0"></div>
    </header>
    <main></main>
    <div class="preview-image">
      <div></div>
      <span>${!this.allowed ? TDPApplicationUtils.notAllowedText(plugin.securityNotAllowedText) : this.selectionText(plugin.selection, plugin.idtype)}</span>
    </div>`;
    this.node.classList.add('view', 'disabled-view');
    this.content = <HTMLElement>this.node.querySelector('main');
    this.node.classList.toggle('not-allowed', !this.allowed);

    if (plugin.helpText) {
      this.node.insertAdjacentHTML(
        'beforeend',
        `<a href="#" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t(
          'tdp:core.ViewWrapper.showHelpLabel',
        )}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelp')}</span></a>`,
      );
      this.node.lastElementChild!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const d = Dialog.generateDialog(plugin.name, I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.close'));
        d.body.innerHTML = plugin.helpText;
        d.show();
        d.hideOnSubmit();
      });
    } else if (plugin.helpUrl) {
      if (typeof plugin.helpUrl === 'string') {
        this.node.insertAdjacentHTML(
          'beforeend',
          `<a href="${plugin.helpUrl}" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t(
            'tdp:core.ViewWrapper.showHelpLabel',
          )}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelp')}</span></a>`,
        );
      } else {
        // object version of helpUrl
        this.node.insertAdjacentHTML(
          'beforeend',
          `<a href="${plugin.helpUrl.url}" target="_blank" rel="noopener" class="view-help" title="${plugin.helpUrl.title}"><span>${plugin.helpUrl.linkText}</span></a>`,
        );
      }
    } else if (plugin.helpTourId) {
      this.node.insertAdjacentHTML(
        'beforeend',
        `<a href="#" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t(
          'tdp:core.ViewWrapper.showHelpTourLabel',
        )}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelpTour')}</span></a>`,
      );
      this.node.lastElementChild!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        TourUtils.startViewTour(plugin.helpTourId, {
          plugin,
          node: this.node,
          instance: this.instance,
          selection: this.inputSelections.get(AView.DEFAULT_SELECTION_NAME),
        });
      });
    }

    if (plugin.preview) {
      plugin.preview().then((previewImage) => {
        const image = <HTMLElement>this.node.querySelector('.preview-image > div');
        // eslint-disable-next-line @typescript-eslint/dot-notation
        image.style.backgroundImage = `url("${previewImage['default']}")`;
      });
    }

    this.ref = graph.findOrAddObject(ObjectRefUtils.objectRef(this, plugin.name, ObjectRefUtils.category.visual));
  }

  set visible(visible: boolean) {
    const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);

    if (visible) {
      this.node.removeAttribute('hidden');
    } else {
      this.node.toggleAttribute('hidden');
    }

    if (visible && this.instance == null && selection && this.match(selection)) {
      // lazy init
      this.createView(selection);
    } else {
      this.update(); // if the view was just created we don't need to call update again
    }
  }

  get visible() {
    return !this.node.hasAttribute('hidden');
  }

  /**
   * as needed for the lineup contract
   * @returns {any}
   */
  getInstance() {
    if (this.instance) {
      // lineup like I hope
      return <any>this.instance;
    }
    return null;
  }

  private createView(selection: ISelection) {
    if (!this.allowed) {
      return null;
    }
    return this.plugin.load().then((p) => {
      if (this.instance) {
        return null; // already built race condition
      }
      // create provenance reference
      this.context = ViewUtils.createContext(this.graph, this.plugin, this.ref);
      this.instance = p.factory(this.context, selection, this.content, this.viewOptionGenerator());
      this.fire(ViewWrapper.EVENT_VIEW_CREATED, this.instance, this);
      return (this.instancePromise = Promise.resolve(
        this.instance.init(<HTMLElement>this.node.querySelector('header div.parameters'), this.onParameterChange.bind(this)),
      ).then(() => {
        this.inputSelections.forEach((v, k) => {
          if (k !== AView.DEFAULT_SELECTION_NAME) {
            // already handled
            this.instance.setInputSelection(v, k);
          }
        });

        const idType = this.instance.itemIDType;
        if (idType) {
          const sel = this.preInstanceItemSelections.get(AView.DEFAULT_SELECTION_NAME);
          if (sel.idtype) {
            this.instance.setItemSelection(sel);
          } else {
            this.instance.setItemSelection({
              idtype: idType,
              ids: idType.selections(),
            });
          }
        }

        this.preInstanceItemSelections.forEach((v, k) => {
          if (k !== AView.DEFAULT_SELECTION_NAME) {
            // already handed
            this.instance.setItemSelection(v, k);
          }
        });

        this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);

        this.preInstanceParameter.forEach((value, key) => {
          this.instance.setParameter(key, value);
        });
        this.preInstanceParameter.clear();

        this.fire(ViewWrapper.EVENT_VIEW_INITIALIZED, this.instance, this);
        return this.instance;
      }));
    });
  }

  destroy() {
    if (this.instance) {
      this.destroyInstance();
    } else if (this.instancePromise) {
      this.instancePromise.then(() => this.destroyInstance());
    }
    this.node.remove();
  }

  matchesIDType(idType: IDType) {
    const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);
    if (selection) {
      return selection.idtype === idType;
    }
    const p = this.plugin;
    return (p.idtype ? new RegExp(p.idtype) : /.*/).test(idType.id);
  }

  get idType() {
    const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);
    return selection && selection.idtype ? selection.idtype : ViewWrapper.guessIDType(this.plugin); // TODO: better IDType strategy than guessIDType?
  }

  private destroyInstance() {
    this.fire(ViewWrapper.EVENT_VIEW_DESTROYED, this.instance, this);
    this.instance.destroy();
    this.content.innerHTML = '';
    (<HTMLElement>this.node.querySelector('header div.parameters')).innerHTML = '';
    this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
    this.instance = null;
    this.instancePromise = null;
  }

  private onParameterChange(name: string, value: any, previousValue: any, isInitialization: boolean) {
    if (isInitialization) {
      if (NodeUtils.createdBy(this.ref)) {
        // executing during replay
        return undefined;
      }
      return this.context.graph.pushWithResult(TDPApplicationUtils.setParameter(this.ref, name, value, previousValue), {
        inverse: TDPApplicationUtils.setParameter(this.ref, name, previousValue, value),
      });
    }
    return this.context.graph.push(TDPApplicationUtils.setParameter(this.ref, name, value, previousValue));
  }

  getParameter(name: string) {
    if (this.instance) {
      return this.instance.getParameter(name);
    }
    return this.preInstanceParameter.get(name);
  }

  setParameterImpl(name: string, value: any) {
    if (this.instance) {
      return this.instance.setParameter(name, value);
    }
    this.preInstanceParameter.set(name, value);
    return null;
  }

  /**
   * @deprecated use setInputSelection instead
   */
  setParameterSelection(selection?: ISelection) {
    return this.setInputSelection(selection);
  }

  setInputSelection(selection?: ISelection, name: string = AView.DEFAULT_SELECTION_NAME) {
    const current = this.inputSelections.get(name);
    const isDefault = name === AView.DEFAULT_SELECTION_NAME;

    if (ViewUtils.isSameSelection(current, selection)) {
      return undefined;
    }
    this.inputSelections.set(name, selection);
    if (selection && isDefault) {
      this.node.dataset.idtype = selection.idtype.id;
    }
    const matches = selection && (!isDefault || this.match(selection));
    this.node.classList.toggle('disabled-view', !this.allowed || !matches);

    if (this.instance) {
      if (matches) {
        return this.instance.setInputSelection(selection, name);
      }
      this.destroyInstance();
    } else if (this.instancePromise) {
      return this.instancePromise.then(() => {
        if (matches) {
          return this.instance.setInputSelection(selection, name);
        }
        this.destroyInstance();
        return undefined;
      });
    } else if (matches && this.visible) {
      return this.createView(selection);
    }
    return undefined;
  }

  private match(selection: ISelection) {
    return ViewUtils.matchLength(this.plugin.selection, selection.ids?.length || 0);
  }

  /**
   * @deprecated use getInputSelection instead
   */
  getParameterSelection() {
    return this.getInputSelection();
  }

  getInputSelection(name: string = AView.DEFAULT_SELECTION_NAME) {
    return this.inputSelections.get(name);
  }

  get itemIDType(): IDType | null {
    return this.instance ? this.instance.itemIDType : null;
  }

  getItemSelection(name: string = AView.DEFAULT_SELECTION_NAME): ISelection {
    if (this.instance) {
      return this.instance.getItemSelection(name);
    }
    return this.preInstanceItemSelections.get(name);
  }

  setItemSelection(sel: ISelection, name: string = AView.DEFAULT_SELECTION_NAME) {
    if (this.instance) {
      this.instancePromise.then((v) => {
        v.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
        v.setItemSelection(sel, name);
        v.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
      });
      return;
    }
    this.preInstanceItemSelections.set(name, sel);
  }

  update() {
    if (this.visible && this.instance && typeof (<any>this.instance).forceUpdate === 'function') {
      (<any>this.instance!).forceUpdate();
    }
  }

  dumpReference() {
    return this.ref.id;
  }

  dump(): IViewWrapperDump {
    return {
      hash: this.ref.hash,
      dumpReference: this.dumpReference(),
      plugin: this.plugin.id,
      parameters: [], // TODO:
    };
  }

  selectionText(selection: any, idType: string) {
    const label = idType.includes('*') || idType.includes('(') ? 'item' : IDTypeManager.getInstance().resolveIdType(idType).name;
    switch (String(selection)) {
      case '':
      case 'none':
      case '0':
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextNone', { label });
      case 'any':
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextAny', { label });
      case 'single':
      case '1':
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextOne', { label });
      case 'small_multiple':
      case 'multiple':
      case 'some':
      case 'chooser':
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextMultiple', { label });
      case '2':
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextTwo', { label });
      default:
        console.error('unknown selector: ', selection, idType);
        return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextDefault', { selection });
    }
  }

  static guessIDType(v: IBaseViewPluginDesc): IDType | null {
    return v.idtype ? (v.idtype.includes('*') ? null : IDTypeManager.getInstance().resolveIdType(v.idtype)) : null;
  }
}
