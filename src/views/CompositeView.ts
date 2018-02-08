import {debounce} from 'lineupjs/src/utils';
import {EventHandler, IEvent} from 'phovea_core/src/event';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {getFactoryMethod} from 'phovea_core/src/plugin';
import {none} from 'phovea_core/src/range';
import {
  horizontalSplit, IRootLayoutContainer, ISplitLayoutContainer, IView as ILayoutView, root, verticalSplit,
  view
} from 'phovea_ui/src/layout';
import {horizontalStackedLineUp, IBuildAbleOrViewLike, verticalStackedLineUp} from 'phovea_ui/src/layout/builder';
import AView from './AView';
import {EViewMode, ISelection, isSameSelection, IView, IViewContext, IViewPluginDesc} from './interfaces';

interface IElementDesc {
  key: string;
  loader: () => any;
  factory?: string;
  options?: any;
}

interface ILinkedSelection{
  fromKey: string|'_input'|'_item';
  toKey: string|'_item';
  mode: 'item'|'input';
}

export interface ICompositeLayout {
  type: 'vsplit' | 'hsplit' | 'hstack' | 'vstack';
  keys: string[];
  ratios?: number[];
}

export interface ICompositeViewPluginDesc extends IViewPluginDesc {
  elements: IElementDesc[];

  layout?: ICompositeLayout;

  linkedSelections: ILinkedSelection[];
}

export interface IACompositeViewOptions {
  showHeaders: boolean;
}

declare const __DEBUG__: boolean;

export const VIEW_COMPOSITE_EVENT_CHANGE_RATIOS = 'changeRatios';


export interface ICompositeInfo {
  key: string;

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
    return {key: '', rest: name};
  }
  return {
    key: name.slice(0, index),
    rest: name.slice(index + 1)
  };
}

export default class CompositeView extends EventHandler implements IView {
  private readonly options: Readonly<IACompositeViewOptions> = {
    showHeaders: false
  };

  private readonly root: IRootLayoutContainer;

  readonly idType: IDType;

  private setup: ICompositeSetup;
  private readonly children: WrapperView[] = [];
  private readonly childrenLookup = new Map<string, IView>();

  private readonly debounceItemSelection = debounce((evt, old, selection) => {
    this.itemSelection = selection;
    this.fire(AView.EVENT_ITEM_SELECT, old, selection);
  });
  private readonly debounceUpdateEntryPoint = debounce(() => this.fire(AView.EVENT_UPDATE_ENTRY_POINT));

