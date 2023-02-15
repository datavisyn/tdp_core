import { IDType, IDTypeManager } from 'visyn_core/idtype';
import { I18nextManager } from 'visyn_core/i18n';
import { PluginRegistry } from 'visyn_core/plugin';
import { EventHandler, IEvent } from 'visyn_core/base';
import { BaseUtils, WebpackEnv } from '../base';
import { AView } from './AView';
import { ISelection, IView, IViewContext, IViewPluginDesc, EViewMode } from '../base/interfaces';
import { ViewUtils } from './ViewUtils';
import {
  BuilderUtils,
  IRootLayoutContainer,
  ISplitLayoutContainer,
  ITabbingLayoutContainer,
  IViewLayoutContainer,
  LayoutContainerEvents,
  LAYOUT_CONTAINER_WRAPPER,
  ViewBuilder,
  PHOVEA_UI_IView,
} from '../layout';

interface IElementDesc {
  key: string;
  loader: () => any;
  factory?: string;
  options?: any;
}

interface ILinkedSelection {
  fromKey: string | '_input' | '_item';
  toKey: string | '_item';
  mode: 'item' | 'input';
}

export interface ICompositeLayout {
  type: 'vsplit' | 'hsplit' | 'hstack' | 'vstack' | 'tabbing';
  keys: (string | ICompositeLayout)[];
  ratios?: number[];
}

export interface ICompositeViewPluginDesc extends IViewPluginDesc {
  elements: IElementDesc[];

  layout?: ICompositeLayout;

  linkedSelections: ILinkedSelection[];
}

export function isCompositeViewPluginDesc(desc: any): desc is ICompositeViewPluginDesc {
  return Array.isArray(desc.elements);
}

export interface IACompositeViewOptions {
  showHeaders: boolean;
}

export interface ICompositeInfo {
  key: string;

  desc: IElementDesc;

  create(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;

  options?: any;
}

export interface ICompositeSetup {
  elements: ICompositeInfo[];

  layout?: ICompositeLayout;

  linkedSelections: ILinkedSelection[];
}

function prefix(key: string, rest: string) {
  return `${key}.${rest}`;
}

function unprefix(name: string) {
  const index = name.indexOf('.');
  if (index < 0) {
    return { key: '', rest: name };
  }
  return {
    key: name.slice(0, index),
    rest: name.slice(index + 1),
  };
}

class WrapperView implements PHOVEA_UI_IView {
  private _visible = true;

  constructor(public readonly instance: IView, public readonly key: string) {}

  get minSize() {
    const given = (<any>this.instance).naturalSize;
    if (Array.isArray(given)) {
      return <[number, number]>given;
    }
    return <[number, number]>[0, 0];
  }

  createParams(hideHeader: boolean) {
    const parent = this.node.closest(`.${LAYOUT_CONTAINER_WRAPPER}`);
    const header = parent.querySelector('header');
    if (hideHeader) {
      header.innerHTML = '';
    }
    header.insertAdjacentHTML('beforeend', `<div class="parameters container-fluid ps-0 pe-0"></div>`);
    return <HTMLElement>header.lastElementChild;
  }

  get node() {
    return this.instance.node;
  }

  destroy() {
    this.instance.destroy();
  }

  get visible() {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.instance.modeChanged(value ? EViewMode.FOCUS : EViewMode.HIDDEN);
  }

  resized() {
    if (this.visible && this.instance && typeof (<any>this.instance).update === 'function' && this.node.getBoundingClientRect().width > 0) {
      (<any>this.instance!).update();
    }
  }

  dumpReference() {
    return -1;
  }
}

export class CompositeView extends EventHandler implements IView {
  public static readonly VIEW_COMPOSITE_EVENT_CHANGE_RATIOS = 'changeRatios';

  public static readonly VIEW_COMPOSITE_EVENT_SET_ACTIVE_TAB = 'setActiveTab';

  private readonly options: Readonly<IACompositeViewOptions> = {
    showHeaders: false,
  };

  private readonly root: IRootLayoutContainer;

  readonly idType: IDType;

  private setup: ICompositeSetup;

  private readonly children: WrapperView[] = [];

