import {ISplitLayoutContainer} from 'phovea_ui/src/layout';
import {EventHandler} from 'phovea_core/src/event';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {none} from 'phovea_core/src/range';
import {debounce} from 'lineupjs/src/utils';
import AView from './AView';
import {EViewMode, ISelection, isSameSelection, IView, IViewClass, IViewContext} from './interfaces';

export interface IACompositeViewOptions {

}

declare const __DEBUG__: boolean;


export interface ICompositeInfo {
  key: string;
  clazz: IViewClass;
  options?: any;
}

export interface ICompositeSetup {
  elements: ICompositeInfo[];
  sharedParameters?: string[];
  tracked?: boolean;

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
  private readonly options: Readonly<IACompositeViewOptions> = {};

  private readonly split: ISplitLayoutContainer;

  readonly idType: IDType;
  readonly node: HTMLElement;

  private readonly setup: ICompositeSetup;
  private readonly children: { key: string, instance: IView }[];
  private readonly childrenLookup = new Map<string, IView>();
  private readonly sharedParameters: Set<string>;

  private readonly debounceItemSelection = debounce((...args) => this.fire(AView.EVENT_ITEM_SELECT, ...args.slice(1)));
  private readonly debounceUpdateEntryPoint = debounce(() => this.fire(AView.EVENT_UPDATE_ENTRY_POINT));

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement, options: Partial<IACompositeViewOptions> = {}) {
    super();
    Object.assign(this.options, options);
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tdp-view', 'composite-view');
    parent.appendChild(this.node);
    if (isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = resolve(context.desc.idtype);
    }

    this.setup = this.createSetup();

    this.sharedParameters = new Set(this.setup.sharedParameters);

    this.children = this.setup.elements.map((d) => {
      const instance = new d.clazz(context, selection, this.node, d.options);
      instance.on(AView.EVENT_ITEM_SELECT, this.debounceItemSelection);
      instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.debounceUpdateEntryPoint);
      this.childrenLookup.set(d.key, instance);
      return {key: d.key, instance};
    });
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return Promise.all(this.initChildren(params, onParameterChange));
  }

  private initChildren(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return this.children.map(({key, instance}) => {
      // forward prefixed
      const onChildChanged = (name, value, previousValue) => {
        if (!this.sharedParameters.has(name)) {
          return onParameterChange(prefix(key, name), value, previousValue);
        }
        this.children.forEach((child) => {
          if (child.key !== key) {
            child.instance.setParameter(name, value);
          }
        });
        if (this.setup.tracked) { // tracked shared parameters
          return onParameterChange(name, value, previousValue);
        }
      };
      return instance.init(params, onChildChanged);
    });
  }

  get itemIDType() {
    // last view by default
    return this.children[this.children.length - 1].instance.itemIDType;
  }

  getParameter(name: string) {
    if (this.sharedParameters.has(name)) {
      // should matter which child since synced
      return this.children[0].instance.getParameter(name);
    }
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
    if (this.sharedParameters.has(name)) {
      // set to all children
      this.children.map((d) => d.instance.setParameter(name, value));
    }
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

function isRegex(v: string) {
  // cheap test for regex
  return v.includes('*') || v.includes('.') || v.includes('|');
}

export default ACompositeView;
