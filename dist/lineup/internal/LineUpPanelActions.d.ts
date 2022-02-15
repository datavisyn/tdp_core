import { SidePanel, LocalDataProvider, IColumnDesc, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer } from 'lineupjs';
import { IARankingViewOptions } from '../IARankingViewOptions';
import { IAdditionalColumnDesc } from '../../base/interfaces';
import { EventHandler, IPluginDesc } from '../../base';
import { IDType } from '../../idtype';
export declare function findMappablePlugins(target: IDType, all: IPluginDesc[]): any[] | Promise<IPluginDesc[]>;
export declare class LineUpPanelActions extends EventHandler {
    protected readonly provider: LocalDataProvider;
    private readonly options;
    static readonly EVENT_ZOOM_OUT = "zoomOut";
    static readonly EVENT_ZOOM_IN = "zoomIn";
    static readonly EVENT_OPEN_VIS = "openVis";
    static readonly EVENT_TOGGLE_OVERVIEW = "toggleOverview";
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
    updateChooser(idType: IDType, descs: IAdditionalColumnDesc[] | IColumnDesc[]): Promise<void>;
    private groupColumnDescs;
    private groupedDialog;
    private buildMetaDataDescriptions;
    private scoreColumnDialog;
}
//# sourceMappingURL=LineUpPanelActions.d.ts.map