import {IPlugin, IPluginDesc} from 'phovea_core/src/plugin';
import {IUser} from 'phovea_core/src/security';
import {IObjectRef, ProvenanceGraph} from 'phovea_core/src/provenance';
import Range from 'phovea_core/src/range/Range';
import {IEventHandler} from 'phovea_core/src/event';
import {IScore} from './lineup';
import {RangeLike} from 'phovea_core/src/range';
import {IDType} from 'phovea_core/src/idtype';
import {IColumnDesc} from 'lineupjs';
import {EViewMode} from './views/interfaces';
import {AppHeader} from 'phovea_ui/src/header';

export const EXTENSION_POINT_TDP_SCORE = 'tdpScore';
export const EXTENSION_POINT_TDP_SCORE_IMPL = 'tdpScoreImpl';
export const EXTENSION_POINT_TDP_SCORE_LOADER = 'tdpScoreLoader';
export const EXTENSION_POINT_TDP_RANKING_BUTTON = 'tdpRankingButton';
export const EXTENSION_POINT_TDP_VIEW = 'tdpView';
export const EXTENSION_POINT_TDP_INSTANT_VIEW = 'tdpInstantView';
export const EXTENSION_POINT_TDP_APP_EXTENSION = 'tdpAppExtension';
// filter extensions
export const EXTENSION_POINT_TDP_LIST_FILTERS = 'tdpListFilters';
export const EXTENSION_POINT_TDP_VIEW_GROUPS = 'tdpViewGroups';

/**
 * a score item
 */
export interface IScoreRow<T> {
  /**
   * id of this row to match this row with the existing ones
   */
  readonly id: string;
  /**
   * value
   */
  score: T;
}

export interface IScore<T> {
  /**
   * the idType of score rows this score produces
   */
  readonly idType: IDType;

  /**
   * creates the LineUp column description
   * @returns {IColumnDesc & {[p: string]: any}}
   */
  createDesc(extras?: object): IColumnDesc & {[key: string]: any};


  /**
   * start the computation of the score for the given ids
   * @param {RangeLike} ids the currently visible ids
   * @param {IDType} idtype of this idtype
   * @param {Object} extras extra arguments
   * @returns {Promise<IScoreRow<T>[]>} the scores
   */
  compute(ids: RangeLike, idtype: IDType, extras?: object): Promise<IScoreRow<T>[]>;
}

/**
 * generic argument for score params
 */
export interface IScoreParam {
  [key: string]: any;
}

export interface IScoreLoader {
  /**
   * unique id of this loader
   */
  readonly id: string;
  /**
   * name for the entry
   */
  readonly text: string;
  /**
   * id of the score implementation plugin
   */
  readonly scoreId: string;

  /**
   * @param extraArgs
   * @param count the current count of visible rows
   * @returns {Promise<any>} a promise of the score params
   */
  factory(extraArgs: object, count: number): Promise<IScoreParam>;
}

export interface IScoreLoaderExtension {
  factory(desc: IPluginDesc, extraArgs: object): Promise<IScoreLoader[]>;
}

export interface IScoreLoaderExtensionDesc extends IPluginDesc {
  idtype: string;

  load(): Promise<IPlugin & IScoreLoaderExtension>;
}

export interface IRankingButtonExtension {
  desc: IRankingButtonExtensionDesc;
  factory(desc: IRankingButtonExtensionDesc, idType: IDType, extraArgs: object): Promise<IScoreParam>;
}

export interface IRankingButtonExtensionDesc extends IPluginDesc {
  cssClass: string;

  load(): Promise<IPlugin & IRankingButtonExtension>;
}

/**
 * additional meta data about
 */
export interface IGroupData {
  name: string;
  label?: string;
  description?: string;
  collapsed?: boolean;
  order: number;
  members?: string[];
}


/**
 * helper extension point for grouping views and provide meta data
 */
export interface IViewGroupExtensionDesc extends IPluginDesc {
  groups: IGroupData[];
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


export interface IViewClass {
  new(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
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

  /**
   * optional help text when the user is not allowed to see this view, if false (default) the view won't be shown, if a text or true it will be just greyed out
   * @default false
   */
  securityNotAllowedText?: string | boolean;
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

export interface IInstantView {
  readonly node: HTMLElement;

  destroy(): void;
}

export interface IInstantViewOptions {
  document: Document;
}

export interface IItemSelection extends ISelection {
  readonly items: {_id: number, id: string, text: string}[];
}

export interface IInstanceViewExtension {
  desc: IInstanceViewExtensionDesc;
  factory(selection: IItemSelection, options: Readonly<IInstantViewOptions>): IInstantView;
}

export interface IInstanceViewExtensionDesc extends IPluginDesc {
  /**
   * idType regex that is required by this view
   */
  idtype?: string;

  load(): Promise<IPlugin & IInstanceViewExtension>;
}

export interface IAppExtensionContext {
  header: AppHeader;
  content: HTMLElement;
  main: HTMLElement;
  /**
   * the tdp app itself, any since no common subset is available
   */
  app: any;
}

export interface IAppExtensionExtension {
  desc: IAppExtensionExtensionDesc;
  factory(context: IAppExtensionContext): void;
}

export interface IAppExtensionExtensionDesc extends IPluginDesc {

  load(): Promise<IPlugin & IAppExtensionExtension>;
}