  private readonly childrenLookup = new Map<string, IView>();

  private readonly debounceUpdateEntryPoint = BaseUtils.debounce(() => this.fire(AView.EVENT_UPDATE_ENTRY_POINT));

  private itemSelection: ISelection;

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement, options: Partial<IACompositeViewOptions> = {}) {
    super();
    Object.assign(this.options, options);

    if (this.isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = IDTypeManager.getInstance().resolveIdType(context.desc.idtype);
    }

    this.root = BuilderUtils.root(BuilderUtils.view(I18nextManager.getInstance().i18n.t('tdp:core.views.noViews')));
    this.root.node.classList.add('tdp-view', 'composite-view');
    parent.appendChild(this.root.node);
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return this.build().then(() => Promise.all(this.initChildren(onParameterChange)));
  }

  get node() {
    return this.root.node;
  }

  private setBusy(busy: boolean) {
    this.node.classList.toggle('busy', busy);
  }

  private build() {
    this.setBusy(true);
    const updateShared = (evt: IEvent, name: string, oldValue: any, newValue: any) => {
      // If a child updates any shared parameters, notify each child except the trigger.
      this.children.forEach(({ instance }) => {
        if (evt.currentTarget !== instance) {
          instance.off(AView.EVENT_UPDATE_SHARED, updateShared);
          instance.updateShared(name, newValue);
          instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
        }
      });
      // Propagate the event upwards.
      // This is required if a CompositeView is nested in a CompositeView, because otherwise
      // the CompositeView child would "swallow" the event here. But we want to pass it "up" the chain,
      // such that we have to fire it again.
      this.fire(AView.EVENT_UPDATE_SHARED, name, oldValue, newValue);
    };

    const toParentElement = (evt: IEvent) => {
      const source = evt.currentTarget;
      const view = this.children.find(({ instance }) => instance === source);
      const layout = this.root.find((d) => d.type === 'view' && (<IViewLayoutContainer>d).view === view);
      return layout.parent;
    };

    const updateRatios = (evt: IEvent, ...ratios: number[]) => {
      const parent = toParentElement(evt);
      if (parent && parent.type === 'split') {
        (<ISplitLayoutContainer>parent).ratios = ratios;
      }
    };

    const setActiveTab = (evt: IEvent, tabKey: string) => {
      const parent = toParentElement(evt);
      const view = this.children.find(({ key }) => key === tabKey);
      const layout = this.root.find((d) => d.type === 'view' && (<IViewLayoutContainer>d).view === view);
      if (parent && parent.type === 'tabbing' && layout) {
        (<ITabbingLayoutContainer>parent).active = layout;
      }
    };

    return Promise.resolve(this.createSetup()).then((setup) => {
      this.setup = setup;

      const helper = this.node.ownerDocument.createElement('div');
      const links = setup.linkedSelections;

      let debounceItemSelection: (...args: any[]) => void;
      {
        let selection: ISelection;
        let old: ISelection;

        const debounced = BaseUtils.debounce(() => {
          this.itemSelection = selection;
          const oo = old;
          old = null;
          this.fire(AView.EVENT_ITEM_SELECT, oo, selection);
        });

        debounceItemSelection = (_evt, previous, act) => {
          selection = act;
          if (!old) {
            old = previous;
          }
          debounced();
        };
      }

      this.setup.elements.forEach((d) => {
        let s = this.selection;
        if (links.length > 0 && !links.some((l) => l.fromKey === '_input' && l.toKey === d.key)) {
          s = { idtype: this.selection.idtype, ids: [] };
        }
        // Fix for nested CompositeViews:
        // Previously, nested CompositeViews were not possible, i.e. when using a CompositeView as element of a CompositeView.
        // This is due to the fact that the context given to the children of a CompositeView is the context of the CompositeView.
        // This of course breaks when a child is a CompositeView, as it expects its "own" desc. When you give it the parent desc, it extracts
        // the children from the parent causing an infinite loop as it receives itself as child.
        // I have to admit that I do not know why we give it the desc of the CompositeView parent, and not its own.
        // The fix is to override the desc with the child desc if it is a CompositeViewDesc, such that it receives the "correct" children.
        const patchedContext = isCompositeViewPluginDesc(d.desc) ? { ...this.context, desc: d.desc } : this.context;
        const instance = d.create(patchedContext, s, helper, d.options);
        if (links.length === 0 || links.some((l) => l.fromKey === d.key && l.toKey === '_item')) {
          instance.on(AView.EVENT_ITEM_SELECT, debounceItemSelection);
        }
        instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.debounceUpdateEntryPoint);
        instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
        instance.on(CompositeView.VIEW_COMPOSITE_EVENT_CHANGE_RATIOS, updateRatios);
        instance.on(CompositeView.VIEW_COMPOSITE_EVENT_SET_ACTIVE_TAB, setActiveTab);
        this.childrenLookup.set(d.key, instance);

        this.children.push(new WrapperView(instance, d.key));
      });

      links.forEach((l) => {
        if (l.fromKey.startsWith('_') || l.toKey.startsWith('_')) {
          // handled separately
          return;
        }
        const from = this.childrenLookup.get(l.fromKey);
        const to = this.childrenLookup.get(l.toKey);
        if (!from || !to) {
          console.warn('invalid configuration, cannot find: ', from, 'or', to, 'in this setup');
          return;
        }
        from.on(AView.EVENT_ITEM_SELECT, (_, _old, selection) => {
          if (l.mode === 'item') {
            to.setItemSelection(selection);
          } else {
            to.setInputSelection(selection);
          }
        });
      });

      const resizedAfterUpdate = BaseUtils.debounce(() => this.children.forEach((c) => c.resized()));

      if (this.children.length === 1) {
        const first = this.children[0];
        this.root.root = this.root.build(BuilderUtils.view(first).name(first.key).fixed());
        this.root.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, resizedAfterUpdate);
        this.setBusy(false);
        return;
      }

      const views = new Map(this.children.map((d) => <[string, ViewBuilder]>[d.key, BuilderUtils.view(d).name(d.key).fixed()]));
      this.buildLayout(
        views,
        this.children.map((d) => d.key),
      );
      this.root.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, resizedAfterUpdate);
    });
  }

  private buildLayout(views: Map<string, ViewBuilder>, keys: string[]) {
    const buildImpl = (layout: string | ICompositeLayout) => {
      const l: string | ICompositeLayout =
        typeof layout === 'string'
          ? layout
          : {
              type: <const>'vsplit',
              ratios: keys.map(() => 1 / keys.length),
              keys,
              ...(layout || {}),
            };

      if (typeof l === 'string') {
        return views.get(l);
      }
      if (l.keys.length === 1) {
        return buildImpl(l.keys[0]);
      }
      const ratio = l.ratios;
      switch (l.type) {
        case 'hsplit':
          // eslint-disable-next-line no-case-declarations
          const firstH = buildImpl(l.keys[0]);
          // eslint-disable-next-line no-case-declarations
          const secondH = buildImpl(l.keys[1]);
          return BuilderUtils.horizontalSplit(ratio[0], firstH, secondH).fixedLayout();
        case 'hstack':
          return BuilderUtils.horizontalStackedLineUp(...l.keys.map(buildImpl)).fixedLayout();
        case 'vstack':
          return BuilderUtils.verticalStackedLineUp(...l.keys.map(buildImpl)).fixedLayout();
        case 'tabbing':
          return BuilderUtils.tabbing(...l.keys.map(buildImpl)).fixedLayout();
        // case 'vsplit':
        default: {
          const firstV = buildImpl(l.keys[0]);
          const secondV = buildImpl(l.keys[1]);
          return BuilderUtils.verticalSplit(ratio[0], firstV, secondV).fixedLayout();
        }
      }
    };

    this.root.root = this.root.build(buildImpl(this.setup.layout));
  }

  private initChildren(onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return this.children.map((wrapper) => {
      // forward prefixed
      const onChildChanged = (name, value, previousValue) => {
        return onParameterChange(prefix(wrapper.key, name), value, previousValue);
      };
      return wrapper.instance.init(wrapper.createParams(!this.options.showHeaders), onChildChanged);
    });
  }

  update() {
    if (this.root) {
      this.root.resized();
    }
  }

  get itemIDType() {
    if (this.children.length === 0 || !this.setup) {
      return null;
    }
    const link = this.setup.linkedSelections.find((d) => d.toKey === '_item');
    if (link) {
      return this.childrenLookup.get(link.fromKey).itemIDType;
    }
    // last view by default
    return this.children[this.children.length - 1].instance.itemIDType;
  }

  updateShared(name: string, value: any) {
    this.children.forEach(({ instance }) => instance.updateShared(name, value));
  }

  getParameter(name: string) {
    // check prefixed
    const { key, rest } = unprefix(name);
    const child = this.childrenLookup.get(key);
    if (child) {
      return child.getParameter(rest);
    }
    if (WebpackEnv.__DEBUG__) {
      console.warn('invalid parameter detected', name, this.context.desc);
    }
    return null;
  }

  setParameter(name: string, value: any) {
    const { key, rest } = unprefix(name);
    const child = this.childrenLookup.get(key);
    if (child) {
      return child.setParameter(rest, value);
    }
    if (WebpackEnv.__DEBUG__) {
      console.warn('invalid parameter detected', name, this.context.desc);
    }
    return undefined;
  }

  setInputSelection(selection: ISelection) {
    if (ViewUtils.isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;

    if (!this.setup) {
      return;
    }
    if (this.setup.linkedSelections.length === 0) {
      this.children.forEach(({ instance }) => instance.setInputSelection(selection));
      return;
    }

    this.setup.linkedSelections
      .filter((d) => d.fromKey === '_input')
      .forEach((d) => {
        const instance = this.childrenLookup.get(d.toKey);
        if (!instance) {
          return;
        }
        if (d.mode === 'item') {
          instance.setItemSelection(selection);
        } else {
          instance.setInputSelection(selection);
        }
      });
  }

  setItemSelection(selection: ISelection) {
    this.itemSelection = selection;
    const { itemIDType } = this;
    if (this.setup.linkedSelections.length === 0) {
      this.children.forEach(({ instance }) => {
        if (instance.itemIDType === itemIDType) {
          instance.setItemSelection(selection);
        }
      });
      return;
    }
    this.setup.linkedSelections
      .filter((d) => d.fromKey === '_item')
      .forEach((d) => {
        const instance = this.childrenLookup.get(d.toKey);
        if (!instance) {
          return;
        }
        if (d.mode === 'input') {
          instance.setInputSelection(selection);
        } else {
          instance.setItemSelection(selection);
        }
      });
  }

  getItemSelection() {
    return this.itemSelection;
  }

  modeChanged(mode: EViewMode) {
    this.children.forEach(({ instance }) => instance.modeChanged(mode));
  }

  destroy() {
    this.children.forEach(({ instance }) => instance.destroy());
    this.node.remove();
  }

  protected createSetup(): ICompositeSetup | Promise<ICompositeSetup> {
    const desc = <ICompositeViewPluginDesc>this.context.desc;

    const toEntry = (d: IElementDesc): Promise<ICompositeInfo> => {
      const descOptions = d.options || {};
      return Promise.resolve(d.loader()).then(
        (instance) =>
          <ICompositeInfo>{
            key: d.key,
            desc: d,
            options: { ...descOptions, ...this.options }, // also pass the view options from the ViewWrapper to all views
            create: PluginRegistry.getInstance().getFactoryMethod(instance, d.factory || 'create'),
          },
      );
    };

    return Promise.all((desc.elements || []).map(toEntry)).then((elements) => ({
      elements,
      layout: desc.layout,
      linkedSelections: desc.linkedSelections || [],
    }));
  }

  updateLineUpStats() {
    // propagate to all view instances, i.e lineups
    this.children.forEach((d) => {
      const i: any = d.instance;
      // semi hack for provenance graph
      if (typeof i.updateLineUpStats === 'function') {
        i.updateLineUpStats();
      }
    });
  }

  isRegex(v: string) {
    // cheap test for regex
    return v.includes('*') || v.includes('.') || v.includes('|');
  }
}