  private itemSelection: ISelection;

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement, options: Partial<IACompositeViewOptions> = {}) {
    super();
    Object.assign(this.options, options);

    if (isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = resolve(context.desc.idtype);
    }

    this.root = root(view('No views defined'));
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
      this.children.forEach(({instance}) => {
        if (evt.currentTarget !== instance) {
          instance.off(AView.EVENT_UPDATE_SHARED, updateShared);
          instance.updateShared(name, newValue);
          instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
        }
      });
    };

    const updateRatios = (_evt: any, ...ratios: number[]) => {
      const s = <ISplitLayoutContainer>this.root.find((d) => d.type === 'split');
      s.ratios = ratios;
    };

    return Promise.resolve(this.createSetup()).then((setup) => {
      this.setup = setup;

      const helper = this.node.ownerDocument.createElement('div');
      const links = setup.linkedSelections;

      this.setup.elements.forEach((d) => {
        let s = this.selection;
        if (links.length > 0 && !links.some((l) => l.fromKey === '_input' && l.toKey === d.key)) {
          s = {idtype: this.selection.idtype, range: none()};
        }
        const instance = d.create(this.context, s, helper, d.options);
        if (links.length === 0 || links.some((l) => l.fromKey === d.key && l.toKey === '_item')) {
          instance.on(AView.EVENT_ITEM_SELECT, this.debounceItemSelection);
        }
        instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.debounceUpdateEntryPoint);
        instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
        instance.on(VIEW_COMPOSITE_EVENT_CHANGE_RATIOS, updateRatios);
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

      const views = this.children.map((d) => {
        return view(d).name(d.key).fixed();
      });


      if (views.length === 1) {
        this.root.root = this.root.build(views[0]);
        this.setBusy(false);
        return;
      }
      let b: IBuildAbleOrViewLike;
      const ratio = this.setup.layout && this.setup.layout.ratios ? this.setup.layout.ratios[0] : 0.5;
      const type = this.setup.layout ? this.setup.layout.type || 'vsplit' : 'vsplit';
      switch (type) {
        case 'vsplit':
          b = verticalSplit(ratio, views[0], views[1]).fixed();
          break;
        case 'hsplit':
          b = horizontalSplit(ratio, views[0], views[1]).fixed();
          break;
        case 'hstack':
          b = horizontalStackedLineUp(...views).fixed();
          break;
        case 'vstack':
          b = verticalStackedLineUp(...views).fixed();
          break;
      }
      this.root.root = this.root.build(b);
      if (type.endsWith('split')) {
        const split = <ISplitLayoutContainer>this.root.root;
        views.slice(2).forEach((v) => split.push(this.root.build(v)));
      }
      this.setBusy(false);
    });
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
    this.children.forEach(({instance}) => instance.updateShared(name, value));
  }

  getParameter(name: string) {
    // check prefixed
    const {key, rest} = unprefix(name);
    const child = this.childrenLookup.get(key);
    if (child) {
      return child.getParameter(rest);
    }
    if (__DEBUG__) {
      console.warn('invalid parameter detected', name, this.context.desc);
    }
    return null;
  }

  setParameter(name: string, value: any) {
    const {key, rest} = unprefix(name);
    const child = this.childrenLookup.get(key);
    if (child) {
      return child.setParameter(rest, value);
    }
    if (__DEBUG__) {
      console.warn('invalid parameter detected', name, this.context.desc);
    }
  }

  setInputSelection(selection: ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;

    if (!this.setup) {
      return;
    }
    if (this.setup.linkedSelections.length === 0) {
      this.children.forEach(({instance}) => instance.setInputSelection(selection));
      return;
    }

    this.setup.linkedSelections.filter((d) => d.fromKey === '_input').forEach((d) => {
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
    const itemIDType = this.itemIDType;
    if (this.setup.linkedSelections.length === 0) {
      this.children.forEach(({instance}) => {
        if (instance.itemIDType === itemIDType) {
          instance.setItemSelection(selection);
        }
      });
      return;
    }
    this.setup.linkedSelections.filter((d) => d.fromKey === '_item').forEach((d) => {
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
    this.children.forEach(({instance}) => instance.modeChanged(mode));
  }

  destroy() {
    this.children.forEach(({instance}) => instance.destroy());
    this.node.remove();
  }

  protected createSetup(): ICompositeSetup | Promise<ICompositeSetup> {
    const desc = (<ICompositeViewPluginDesc>this.context.desc);

    const toEntry = (desc: IElementDesc): Promise<ICompositeInfo> => {
      return Promise.resolve(desc.loader()).then((instance) => (<ICompositeInfo>{
        key: desc.key,
        options: desc.options,
        create: getFactoryMethod(instance, desc.factory || 'create')
      }));
    };

    return Promise.all((desc.elements || []).map(toEntry)).then((elements) => ({
      elements,
      layout: desc.layout,
      linkedSelections: desc.linkedSelections || []
    }));
  }

}

class WrapperView implements ILayoutView {
  private _visible = true;

  constructor(public readonly instance: IView, public readonly key: string) {
  }

  get minSize() {
    const given = (<any>this.instance).naturalSize;
    if (Array.isArray(given)) {
      return <[number, number]>given;
    }
    return <[number, number]>[0, 0];
  }

  createParams(hideHeader: boolean) {
    const parent = this.node.closest('section');
    const header = parent.querySelector('header');
    if (hideHeader) {
      header.lastElementChild!.remove(); // remove the span
    }
    header.insertAdjacentHTML('beforeend', `<div class="parameters form-inline"></div>`);
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
    if (this.visible && this.instance && typeof (<any>this.instance).update === 'function') {
      (<any>this.instance!).update();
    }
  }

  dumpReference() {
    return -1;
  }
}

function isRegex(v: string) {
  // cheap test for regex
  return v.includes('*') || v.includes('.') || v.includes('|');
}
