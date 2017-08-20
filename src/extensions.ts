import {IPlugin, IPluginDesc} from 'phovea_core/src/plugin';
import {IScore} from './lineup/IScore';
import IDType from 'phovea_core/src/idtype/IDType';

export const EXTENSION_POINT_TDP_SCORE = 'tdpScore';
export const EXTENSION_POINT_TDP_SCORE_LOADER = 'tdpScoreLoader';
export const EXTENSION_POINT_TDP_RANKING_BUTTON = 'tdpRankingButton';
export const EXTENSION_POINT_TDP_VIEW = 'tdpView';
//filter to disable certain views
export const EXTENSION_POINT_TDP_DISABLE_VIEW = 'disableTDPView';
// filter extensions
export const EXTENSION_POINT_TDP_LIST_FILTERS = 'tdpListFilters';

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
  factory(extraArgs: object, count: number): Promise<object>;
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
