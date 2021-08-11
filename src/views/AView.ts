/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import {select} from 'd3';
import {EventHandler, IDTypeManager, IDType, Range, I18nextManager, SelectionUtils, WebpackEnv} from 'phovea_core';
import {IFormElementDesc} from '../form/interfaces';
import {FormBuilder} from '../form/FormBuilder';
import {AFormElement} from '../form/elements/AFormElement';
import {ISelection, IView, IViewContext, IAdditionalColumnDesc} from '../base/interfaces';
import {ViewUtils} from './ViewUtils';
import {ResolveUtils} from './ResolveUtils';
import {EViewMode} from '../base/interfaces';
import {IForm} from '../form/interfaces';


/**
 * base class for all views
 */
export abstract class AView extends EventHandler implements IView {
  public static readonly DEFAULT_SELECTION_NAME = "default";

  /**
   * params(oldValue: ISelection, newSelection: ISelection)
   */
  static readonly EVENT_ITEM_SELECT = ViewUtils.VIEW_EVENT_ITEM_SELECT;

  /**
   * params(oldValue: ISelection, newSelection: ISelection)
   */
  public static readonly EVENT_SORT_TRRACK = ViewUtils.TRRACK_EVENT_SORT;
  public static readonly EVENT_GROUP_TRRACK = ViewUtils.TRRACK_EVENT_GROUP;
  public static readonly EVENT_FILTER_TRRACK = ViewUtils.TRRACK_EVENT_FILTER;
  public static readonly EVENT_RENAME_TRRACK = ViewUtils.TRRACK_EVENT_RENAME;

  /**
   * params(namedSet: INamedSet)
   */
  static readonly EVENT_UPDATE_ENTRY_POINT =
    ViewUtils.VIEW_EVENT_UPDATE_ENTRY_POINT;
  /**
   * params()
   */
  static readonly EVENT_LOADING_FINISHED =
    ViewUtils.VIEW_EVENT_LOADING_FINISHED;
  /**
   * params(name: string, oldValue: any, newValue: any)
   */
  static readonly EVENT_UPDATE_SHARED = ViewUtils.VIEW_EVENT_UPDATE_SHARED;

  readonly idType: IDType;
  readonly node: HTMLElement;

  private params: IForm;
  private readonly paramsFallback = new Map<string, any>();
  private readonly shared = new Map<string, any>();
  private paramsChangeListener: (
    name: string,
    value: any,
    previousValue: any
  ) => Promise<any>;
  private readonly itemSelections = new Map<string, ISelection>();
  private readonly selections = new Map<string, ISelection>();

  constructor(
    protected readonly context: IViewContext,
    protected selection: ISelection,
    parent: HTMLElement
  ) {
    super();
    this.selections.set(AView.DEFAULT_SELECTION_NAME, selection);
    this.itemSelections.set(AView.DEFAULT_SELECTION_NAME, {
      idtype: null,
      range: Range.none(),
    });

    this.node = parent.ownerDocument.createElement("div");
    this.node.classList.add("tdp-view");
    parent.appendChild(this.node);
    if (this.isRegex(context.desc.idtype)) {
      this.idType = selection.idtype;
    } else {
      this.idType = IDTypeManager.getInstance().resolveIdType(
        context.desc.idtype
      );
    }
  }

  /**
   * helper to marks this view busy showing a loading icon
   * @param {boolean} value
   * @param {boolean|string} busyMessage optional loading message hint
   */
  protected setBusy(value: boolean, busyMessage?: string | boolean) {
    this.node.classList.toggle("tdp-busy", value);
    if (!value || !busyMessage) {
      delete this.node.dataset.busy;
    } else if (busyMessage) {
      this.node.dataset.busy =
        typeof busyMessage === "string"
          ? busyMessage
          : I18nextManager.getInstance().i18n.t("tdp:core.views.busyMessage");
    }
  }

