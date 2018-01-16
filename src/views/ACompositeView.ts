import {ISplitLayoutContainer} from 'phovea_ui/src/layout';
import {EventHandler} from '../../../phovea_core/src/event';
import {defaultSelectionType, IDType, resolve} from '../../../phovea_core/src/idtype';
import {none} from '../../../phovea_core/src/range';
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
    return { key: '', rest: name};
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
  private readonly children: {key: string, instance: IView}[];
  private readonly childrenLookup = new Map<string, IView>();
  private readonly sharedParameters: Set<string>;

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
      this.propagate(instance, AView.EVENT_ITEM_SELECT, AView.EVENT_UPDATE_ENTRY_POINT);
      this.childrenLookup.set(d.key, instance);
      return {key: d.key, instance};
    });
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any)=>Promise<any>) {
    return Promise.all(this.initChildren(params, onParameterChange));
  }

  private initChildren(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any)=>Promise<any>) {
    return this.children.map(({key, instance}) => {
      // forward prefixed
      const onChildChanged = (name, value, previousValue) => {
        if (this.sharedParameters.has(name)) {
          if (this.setup.tracked) { // tracked shared parameters
            return onParameterChange(name, value, previousValue);
          }
        }
        return onParameterChange(prefix(key, name), value, previousValue);
      };
      return instance.init(params, onChildChanged);
    });
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

  setInputSelection(selection:ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;
    this.children.forEach(({instance}) => instance.setInputSelection(selection));
  }

  setItemSelection(selection: ISelection) {
    if (isSameSelection(this.itemSelection, selection)) {
      return;
    }
    const bak = this.itemSelection;
    this.itemSelection = selection;
    this.fire(AView.EVENT_ITEM_SELECT, bak, selection);
  }

  getItemSelection() {
    return this.itemSelection;
  }

  modeChanged(mode:EViewMode) {
    // hook
  }

  destroy() {
    this.node.remove();
  }

  protected abstract createSetup(): ICompositeSetup;

}

function isRegex(v: string) {
  // cheap test for regex
  return v.includes('*') || v.includes('.') || v.includes('|');
}

export default ACompositeView;
