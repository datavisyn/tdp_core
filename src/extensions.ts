import {IPlugin, IPluginDesc} from 'phovea_core/src/plugin';
import {IScore} from './lineup';
import {RangeLike} from 'phovea_core/src/range';
import {IDType} from 'phovea_core/src/idtype';
import {IColumnDesc} from 'lineupjs/src/model';

export const EXTENSION_POINT_TDP_SCORE = 'tdpScore';
export const EXTENSION_POINT_TDP_SCORE_IMPL = 'tdpScoreImpl';
export const EXTENSION_POINT_TDP_SCORE_LOADER = 'tdpScoreLoader';
export const EXTENSION_POINT_TDP_RANKING_BUTTON = 'tdpRankingButton';
export const EXTENSION_POINT_TDP_VIEW = 'tdpView';
// filter extensions
export const EXTENSION_POINT_TDP_LIST_FILTERS = 'tdpListFilters';

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
  createDesc(): IColumnDesc & {[key: string]: any};


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
  factory(desc: IRankingButtonExtensionDesc, idType: IDType, extraArgs: object): Promise<IScore<any>>;
}

export interface IRankingButtonExtensionDesc extends IPluginDesc {
  cssClass: string;

  load(): Promise<IPlugin & IRankingButtonExtension>;
}