  protected setHint(
    visible: boolean,
    hintMessage?: string,
    hintCSSClass = "hint"
  ) {
    const conditionalData = this.selection.idtype
      ? { name: this.selection.idtype.name }
      : { context: "unknown" };
    const defaultHintMessage = I18nextManager.getInstance().i18n.t(
      "tdp:core.views.defaultHint",
      { ...conditionalData }
    );
    this.node.classList.toggle(`tdp-${hintCSSClass}`, visible);
    if (!visible) {
      delete this.node.dataset.hint;
    } else {
      this.node.dataset.hint = hintMessage ? hintMessage : defaultHintMessage;
    }
  }

  protected setNoMappingFoundHint(visible: boolean, hintMessage?: string) {
    const conditionalData = {
      ...(this.selection.idtype
        ? { name: this.selection.idtype.name }
        : { context: "unknown" }),
      id: this.idType ? this.idType.name : "",
    };
    return this.setHint(
      visible,
      hintMessage ||
        I18nextManager.getInstance().i18n.t(
          "tdp:core.views.noMappingFoundHint",
          { ...conditionalData }
        ),
      "hint-mapping"
    );
  }

  /*final*/
  async init(
    params: HTMLElement,
    onParameterChange: (
      name: string,
      value: any,
      previousValue: any
    ) => Promise<any>
  ): Promise<any> {
    this.params = await this.buildParameterForm(params, onParameterChange);
    return this.initImpl();
  }

  /**
   * hook for custom initialization
   */
  protected initImpl() {
    // hook
    return null;
  }

  private buildParameterForm(
    params: HTMLElement,
    onParameterChange: (
      name: string,
      value: any,
      previousValue: any
    ) => Promise<any>
  ): Promise<IForm> {
    const builder = new FormBuilder(select(params), undefined, "form-inline");

    //work on a local copy since we change it by adding an onChange handler
    const descs = this.getParameterFormDescs().map((d) => Object.assign({}, d));

    const onInit: (
      name: string,
      value: any,
      previousValue: any,
      isInitialzation: boolean
    ) => void = <any>onParameterChange;

    // map FormElement change function to provenance graph onChange function
    descs.forEach((p) => {
      p.onChange = (formElement, value, _data, previousValue) =>
        onParameterChange(formElement.id, value, previousValue);

      if (onInit) {
        p.onInit = (formElement, value, _data, previousValue) =>
          onInit(formElement.id, value, previousValue, true);
      }
    });
    this.paramsChangeListener = onParameterChange;

    builder.appendElements(descs);

    return builder.build();
  }

  /**
   * return a list of FormBuilder element descriptions to build the parameter form
   * @returns {IFormElementDesc[]}
   */
  protected getParameterFormDescs(): IFormElementDesc[] {
    // hook
    return [];
  }

