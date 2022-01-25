import { EngineRenderer, LocalDataProvider, TaggleRenderer } from 'lineupjs';
import { AView } from '../views/AView';
import { IViewContext, ISelection } from '../base/interfaces';
import { EViewMode } from '../base/interfaces';
import { LineUpSelectionHelper } from './internal/LineUpSelectionHelper';
import { IScore, IAdditionalColumnDesc } from '../base/interfaces';
import { IInitialRankingOptions } from './desc';
import { IRankingWrapper } from './IRankingWrapper';
import { IRow, IServerColumn, IServerColumnDesc } from '../base/rest';
import { ISelectionAdapter } from './selection/ISelectionAdapter';
import { ILazyLoadedColumn } from './internal/column';
import { IARankingViewOptions } from './IARankingViewOptions';
/**
 * base class for views based on LineUp
 * There is also AEmbeddedRanking to display simple rankings with LineUp.
 */
export declare abstract class ARankingView extends AView {
    /**
     * Stores the ranking data when collapsing columns on modeChange()
     * @type {any}
     */
    private dump;
    readonly naturalSize: number[];
    /**
     * DOM element for LineUp stats in parameter UI
     */
    private readonly stats;
    readonly provider: LocalDataProvider;
    private readonly taggle;
    readonly selectionHelper: LineUpSelectionHelper;
    private readonly panel;
    private readonly generalVis;
    /**
     * clears and rebuilds this lineup instance from scratch
     * @returns {Promise<any[]>} promise when done
     */
    protected rebuild: (...args: any[]) => void;
    /**
     * similar to rebuild but just loads new data and keep the columns
     * @returns {Promise<any[]>} promise when done
     */
    protected reloadData: (...args: any[]) => void;
    /**
     * updates the list of available columns in the side panel
     */
    protected updatePanelChooser: (...args: any[]) => void;
    /**
     * promise resolved when everything is built
     * @type {any}
     */
    protected built: Promise<any>;
    private readonly colors;
    protected readonly options: Readonly<IARankingViewOptions>;
    private readonly selectionAdapter;
    /**
     * Creates a RankingView with the given selection.
     * Can be wrapped with a ViewWrapper.
     *
     * @remarks You need to call init() to actually display the Ranking View.
     *
     * @param context with provenance graph to store the executed operations
     * @param selection The Ids and IdType of the selection
     * @param parent where to put the ranking view
     * @param options to configure the ranking view
     */
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IARankingViewOptions>);
    /**
     * @param params Seperate element that displays the "Showing x of y ..." message
     * @param onParameterChange eventlistener for content changes
     */
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<void>;
    update(): void;
    /**
     * Returns the LineUp/Taggle instance of this ranking
     */
    getTaggle(): EngineRenderer | TaggleRenderer;
    /**
     * create the selection adapter used to map input selections to LineUp columns
     * @default no columns are created
     * @returns {ISelectionAdapter}
     */
    protected createSelectionAdapter(): ISelectionAdapter;
    /**
     * custom initialization function at the build will be called
     */
    protected initImpl(): Promise<void>;
    /**
     * return the idType of the shown items in LineUp
     * @returns {IDType}
     */
    get itemIDType(): import("../idtype").IDType;
    protected parameterChanged(name: string): PromiseLike<any> | void;
    protected itemSelectionChanged(): PromiseLike<any> | void;
    protected selectionChanged(): PromiseLike<any> | void;
    private createContext;
    /**
     * Expand/collapse certain columns on mode change.
     * Expand = focus view
     * Collapse = context view
     * @param mode
     */
    modeChanged(mode: EViewMode): void;
    private saveNamedSet;
    private addColumn;
    private addScoreColumn;
    protected reloadScores(visibleOnly?: boolean): Promise<any[]>;
    protected withoutTracking<T>(f: () => T): Promise<T>;
    /**
     * used by commands to trigger adding a tracked score
     * @param {IScore<any>} score
     * @returns {Promise<{col: Column; loaded: Promise<Column>}>}
     */
    addTrackedScoreColumn(score: IScore<any>, position?: number): ILazyLoadedColumn;
    private pushTrackedScoreColumn;
    /**
     * used by commands to remove a tracked score again
     * @param {string} columnId
     * @returns {Promise<boolean>}
     */
    removeTrackedScoreColumn(columnId: string): Promise<boolean>;
    /**
     * load the table description from the server
     * @returns {Promise<IServerColumnDesc>} the column descriptions
     */
    protected abstract loadColumnDesc(): Promise<IServerColumnDesc>;
    /**
     * load the rows of LineUp
     * @returns {Promise<IRow[]>} the rows at least containing the represented ids
     */
    protected abstract loadRows(): Promise<IRow[]>;
    /**
     * generates the column descriptions based on the given server columns by default they are mapped
     * @param {IServerColumn[]} columns
     * @returns {IAdditionalColumnDesc[]}
     */
    protected getColumnDescs(columns: IServerColumn[]): IAdditionalColumnDesc[];
    private getColumns;
    private build;
    protected builtLineUp(lineup: LocalDataProvider): void;
    protected createInitialRanking(lineup: LocalDataProvider, options?: Partial<IInitialRankingOptions>): void;
    protected customizeRanking(ranking: IRankingWrapper): void;
    protected setLineUpData(rows: IRow[]): void;
    private reloadDataImpl;
    private rebuildImpl;
    /**
     * Writes the number of total, selected and shown items in the parameter area
     */
    updateLineUpStats(): void;
    /**
     * removes alls data from lineup and resets it
     */
    protected clear(): Promise<void>;
}
//# sourceMappingURL=ARankingView.d.ts.map