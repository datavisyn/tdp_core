/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import {IDType, resolve, defaultSelectionType} from 'phovea_core/src/idtype';
import {none} from 'phovea_core/src/range';
import {EventHandler} from 'phovea_core/src/event';
import {EViewMode, ISelection, isSameSelection, IView, IViewContext} from './interfaces';
import {IFormElementDesc} from '../form';
import FormBuilder from '../form/FormBuilder';
import {select} from 'd3';
import {resolveIds} from './resolve';

declare const __DEBUG__;
export {resolveIds, resolveId, resolveIdToNames} from './resolve';

export abstract class AView extends EventHandler implements IView {
  /**
   * event when one or more elements are selected for the next level
   * @type {string}
   * @argument selection {ISelection}
   */
  static readonly EVENT_ITEM_SELECT = 'select';
  static readonly EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';
  /**
   * event is fired when the loading of the iframe has finished
   * @type {string}
   * @argument selection {ISelection}
   */
  static readonly EVENT_LOADING_FINISHED = 'loadingFinished';

  private itemSelection: ISelection = { idtype: null, range: none() };
  readonly idType: IDType;
  readonly node: HTMLElement;
  private params: FormBuilder;

  constructor(public readonly context:IViewContext, protected selection: ISelection, parent:HTMLElement) {
    super();
    this.node = parent.ownerDocument.createElement('div');
    this.node.innerHTML = `<div class="busy hidden"></div>`;
    this.idType = resolve(context.desc.idtype);
  }

  protected setBusy(busy: boolean) {
    const node = <HTMLElement>this.node.querySelector('div.busy');
    if (!node) {
      return;
    }
    if (busy) {
      node.classList.remove('hidden');
    } else {
      node.classList.add('hidden');
    }
  }

  /*final*/ init(params: HTMLElement, onParameterChange: (name: string, value: any)=>Promise<any>) {
    this.params = this.buildParameterForm(params, onParameterChange);
    this.initImpl();
  }

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

  protected getParameterFormDescs(): IFormElementDesc[] {
    // hook
    return [];
  }

  protected getParameterElement(id: string) {
    return this.params.getElementById(id);
  }

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

  protected selectionChanged() {
    // hook
  }

  get itemIDType() {
    return this.itemSelection.idtype;
  }

  protected resolveSelection(): Promise<string[]> {
    return resolveIds(this.selection.idtype, this.selection.range, this.idType);
  }

  setItemSelection(selection: ISelection) {
    if (isSameSelection(this.itemSelection, selection)) {
      return;
    }
    // propagate
    if (selection.idtype) {
      if (selection.range.isNone) {
        selection.idtype.clear(defaultSelectionType);
      } else {
        selection.idtype.select(selection.range);
      }
    }
    this.fire(AView.EVENT_ITEM_SELECT, this.itemSelection, this.itemSelection = selection);
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
