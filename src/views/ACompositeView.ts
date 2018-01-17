import {debounce} from 'lineupjs/src/utils';
import {EventHandler, IEvent} from 'phovea_core/src/event';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {none} from 'phovea_core/src/range';
import {
  IRootLayoutContainer, ISplitLayoutContainer, IView as ILayoutView, root, verticalSplit,
  view
} from 'phovea_ui/src/layout';
import AView from './AView';
import {EViewMode, ISelection, isSameSelection, IView, IViewClass, IViewContext} from './interfaces';

export interface IACompositeViewOptions {
  showHeaders: boolean;
}

declare const __DEBUG__: boolean;

export const VIEW_COMPOSITE_EVENT_CHANGE_RATIOS = 'changeRatios';


export interface ICompositeInfo {
  key: string;
  clazz: IViewClass;
  options?: any;
}

export interface ICompositeSetup {
  elements: ICompositeInfo[];

  layout?: {
    type: 'vsplit',
    keys: string[];
    ratios?: number[];
  };
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

export abstract class ACompositeView extends EventHandler implements IView {
  private readonly options: Readonly<IACompositeViewOptions> = {
    showHeaders: false
  };

  private readonly root: IRootLayoutContainer;

  readonly idType: IDType;

  private readonly setup: ICompositeSetup;
  private readonly children: WrapperView[];
  private readonly childrenLookup = new Map<string, IView>();

  private readonly debounceItemSelection = debounce((...args) => this.fire(AView.EVENT_ITEM_SELECT, ...args.slice(1)));
  private readonly debounceUpdateEntryPoint = debounce(() => this.fire(AView.EVENT_UPDATE_ENTRY_POINT));

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement, options: Partial<IACompositeViewOptions> = {}) {
    super();
    Object.assign(this.options, options);
    const helper = parent.ownerDocument.createElement('div');

    if (isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = resolve(context.desc.idtype);
    }

    this.setup = this.createSetup();

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

    this.children = this.setup.elements.map((d) => {
      const instance = new d.clazz(context, selection, helper, d.options);
      instance.on(AView.EVENT_ITEM_SELECT, this.debounceItemSelection);
      instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.debounceUpdateEntryPoint);
      instance.on(AView.EVENT_UPDATE_SHARED, updateShared);
      instance.on(VIEW_COMPOSITE_EVENT_CHANGE_RATIOS, updateRatios);
      this.childrenLookup.set(d.key, instance);

      return new WrapperView(instance, d.key);
    });
    const views = this.children.map((d) => {
      const v = view(d).name(d.key).fixed();
      if (!this.options.showHeaders) {
        v.hideHeader();
      }
      return v;
    });

    if (views.length === 1) {
      this.root = root(views[0]);
    } else {
      this.root = root(verticalSplit(this.setup.layout.ratios[0], views[0], views[1]).fixed());
      const split = <ISplitLayoutContainer>this.root.root;
      views.slice(2).forEach((v) => split.push(this.root.build(v)));
    }

    this.root.node.classList.add('tdp-view', 'composite-view');
    parent.appendChild(this.root.node);
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return Promise.all(this.initChildren(params, onParameterChange));
  }

  get node() {
    return this.root.node;
  }

  private initChildren(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return this.children.map(({key, instance}) => {
      // forward prefixed
      const onChildChanged = (name, value, previousValue) => {
        return onParameterChange(prefix(key, name), value, previousValue);
      };
      return instance.init(params, onChildChanged);
    });
  }

  get itemIDType() {
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
    this.children.forEach(({instance}) => instance.setInputSelection(selection));
  }

  setItemSelection(selection: ISelection) {
    const itemIDType = this.itemIDType;
    this.children.forEach(({instance}) => {
      if (instance.itemIDType === itemIDType) {
        instance.setItemSelection(selection);
      }
    });
  }

  getItemSelection() {
    const itemIDType = this.itemIDType;
    const child = this.children.find(({instance}) => instance.itemIDType === itemIDType);
    return child ? child.instance.getItemSelection() : {idtype: this.itemIDType, range: none()};
  }

  modeChanged(mode: EViewMode) {
    this.children.forEach(({instance}) => instance.modeChanged(mode));
  }

  destroy() {
    this.children.forEach(({instance}) => instance.destroy());
    this.node.remove();
  }

  protected abstract createSetup(): ICompositeSetup;

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

export default ACompositeView;
