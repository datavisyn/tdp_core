import type { IPluginDesc, IPlugin } from './plugin';
import type { ProvenanceGraph } from '../clue/provenance';

export const EXTENSION_POINT_TDP_SCORE = 'tdpScore';
export const EXTENSION_POINT_TDP_SCORE_IMPL = 'tdpScoreImpl';
export const EXTENSION_POINT_TDP_SCORE_LOADER = 'tdpScoreLoader';
export const EXTENSION_POINT_TDP_RANKING_BUTTON = 'tdpRankingButton';
export const EXTENSION_POINT_TDP_VIEW = 'tdpView';
export const EXTENSION_POINT_VISYN_VIEW = 'visynView';
export const EXTENSION_POINT_TDP_INSTANT_VIEW = 'tdpInstantView';
export const EXTENSION_POINT_TDP_APP_EXTENSION = 'tdpAppExtension';
// filter extensions
export const EXTENSION_POINT_TDP_LIST_FILTERS = 'tdpListFilters';
export const EXTENSION_POINT_TDP_VIEW_GROUPS = 'tdpViewGroups';

/**
 * Register a new tab to the LineupSidePanel.
 * Consists of a button/header to open the tab content and the tab content itself
 */
export const EP_TDP_CORE_LINEUP_PANEL_TAB = 'epTdpCoreLineupPanelTab';

/**
 * Register new form elements for the form builder. Form elements must implement the `IFormElement`.
 *
 * @registryParam {object} [parameter] The registry parameter depend on the form element. Hence, all defined parameters are passed to the form element as `pluginDesc`.
 *
 * @factoryParam {Form} form The form this element is a part of
 * @factoryParam {IFormElementDesc} elementDesc The form element description from the form builder
 * @factoryParam {IPluginDesc} pluginDesc The phovea extension point options
 * @factoryReturns {IFormElement} An instance of the form element
 */
export const EP_TDP_CORE_FORM_ELEMENT = 'epTdpCoreFormElement';

/**
 * Provides the loaded provenance graph
 *
 * @factoryParam {ProvenanceGraph} provenanceGraph The loaded provenance graph
 */
export const EP_PHOVEA_CLUE_PROVENANCE_GRAPH = 'epPhoveaClueProvenanceGraph';

export interface IProvenanceGraphEP {
  factory(graph: ProvenanceGraph): void;
}

export interface IProvenanceGraphEPDesc extends IPluginDesc {
  load(): Promise<IPlugin & IProvenanceGraphEP>;
}

/* phovea_security_flask */
export const EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM = 'securityCustomizedLoginForm';

export interface ICustomizedLoginFormPluginDesc extends IPluginDesc {
  template?: string;
}

export interface ICustomizedLoginFormPlugin extends IPlugin {
  /**
   * underlying plugin description
   */
  readonly desc: ICustomizedLoginFormPluginDesc;

  factory(loginMenu: HTMLElement, loginDialog: HTMLElement): void;
}
