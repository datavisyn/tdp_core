import { SidePanel, LocalDataProvider, IColumnDesc, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer } from 'lineupjs';
import { IDType, IPlugin, IPluginDesc, EventHandler } from 'phovea_core';
import { IARankingViewOptions } from '../IARankingViewOptions';
import { PanelTab } from './panel/PanelTab';
export interface IPanelTabExtension {
    desc: IPanelTabExtensionDesc;
    /**
     * Create and attach a new LineUp side panel
     * @param tab PanelTab instance to attach the HTMLElement and listen to events
     * @param provider The data of the current ranking
     * @param desc The phovea extension point description
     */
    factory(desc: IPanelTabExtensionDesc, tab: PanelTab, provider: LocalDataProvider): void;
}
export interface IPanelTabExtensionDesc extends IPluginDesc {
    /**
     * CSS class for the PanelNavButton of the PanelTab
     */
    cssClass: string;
    /**
     * Title attribute PanelNavButton
     */
    title: string;
    /**
     * Customize the PanelNavButtons' position (recommended to use multiples of 10)
     */
    order: number;
    /**
     * Width of the PanelTab
     */
    width: string;
    /**
     * If true a shortcut button is appended to the SidePanel header in collapsed mode
     * @default false
     */
    shortcut?: boolean;
    load(): Promise<IPlugin & IPanelTabExtension>;
}
export declare class LineUpPanelActions extends EventHandler {
    protected readonly provider: LocalDataProvider;
    private readonly options;
    static readonly EVENT_ZOOM_OUT = "zoomOut";
    static readonly EVENT_ZOOM_IN = "zoomIn";
    static readonly EVENT_RULE_CHANGED = "ruleChanged";
    static readonly EVENT_SAVE_NAMED_SET = "saveNamedSet";
    /**
     * @deprecated
     */
    static readonly EVENT_ADD_SCORE_COLUMN = "addScoreColumn";
    /**
     * (scoreName: string, scoreId: string, params: object) => void
     * @type {string}
     */
    static readonly EVENT_ADD_TRACKED_SCORE_COLUMN = "addTrackedScoreColumn";
    static readonly rule: import("lineupjs").IRule;
    private idType;
    private readonly searchBoxProvider;
    readonly panel: SidePanel | null;
    readonly node: HTMLElement;
    private readonly header;
    private readonly tabContainer;
    private overview;
    private wasCollapsed;
    constructor(provider: LocalDataProvider, ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext, options: Readonly<IARankingViewOptions>, doc?: Document);
    forceCollapse(): void;
    releaseForce(): void;
    get collapse(): boolean;
    set collapse(value: boolean);
    hide(): void;
    show(): void;
    private get isTopMode();
    get wasHidden(): boolean;
    private init;
    setViolation(violation?: string): void;
    private appendExtraButtons;
    private appendExtraTabs;
    private resolveArgs;
    private getColumnDescription;
    private addColumn;
    private resolveScores;
    updateChooser(idType: IDType, descs: IColumnDesc[]): Promise<void>;
    private groupedDialog;
    private buildMetaDataDescriptions;
    private scoreColumnDialog;
}
