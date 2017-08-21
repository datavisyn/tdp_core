


import {IPlugin, IPluginDesc} from 'phovea_core/src/plugin';
import IDType from 'phovea_core/src/idtype/IDType';
import ProvenanceGraph from 'phovea_core/src/provenance/ProvenanceGraph';
import {IObjectRef} from 'phovea_core/src/provenance';
import {IEventHandler} from 'phovea_core/src/event';
import Range from 'phovea_core/src/range/Range';

export enum EViewMode {
  FOCUS, CONTEXT, HIDDEN
}

export interface IViewPluginDesc extends IPluginDesc {
  selection: 'none'|'0'|'any'|'single'|'1'|'small_multiple'|'multiple'|'chooser'|'some'|'2'; //none (0), single (1), multiple (>=1),
  idtype?: string;
  load(): Promise<IViewPlugin>;
}

export interface IViewPlugin {
  readonly desc: IViewPluginDesc;
  factory(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
}

export function toViewPluginDesc(p : IPluginDesc): IViewPluginDesc {
  const r : any = p;
  r.selection = r.selection || 'none';
  return r;
}

export function matchLength(s: any, length: number) {
  switch(String(s)) {
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

export function isSameSelection(a: ISelection, b: ISelection) {
  const aNull = (a === null || a.idtype === null);
  const bNull = (b === null || b.idtype === null);
  if (aNull || bNull) {
    return aNull === bNull;
  }
  return a.idtype.id === b.idtype.id && a.range.eq(b.range);
}

export function createContext(graph:ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>):IViewContext {
  return {
    graph,
    desc: toViewPluginDesc(desc),
    ref
  };
}


export interface ISelection {
  idtype: IDType;
  range: Range;
}

export interface IViewContext {
  readonly graph: ProvenanceGraph;
  readonly desc: IViewPluginDesc;
  readonly ref: IObjectRef<any>;
}

export interface IViewClass {
  new(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
}

export interface IView extends IEventHandler {
  readonly node: HTMLElement;
  readonly idType: IDType;
  readonly itemIDType: IDType|null;

  init(params: HTMLElement, onParameterChange: (name: string, value: any)=>Promise<any>): void;

  setInputSelection(selection: ISelection): void;

  setItemSelection(selection: ISelection): void;

  getItemSelection(): ISelection;

  getParameter(name: string): any;

  setParameter(name: string, value: any): void;

  modeChanged(mode:EViewMode): void;

  destroy(): void;
}
