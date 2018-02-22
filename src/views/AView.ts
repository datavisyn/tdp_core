/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import {select} from 'd3';
import {EventHandler} from 'phovea_core/src/event';
import {defaultSelectionType, IDType, resolve} from 'phovea_core/src/idtype';
import {none} from 'phovea_core/src/range';
import {IFormElementDesc} from '../form';
import FormBuilder from '../form/FormBuilder';
import {toData} from '../form/internal/AFormElement';
import {
  EViewMode, ISelection, isSameSelection, IView, IViewContext, VIEW_EVENT_ITEM_SELECT,
  VIEW_EVENT_LOADING_FINISHED, VIEW_EVENT_UPDATE_ENTRY_POINT, VIEW_EVENT_UPDATE_SHARED
} from './interfaces';
import {resolveIds} from './resolve';
import {IFormSerializedElement} from '../form/interfaces';

declare const __DEBUG__;
export {resolveIds, resolveId, resolveIdToNames} from './resolve';

/**
 * base class for all views
 */
export abstract class AView extends EventHandler implements IView {

  /**
   * params(oldValue: ISelection, newSelection: ISelection)
   */
  static readonly EVENT_ITEM_SELECT = VIEW_EVENT_ITEM_SELECT;
  /**
   * params(namedSet: INamedSet)
   */
  static readonly EVENT_UPDATE_ENTRY_POINT = VIEW_EVENT_UPDATE_ENTRY_POINT;
  /**
   * params()
   */
  static readonly EVENT_LOADING_FINISHED = VIEW_EVENT_LOADING_FINISHED;
  /**
   * params(name: string, oldValue: any, newValue: any)
   */
  static readonly EVENT_UPDATE_SHARED = VIEW_EVENT_UPDATE_SHARED;


  readonly idType: IDType;
  readonly node: HTMLElement;

  private params: FormBuilder;
  private readonly paramsFallback = new Map<string, any>();
  private readonly shared = new Map<string, any>();
  private paramsChangeListener: ((name: string, value: any, previousValue: any) => Promise<any>);
  private itemSelection: ISelection = {idtype: null, range: none()};

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement) {
    super();
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tdp-view');
    parent.appendChild(this.node);
    if (isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = resolve(context.desc.idtype);
    }
  }

  /**
   * helper to marks this view busy showing a loading icon
   * @param {boolean} busy
   */
  protected setBusy(busy: boolean) {
    if (busy) {
      this.node.classList.add('busy');
    } else {
      this.node.classList.remove('busy');
    }
  }

  /*final*/
  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    this.params = this.buildParameterForm(params, onParameterChange);
    return this.initImpl();
  }

  /**
   * hook for custom initialization
   */
  protected initImpl() {
    // hook
    return null;
  }

  private buildParameterForm(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    const builder = new FormBuilder(select(params));

    //work on a local copy since we change it by adding an onChange handler
    const descs = this.getParameterFormDescs().map((d) => Object.assign({}, d));

    // map FormElement change function to provenance graph onChange function
    descs.forEach((p) => {
      p.onChange = (formElement, value, data, previousValue) => onParameterChange(formElement.id, value, previousValue);
    });
    this.paramsChangeListener = onParameterChange;

    builder.build(descs);

    return builder;
  }

  /**
   * return a list of FormBuilder element descriptions to build the parameter form
   * @returns {IFormElementDesc[]}
   */
  protected getParameterFormDescs(): IFormElementDesc[] {
    // hook
    return [];
  }

  /**
   * finds the element form element based on the given id
   * @param {string} id
   * @returns {IFormElement}
   */
  protected getParameterElement(id: string) {
    return this.params.getElementById(id);
  }

  /**
   * returns the value of the given parameter
   */

  /*final*/
  getParameter(name: string): any {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (__DEBUG__ && this.params.length > 0) {
        console.warn('invalid parameter detected use fallback', name, this.context.desc);
      }
      return this.paramsFallback.has(name) ? this.paramsFallback.get(name) : null;
    }
    const v = elem.value;

    return v === null ? '' : v;
  }

  protected getParameterData(name: string): any {
    const value = this.getParameter(name);
    return toData(value);
  }

  protected async changeParameter(name: string, value: any) {
    const old = this.getParameter(name);
    if (old === value) {
      return;
    }
    await this.paramsChangeListener(name, value, old);
    await this.setParameter(name, value);
  }

  /*final*/
  setParameter(name: string, value: any) {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (__DEBUG__ && this.params.length > 0) {
        console.warn('invalid parameter detected use fallback', name, this.context.desc);
      }
      this.paramsFallback.set(name, value);
    } else {
      elem.value = value;
    }
    return this.parameterChanged(name);
  }

  updateShared(name: string, value: any) {
    if (this.shared.has(name) && this.shared.get(name) === value) {
      return;
    }
    const old = this.shared.get(name);
    this.shared.set(name, value);
    this.sharedChanged(name);
    this.fire(AView.EVENT_UPDATE_SHARED, name, old, value);
  }

  protected sharedChanged(_name: string) {
    // hook
  }

  protected getShared(name: string) {
    return this.shared.get(name);
  }

  /**
   * hook triggerd when the parameter has changed
   * @param {string} _name the name of the parameter
   */
  protected parameterChanged(_name: string) {
    // hook
  }

  getAllParameters():IFormSerializedElement[] {
    // hook
    return this.params.getSerializedElements();
  }

  setInputSelection(selection: ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;
    return this.selectionChanged();
  }

  /**
   * hook triggerd when the input selection has changed
   */
  protected selectionChanged() {
    // hook
  }

  get itemIDType() {
    return this.itemSelection.idtype;
  }

  /**
   * resolve the name of the current input selection
   * @returns {Promise<string[]>}
   */
  protected resolveSelection(): Promise<string[]> {
    return resolveIds(this.selection.idtype, this.selection.range, this.idType);
  }

  setItemSelection(selection: ISelection) {
    if (isSameSelection(this.itemSelection, selection)) {
      return;
    }
    const bak = this.itemSelection;
    this.itemSelection = selection;
    // propagate
    if (selection.idtype) {
      if (selection.range.isNone) {
        selection.idtype.clear(defaultSelectionType);
      } else {
        selection.idtype.select(selection.range);
      }
    }
    this.itemSelectionChanged();
    this.fire(AView.EVENT_ITEM_SELECT, bak, selection);
  }

  /**
   * hook when the item selection has changed
   */
  protected itemSelectionChanged() {
    // hook
  }

  getItemSelection() {
    return this.itemSelection;
  }

  modeChanged(mode: EViewMode) {
    // hook
  }

  destroy() {
    this.node.remove();
  }
}

export default AView;

function isRegex(v: string) {
  // cheap test for regex
  return v.includes('*') || v.includes('.') || v.includes('|');
}
