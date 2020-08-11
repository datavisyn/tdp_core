export declare const EXTENSION_POINT_TDP_SCORE = "tdpScore";
export declare const EXTENSION_POINT_TDP_SCORE_IMPL = "tdpScoreImpl";
export declare const EXTENSION_POINT_TDP_SCORE_LOADER = "tdpScoreLoader";
export declare const EXTENSION_POINT_TDP_RANKING_BUTTON = "tdpRankingButton";
export declare const EXTENSION_POINT_TDP_VIEW = "tdpView";
export declare const EXTENSION_POINT_TDP_INSTANT_VIEW = "tdpInstantView";
export declare const EXTENSION_POINT_TDP_APP_EXTENSION = "tdpAppExtension";
export declare const EXTENSION_POINT_TDP_LIST_FILTERS = "tdpListFilters";
export declare const EXTENSION_POINT_TDP_VIEW_GROUPS = "tdpViewGroups";
/**
 * Register a new tab to the LineupSidePanel.
 * Consists of a button/header to open the tab content and the tab content itself
 */
export declare const EP_TDP_CORE_LINEUP_PANEL_TAB = "epTdpCoreLineupPanelTab";
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
export declare const EP_TDP_CORE_FORM_ELEMENT = "epTdpCoreFormElement";
export declare const EP_TDP_CORE_SCORE_COLUMN_PATCHER = "epTdpCoreScoreColumnPatcher";