  getItemSelectionNames() {
    return Array.from(this.itemSelections.keys());
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
      if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
        console.warn(
          "invalid parameter detected use fallback",
          name,
          this.context.desc
        );
      }
      return this.paramsFallback.has(name)
        ? this.paramsFallback.get(name)
        : null;
    }
    const v = elem.value;

    return v === null ? "" : v;
  }

  protected getParameterData(name: string): any {
    const value = this.getParameter(name);
    return AFormElement.toData(value);
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
      if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
        console.warn(
          "invalid parameter detected use fallback",
          name,
          this.context.desc
        );
      }
      this.paramsFallback.set(name, value);
    } else {
      elem.value = value;
    }
    return this.parameterChanged(name);
  }

  setSortTrrack(
    rid: number,
    columns: { asc: boolean; col: string }[],
    isSorting: boolean
  ) {
    console.log("this shouldnt happen");
  }

  setGroupTrrack(rid: number, columns: string[]) {
    console.log("this shouldnt happen");
  }

  setFilterTrrack(
    column: string,
    rid: number,
    value: string | string[] | null,
    isRegExp: boolean,
    filterMissing: boolean
  ) {
    console.log("this shouldnt happen");
  }

  setMetadataTrrack(
    column: string,
    rid: number,
    label: string,
    summary: string,
    description: string
  ) {
    console.log("this shouldnt happen");
  }

  getColumns(): Promise<IAdditionalColumnDesc[] | void> {
    console.log("shouldnt occur")
    return Promise.resolve();
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

  setInputSelection(
    selection: ISelection,
    name: string = AView.DEFAULT_SELECTION_NAME
  ) {
    const current = this.selections.get(name);
    if (current && ViewUtils.isSameSelection(current, selection)) {
      return;
    }
    this.selections.set(name, selection);
    if (name === AView.DEFAULT_SELECTION_NAME) {
      this.selection = selection;
    }
    return this.selectionChanged(name);
  }

  protected getInputSelection(name: string = AView.DEFAULT_SELECTION_NAME) {
    return this.selections.get(name);
  }

  protected getInputSelectionNames() {
    return Array.from(this.selections.keys());
  }

  /**
   * hook triggerd when the input selection has changed
   */
  protected selectionChanged(_name: string = AView.DEFAULT_SELECTION_NAME) {
    // hook
  }

  get itemIDType() {
    return this.getItemSelection()!.idtype;
  }

  /**
   * resolve the id of the current input selection
   * @returns {Promise<string[]>}
   */
  protected resolveSelection(idType = this.idType): Promise<string[]> {
    return ResolveUtils.resolveIds(
      this.selection.idtype,
      this.selection.range,
      idType
    );
  }

  /**
   * resolve the name of the current input selection
   * @returns {Promise<string[]>}
   */
  protected resolveSelectionByName(idType = this.idType): Promise<string[]> {
    return ResolveUtils.resolveNames(
      this.selection.idtype,
      this.selection.range,
      idType
    );
  }

  /**
   * resolve the ids of the current input selection to all 1:n related names, not just the first one like `resolveSelection` does
   * @returns {Promise<string[]>}
   */
  protected resolveMultipleSelections(
    idType = this.idType
  ): Promise<string[][]> {
    return ResolveUtils.resolveAllIds(
      this.selection.idtype,
      this.selection.range,
      idType
    );
  }

  /**
   * resolve the names of the current input selection to all 1:n related names, not just the first one like `resolveSelectionByName` does
   * @returns {Promise<string[]>}
   */
  protected resolveMultipleSelectionsByName(
    idType = this.idType
  ): Promise<string[][]> {
    return ResolveUtils.resolveAllNames(
      this.selection.idtype,
      this.selection.range,
      idType
    );
  }

  setItemSelection(
    selection: ISelection,
    name: string = AView.DEFAULT_SELECTION_NAME
  ) {
    const current = this.itemSelections.get(name);
    if (current && ViewUtils.isSameSelection(current, selection)) {
      return;
    }
    const wasEmpty =
      current == null || current.idtype == null || current.range.isNone;
    this.itemSelections.set(name, selection);
    // propagate
    if (selection.idtype) {
      if (name === AView.DEFAULT_SELECTION_NAME) {
        if (selection.range.isNone) {
          selection.idtype.clear(SelectionUtils.defaultSelectionType);
        } else {
          selection.idtype.select(selection.range);
        }
      } else {
        if (selection.range.isNone) {
          selection.idtype.clear(name);
        } else {
          selection.idtype.select(name, selection.range);
        }
      }
    }
    const isEmpty =
      selection == null || selection.idtype == null || selection.range.isNone;
    if (!(wasEmpty && isEmpty)) {
      // the selection has changed when we really have some new values not just another empty one
      this.itemSelectionChanged(name);
    }
    this.fire(AView.EVENT_ITEM_SELECT, current, selection, name);
  }

  /**
   * hook when the item selection has changed
   */
  protected itemSelectionChanged(_name: string = AView.DEFAULT_SELECTION_NAME) {
    // hook
  }

  getItemSelection(name: string = AView.DEFAULT_SELECTION_NAME) {
    return (
      this.itemSelections.get(name) || { idtype: null, range: Range.none() }
    );
  }

  modeChanged(mode: EViewMode) {
    // hook
  }

  destroy() {
    this.node.remove();
  }

  isRegex(v: string) {
    // cheap test for regex
    return v.includes("*") || v.includes(".") || v.includes("|");
  }
}

