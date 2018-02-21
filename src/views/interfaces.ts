import {IPlugin, IPluginDesc} from 'phovea_core/src/plugin';
import IDType from 'phovea_core/src/idtype/IDType';
import ProvenanceGraph from 'phovea_core/src/provenance/ProvenanceGraph';
import {IObjectRef} from 'phovea_core/src/provenance';
import {IEventHandler} from 'phovea_core/src/event';
import Range from 'phovea_core/src/range/Range';
import {IUser} from 'phovea_core/src/security';

/**
 * mode of the view depending on the view state
 */
export enum EViewMode {
  FOCUS, CONTEXT, HIDDEN
}

export interface IViewPluginDesc extends IPluginDesc {
  /**
   * how many selection this view can handle and requires
   */
  selection: 'none' | '0' | 'any' | 'single' | '1' | 'small_multiple' | 'multiple' | 'chooser' | 'some' | '2';
  /**
   * idType regex that is required by this view
   */
  idtype?: string;

  load(): Promise<IViewPlugin>;

  /**
   * view group hint
   */
  group: {name: string, order: number};

  /**
   * optional preview callback function returning a url promise, the preview image should have 320x180 px
   * @returns {Promise<string>}
   */
  preview?(): Promise<string>;

  /**
   * optional security check to show only certain views
   */
  security?: string|((user: IUser)=>boolean);

  /**
   * a lot of topics/tags describing this view
   */
  topics?: string[];

  /**
   * a link to an external help page
   */
  helpUrl?: string;
  /**
   * as an alternative an help text shown as pop up
   */
  helpText?: string;
}

export interface IViewPlugin {
  readonly desc: IViewPluginDesc;

  /**
   * factory for building a view
   * @param {IViewContext} context view context
   * @param {ISelection} selection the current input selection
   * @param {HTMLElement} parent parent dom element
   * @param options additional options
   * @returns {IView}
   */
  factory(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
}

export function toViewPluginDesc(p: IPluginDesc): IViewPluginDesc {
  const r: any = p;
  r.selection = r.selection || 'none';
  r.group = Object.assign({name: 'Other', order: 99}, r.group);

  // common typo
  if (r.idType !== undefined) {
    r.idtype = r.idType;
  }
  return r;
}

export function matchLength(s: any, length: number) {
  switch (String(s)) {
    case '':
    case 'none':
    case '0':
      return length === 0;
    case 'any':
      return true;
    case 'single':
    case '1':
    case 'small_multiple':
      return length === 1;
    case 'multiple':
    case 'chooser':
    case 'some':
      return length >= 1;
    case '2':
      return length === 2;
    default:
      return false;
  }
}

/**
 * whether the view should be used as small multiple in case of multiple selections
 * @param desc
 * @returns {boolean}
 */
export function showAsSmallMultiple(desc: any) {
  return desc.selection === 'small_multiple';
}

/**
 * whether the view is going to use a chooser for multiple selections
 * @param desc
 * @returns {boolean}
 */
export function willShowChooser(desc: any) {
  return desc.selection === 'chooser';
}

/**
 * compares two selections and return true if they are the same
 * @param {ISelection} a
 * @param {ISelection} b
 * @returns {boolean}
 */
export function isSameSelection(a: ISelection, b: ISelection): boolean {
  const aNull = (a == null || a.idtype == null);
  const bNull = (b == null || b.idtype == null);
  if (aNull || bNull) {
    return aNull === bNull;
  }
  const base = a.idtype.id === b.idtype.id && a.range.eq(b.range);
  if (!base) {
    return false;
  }
  const aAllSize = a.all ? a.all.size : 0;
  const bAllSize = b.all ? b.all.size : 0;
  if (aAllSize !== bAllSize) {
    return;
  }
  if (aAllSize === 0) {
    return true;
  }
  // same size but not empty check entries
  return Array.from(a.all!.entries()).every(([key, value]) => {
    const other = b.all.get(key);
    if (!other) {
      return false;
    }
    return value.eq(other);
  });
}

export function createContext(graph: ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>): IViewContext {
  return {
    graph,
    desc: toViewPluginDesc(desc),
    ref
  };
}

export interface ISelection {
  readonly idtype: IDType;
  readonly range: Range;

  /**
   * other selections floating around in a multi selection environment
   */
  readonly all?: Map<IDType, Range>;
}

export interface IViewContext {
  readonly graph: ProvenanceGraph;
  readonly desc: IViewPluginDesc;
  readonly ref: IObjectRef<any>;
}

export interface IViewClass {
  new(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
}

/**
 * event when one or more elements are selected for the next level
 * @type {string}
 * @argument selection {ISelection}
 */
export const VIEW_EVENT_ITEM_SELECT = 'select';
export const VIEW_EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';
export const VIEW_EVENT_LOADING_FINISHED = 'loadingFinished';
export const VIEW_EVENT_UPDATE_SHARED = 'updateShared';

export interface IView extends IEventHandler {
  /**
   * the node of this view
   */
  readonly node: HTMLElement;
  /**
   * the id type required for the input selection
   */
  readonly idType: IDType;
  /**
   * the id type of the shown items
   */
  readonly itemIDType: IDType | null;

  /**
   * optional natural size used when stacking the view on top of each other
   */
  readonly naturalSize?: [number, number]|'auto';

  /**
   * initialized this view
   * @param {HTMLElement} params place to put parameter forms
   * @param {(name: string, value: any, previousValue: any) => Promise<any>} onParameterChange instead of directly setting the parameter this method should be used to track the changes
   */
  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => PromiseLike<any>): PromiseLike<any>|undefined;

  /**
   * changes the input selection as given to the constructor of this class
   * @param {ISelection} selection
   */
  setInputSelection(selection: ISelection): void;

  /**
   * sets the selection of the items within this view
   * @param {ISelection} selection
   */
  setItemSelection(selection: ISelection): void;

  /**
   * returns the current item selection
   * @returns {ISelection}
   */
  getItemSelection(): ISelection;

  /**
   * return the current parameter value for the given name
   * @param {string} name parameter name
   * @returns {any}
   */
  getParameter(name: string): any | null;

  /**
   * sets the parameter within this view
   * @param {string} name
   * @param value
   */
  setParameter(name: string, value: any): void;

  /**
   * updates a shared value among different linked views
   * @param {string} name
   * @param value
   */
  updateShared(name: string, value: any): void;

  /**
   * notify the view that its view mode has changed
   * @param {EViewMode} mode
   */
  modeChanged(mode: EViewMode): void;

  /**
   * destroys this view
   */
  destroy(): void;
}
