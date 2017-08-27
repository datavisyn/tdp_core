/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import {IDType, resolve, defaultSelectionType} from 'phovea_core/src/idtype';
import {none} from 'phovea_core/src/range';
import {EventHandler} from 'phovea_core/src/event';
import {EViewMode, ISelection, isSameSelection, IView, IViewContext, VIEW_EVENT_ITEM_SELECT} from './interfaces';
import {IFormElementDesc} from '../form';
import FormBuilder from '../form/FormBuilder';
import {select} from 'd3';
import {resolveIds} from './resolve';
import {toData} from 'tdp_core/src/form/internal/AFormElement';

declare const __DEBUG__;
export {resolveIds, resolveId, resolveIdToNames} from './resolve';

/**
 * base class for all views
 */
export abstract class AView extends EventHandler implements IView {

  static readonly EVENT_ITEM_SELECT = VIEW_EVENT_ITEM_SELECT;
  static readonly EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';

  static readonly EVENT_LOADING_FINISHED = 'loadingFinished';

  readonly idType: IDType;
  readonly node: HTMLElement;

  private params: FormBuilder;
  private itemSelection: ISelection = { idtype: null, range: none() };

  constructor(protected readonly context: IViewContext, protected selection: ISelection, parent: HTMLElement) {
    super();
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tdp-view');
    parent.appendChild(this.node);
    this.idType = resolve(context.desc.idtype);
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

  /*final*/ init(params: HTMLElement, onParameterChange: (name: string, value: any)=>Promise<any>) {
    this.params = this.buildParameterForm(params, onParameterChange);
    this.initImpl();
  }

  /**
   * hook for custom initialization
   */
  protected initImpl() {
    // hook
  }

  private buildParameterForm(params: HTMLElement, onParameterChange: (name: string, value: any)=>Promise<any>) {
    const builder = new FormBuilder(select(params));

    const descs = this.getParameterFormDescs();
    // map FormElement change function to provenance graph onChange function
    descs.forEach((p) => {
      p.onChange = (formElement, value) => onParameterChange(formElement.id, value);
    });

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
  /*final*/ getParameter(name: string): any {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (__DEBUG__) {
        console.warn('invalid parameter detected', name, this.context.desc);
      }
      return null;
    }
    const v = elem.value;

    return v === null ? '' : v;
  }

  protected getParameterData(name: string): any {
    const value = this.getParameter(name);
    return toData(value);
  }

  /*final*/ setParameter(name: string, value: any) {
    const elem = this.getParameterElement(name);
    if (!elem) {
      if (__DEBUG__) {
        console.warn('invalid parameter detected', name, this.context.desc);
      }
      return;
    }
    elem.value = value;
    this.parameterChanged(name);
  }

  /**
   * hook triggerd when the parameter has changed
   * @param {string} _name the name of the parameter
   */
  protected parameterChanged(_name: string) {
    // hook
  }

  setInputSelection(selection:ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }
    this.selection = selection;
    this.selectionChanged();
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

  modeChanged(mode:EViewMode) {
    // hook
  }

  destroy() {
    this.node.remove();
  }
}

export default AView;
