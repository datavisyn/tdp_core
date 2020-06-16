
import {EngineRenderer, defaultOptions, IRule, IGroupData, IGroupItem, isGroup, Column, IColumnDesc, LocalDataProvider, deriveColors, TaggleRenderer, ITaggleOptions, spaceFillingRule, updateLodRules} from 'lineupjs';
import {AView} from '../views/AView';
import {IViewContext, ISelection} from '../base/interfaces';
import {EViewMode} from '../base/interfaces';
import {IDTypeManager, BaseUtils, ISecureItem, I18nextManager} from 'phovea_core';
import {LineupTrackingManager} from './internal/cmds';
import {RestStorageUtils} from '../storage';
import {ErrorAlertHandler} from '../base/ErrorAlertHandler';
import {LineUpSelectionHelper} from './internal/LineUpSelectionHelper';
import {IScore, IScoreRow, IAdditionalColumnDesc} from '../base/interfaces';
import {ColumnDescUtils, IInitialRankingOptions, IColumnOptions} from './desc';
import {IRankingWrapper} from './IRankingWrapper';
import {ScoreUtils} from './internal/ScoreUtils';
import {LineUpColors} from './internal/LineUpColors';
import {IRow, IServerColumn, IServerColumnDesc} from '../base/rest';
import {IContext, ISelectionAdapter, ISelectionColumn} from './selection/ISelectionAdapter';
import {LineUpPanelActions} from './internal/LineUpPanelActions';
import {LazyColumn, ILazyLoadedColumn} from './internal/column';
import {NotificationHandler} from '../base/NotificationHandler';
import {IARankingViewOptions} from './IARankingViewOptions';
import {LineupUtils} from './utils';
/**
 * base class for views based on LineUp
 * There is also AEmbeddedRanking to display simple rankings with LineUp.
 */
export abstract class ARankingView extends AView {

  /**
   * Stores the ranking data when collapsing columns on modeChange()
   * @type {any}
   */
  private dump: Set<string> = null;

  readonly naturalSize = [800, 500];

  /**
   * DOM element for LineUp stats in parameter UI
   */
  private readonly stats: HTMLElement;

  private readonly provider: LocalDataProvider;
  private readonly taggle: EngineRenderer | TaggleRenderer;
  private readonly selectionHelper: LineUpSelectionHelper;
  private readonly panel: LineUpPanelActions;

  /**
   * clears and rebuilds this lineup instance from scratch
   * @returns {Promise<any[]>} promise when done
   */
  protected rebuild = BaseUtils.debounce(() => this.rebuildImpl(), 100);

  /**
   * similar to rebuild but just loads new data and keep the columns
   * @returns {Promise<any[]>} promise when done
   */
  protected reloadData = BaseUtils.debounce(() => this.reloadDataImpl(), 100);

  /**
   * updates the list of available columns in the side panel
   */
  protected updatePanelChooser = BaseUtils.debounce(() => this.panel.updateChooser(this.itemIDType, this.provider.getColumns()), 100);

  /**
   * promise resolved when everything is built
   * @type {any}
   */
  protected built: Promise<any> = null;

  private readonly colors = new LineUpColors();

  protected readonly options: Readonly<IARankingViewOptions> = {
    itemName: 'item',
    itemNamePlural: 'items',
    itemRowHeight: null,
    itemIDType: null,
    additionalScoreParameter: null,
    additionalComputeScoreParameter: null,
    subType: {key: '', value: ''},
    enableOverviewMode: true,
    enableZoom: true,
    enableDownload: true,
    enableSaveRanking: true,
    enableAddingColumns: true,
    enableAddingColumnGrouping: false,
    enableAddingSupportColumns: true,
    enableAddingCombiningColumns: true,
    enableAddingScoreColumns: true,
    enableAddingPreviousColumns: true,
    enableAddingDatabaseColumns: true,
    enableAddingMetaDataColumns: true,
    enableSidePanelCollapsing: true,
    enableSidePanel: 'collapsed',
    enableHeaderSummary: true,
    enableStripedBackground: false,
    enableHeaderRotation: false,
    customOptions: {},
    customProviderOptions: {
      maxNestedSortingCriteria: Infinity,
      maxGroupColumns: Infinity,
      filterGlobally: true
    }
  };

  private readonly selectionAdapter: ISelectionAdapter | null;

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
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent);

    // variants for deriving the item name
    const idTypeNames = options.itemIDType ? {
      itemName: IDTypeManager.getInstance().resolveIdType(options.itemIDType).name,
      itemNamePlural: IDTypeManager.getInstance().resolveIdType(options.itemIDType).name
    } : {};
    const names = options.itemName ? {itemNamePlural: typeof options.itemName === 'function' ? () => `${(<any>options.itemName)()}s` : `${options.itemName}s`} : {};
    BaseUtils.mixin(this.options, idTypeNames, names, options);


    this.node.classList.add('lineup', 'lu-taggle', 'lu');
    this.node.insertAdjacentHTML('beforeend', `<div></div>`);
    this.stats = this.node.ownerDocument.createElement('p');


    this.provider = new LocalDataProvider([], [], this.options.customProviderOptions);
    // hack in for providing the data provider within the graph
    // the reason for `this.context.ref.value.data` is that from the sub-class the `this` context (reference) is set to `this.context.ref.value` through the provenance graph
    // so by setting `.data` on the reference it is actually set by the sub-class (e.g. by the `AEmbeddedRanking` view)
    this.context.ref.value.data = this.provider;

    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED, () => this.updateLineUpStats());

    const taggleOptions: ITaggleOptions = BaseUtils.mixin(defaultOptions(), this.options.customOptions, <Partial<ITaggleOptions>>{
      summaryHeader: this.options.enableHeaderSummary,
      labelRotation: this.options.enableHeaderRotation ? 45 : 0
    }, options.customOptions);

    if (typeof this.options.itemRowHeight === 'number' && this.options.itemRowHeight > 0) {
      taggleOptions.rowHeight = this.options.itemRowHeight;
    } else if (typeof this.options.itemRowHeight === 'function') {
      const f = this.options.itemRowHeight;
      taggleOptions.dynamicHeight = () => ({
        defaultHeight: taggleOptions.rowHeight,
        padding: () => 0,
        height: (item: IGroupItem | IGroupData) => {
          return f(item) ?? (isGroup(item) ? taggleOptions.groupHeight : taggleOptions.rowHeight);
        }
      });
    }



    const lineupParent = <HTMLElement>this.node.firstElementChild!;
    this.taggle = !this.options.enableOverviewMode ? new EngineRenderer(this.provider, lineupParent, taggleOptions) : new TaggleRenderer(this.provider, lineupParent, Object.assign(taggleOptions, {
      violationChanged: (_: IRule, violation: string) => this.panel.setViolation(violation)
    }));

    // LineUp creates an element with class `lu-backdrop` that fades out all content when a dialog is opened.
    // Append `lu-backdrop` one level higher so fading effect can be applied also to the sidePanel when a dialog is opened.
    const luBackdrop = this.node.querySelector('.lu-backdrop');
    this.node.appendChild(luBackdrop);

    this.panel = new LineUpPanelActions(this.provider, this.taggle.ctx, this.options, this.node.ownerDocument);
    // When a new column desc is added to the provider, update the panel chooser
    this.provider.on(LocalDataProvider.EVENT_ADD_DESC, () => this.updatePanelChooser());
    // TODO: Include this when the remove event is included: https://github.com/lineupjs/lineupjs/issues/338
    // this.provider.on(LocalDataProvider.EVENT_REMOVE_DESC, () => this.updatePanelChooser());
    this.panel.on(LineUpPanelActions.EVENT_SAVE_NAMED_SET, (_event, order: number[], name: string, description: string, sec: Partial<ISecureItem>) => {
      this.saveNamedSet(order, name, description, sec);
    });
    this.panel.on(LineUpPanelActions.EVENT_ADD_SCORE_COLUMN, (_event, scoreImpl: IScore<any>) => {
      this.addScoreColumn(scoreImpl);
    });
    this.panel.on(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, (_event, scoreName: string, scoreId: string, params: any) => {
      this.pushTrackedScoreColumn(scoreName, scoreId, params);
    });
    this.panel.on(LineUpPanelActions.EVENT_ZOOM_OUT, () => {
      this.taggle.zoomOut();
    });
    this.panel.on(LineUpPanelActions.EVENT_ZOOM_IN, () => {
      this.taggle.zoomIn();
    });
    if (this.options.enableOverviewMode) {
      const rule = spaceFillingRule(taggleOptions);

      this.panel.on(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, (_event: any, isOverviewActive: boolean) => {
        updateLodRules(this.taggle.style, isOverviewActive, taggleOptions);
        (<TaggleRenderer>this.taggle).switchRule(isOverviewActive ? rule : null);
      });

      if (this.options.enableOverviewMode === 'active') {
        this.panel.fire(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, true);
      }
    }

    if (this.options.enableSidePanel) {
      this.node.appendChild(this.panel.node);
      if (this.options.enableSidePanel !== 'top') {
        this.taggle.pushUpdateAble((ctx) => this.panel.panel.update(ctx));
      }
    }

    this.selectionHelper = new LineUpSelectionHelper(this.provider, () => this.itemIDType);
    this.selectionHelper.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, selection: ISelection) => {
      this.setItemSelection(selection);
    });
    this.selectionAdapter = this.createSelectionAdapter();
  }

  /**
   * @param params Seperate element that displays the "Showing x of y ..." message
   * @param onParameterChange eventlistener for content changes
   */
  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return super.init(params, onParameterChange).then(() => {
      // inject stats
      const base = <HTMLElement>params.querySelector('form') || params;
      base.insertAdjacentHTML('beforeend', `<div class="form-group"></div>`);
      const container = <HTMLElement>base.lastElementChild!;
      container.appendChild(this.stats);

      if (this.options.enableSidePanel === 'top') {
        container.insertAdjacentElement('afterbegin', this.panel.node);
      }
    });
  }

  update() {
    this.taggle.update();
  }

  /**
   * create the selection adapter used to map input selections to LineUp columns
   * @default no columns are created
   * @returns {ISelectionAdapter}
   */
  protected createSelectionAdapter(): ISelectionAdapter {
    return null;
  }

  /**
   * custom initialization function at the build will be called
   */
  protected initImpl() {
    super.initImpl();
    return this.built = this.build();
  }

  /**
   * return the idType of the shown items in LineUp
   * @returns {IDType}
   */
  get itemIDType() {
    return this.options.itemIDType ? IDTypeManager.getInstance().resolveIdType(this.options.itemIDType) : null;
  }

  protected parameterChanged(name: string): PromiseLike<any> | void {
    super.parameterChanged(name);
    if (this.selectionAdapter) {
      return this.selectionAdapter.parameterChanged(this.built, () => this.createContext());
    }
  }

  protected itemSelectionChanged(): PromiseLike<any> | void {
    this.selectionHelper.setItemSelection(this.getItemSelection());
    this.updateLineUpStats();
    super.itemSelectionChanged();
  }

  protected selectionChanged(): PromiseLike<any> | void {
    if (this.selectionAdapter) {
      return this.selectionAdapter.selectionChanged(this.built, () => this.createContext());
    }
  }

  private createContext(): IContext {
    const ranking = this.provider.getLastRanking();
    const columns = ranking ? ranking.flatColumns : [];
    return {
      columns,
      selection: this.selection,
      freeColor: (id: number) => this.colors.freeColumnColor(id),
      add: (columns: ISelectionColumn[]) => this.withoutTracking(() => {
        columns.forEach((col) => this.addColumn(col.desc, col.data, col.id, col.position));
      }),
      remove: (columns: Column[]) => this.withoutTracking(() => {
        columns.forEach((c) => c.removeMe());
      })
    };
  }

  /**
   * Expand/collapse certain columns on mode change.
   * Expand = focus view
   * Collapse = context view
   * @param mode
   */
  modeChanged(mode: EViewMode) {
    super.modeChanged(mode);
    if (this.provider.getRankings().length <= 0) {
      return;
    }
    const ranking = this.provider.getRankings()[0];

    if (mode === EViewMode.FOCUS) {
      this.panel.show();
      if (this.dump) {
        ranking.children.forEach((c) => {
          if (!this.dump.has(c.id)) {
            return;
          }
          c.setVisible(true);
        });
      }
      this.dump = null;

      this.update();
      return;
    }

    this.panel.hide();

    if (this.dump !== null) {
      return;
    }

    const s = ranking.getPrimarySortCriteria();
    const labelColumn = ranking.children.filter((c) => c.desc.type === 'string')[0];

    this.dump = new Set<string>();
    ranking.children.forEach((c) => {
      if (c === labelColumn ||
        (s && c === s.col) ||
        c.desc.type === 'rank' ||
        c.desc.type === 'selection' ||
        (<any>c.desc).column === 'id' // = Ensembl column
      ) {
        // keep these columns
      } else {
        c.setVisible(false);
        this.dump.add(c.id);
      }
    });
  }


  private async saveNamedSet(order: number[], name: string, description: string, sec: Partial<ISecureItem>) {
    const ids = this.selectionHelper.rowIdsAsSet(order);
    const namedSet = await RestStorageUtils.saveNamedSet(name, this.itemIDType, ids, this.options.subType, description, sec);
    NotificationHandler.successfullySaved(I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.successfullySaved'), name);
    this.fire(AView.EVENT_UPDATE_ENTRY_POINT, namedSet);
  }

  private addColumn(colDesc: any, data: Promise<IScoreRow<any>[]>, id = -1, position?: number): ILazyLoadedColumn {
    // use `colorMapping` as default; otherwise use `color`, which is deprecated; else get a new color
    colDesc.colorMapping = colDesc.colorMapping ? colDesc.colorMapping : (colDesc.color ? colDesc.color : this.colors.getColumnColor(id));
    return LazyColumn.addLazyColumn(colDesc, data, this.provider, position, () => {
      this.taggle.update();
    });
  }

  private addScoreColumn(score: IScore<any>, position?: number): ILazyLoadedColumn {
    const args = typeof this.options.additionalComputeScoreParameter === 'function' ? this.options.additionalComputeScoreParameter() : this.options.additionalComputeScoreParameter;

    const colDesc = score.createDesc(args);
    // flag that it is a score but it also a reload function
    colDesc._score = true;

    const ids = this.selectionHelper.rowIdsAsSet(<number[]>this.provider.getRankings()[0].getOrder());
    const data = score.compute(ids, this.itemIDType, args);

    const r = this.addColumn(colDesc, data, -1, position);

    // use _score function to reload the score
    colDesc._score = () => {
      const ids = this.selectionHelper.rowIdsAsSet(<number[]>this.provider.getRankings()[0].getOrder());
      const data = score.compute(ids, this.itemIDType, args);
      return r.reload(data);
    };
    return r;
  }

  protected reloadScores(visibleOnly = false) {
    let scores: {_score: () => any}[] = <any[]>this.provider.getColumns().filter((d) => typeof (<any>d)._score === 'function');

    if (visibleOnly) {
      // check if part of any ranking
      const usedDescs = new Set([].concat(...this.provider.getRankings().map((d) => d.flatColumns.map((d) => d.desc))));
      scores = scores.filter((d) => usedDescs.has(d));
    }

    return Promise.all(scores.map((d) => d._score()));
  }

  protected async withoutTracking<T>(f: () => T): Promise<T> {
    return this.built.then(() => LineupTrackingManager.getInstance().withoutTracking(this.context.ref, f));
  }

  /**
   * used by commands to trigger adding a tracked score
   * @param {IScore<any>} score
   * @returns {Promise<{col: Column; loaded: Promise<Column>}>}
   */
  addTrackedScoreColumn(score: IScore<any>, position?: number): Promise<ILazyLoadedColumn> {
    return this.withoutTracking(() => this.addScoreColumn(score, position));
  }

  private pushTrackedScoreColumn(scoreName: string, scoreId: string, params: any) {
    return ScoreUtils.pushScoreAsync(this.context.graph, this.context.ref, scoreName, scoreId, params);
  }

  /**
   * used by commands to remove a tracked score again
   * @param {string} columnId
   * @returns {Promise<boolean>}
   */
  removeTrackedScoreColumn(columnId: string): Promise<boolean> {
    return this.withoutTracking(() => {
      const column = this.provider.find(columnId);
      return column.removeMe();
    });
  }

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
  protected getColumnDescs(columns: IServerColumn[]): IAdditionalColumnDesc[] {
    return ColumnDescUtils.deriveColumns(columns);
  }

  private getColumns(): Promise<IAdditionalColumnDesc[]> {
    return this.loadColumnDesc().then(({columns}) => {
      const cols = this.getColumnDescs(columns);
      // compatibility since visible is now a supported feature, so rename ones
      for (const col of cols) {
        if ((<IColumnOptions>col).visible != null) {
          (<any>col).initialColumn = (<IColumnOptions>col).visible;
          delete (<IColumnOptions>col).visible;
        }
      }
      deriveColors(cols);
      return cols;
    });
  }

  private build() {
    this.setBusy(true);
    return Promise.all([this.getColumns(), this.loadRows()]).then((r) => {
      const columns: IColumnDesc[] = r[0];
      columns.forEach((c) => this.provider.pushDesc(c));

      const rows: IRow[] = r[1];

      this.setLineUpData(rows);
      this.createInitialRanking(this.provider);
      const ranking = this.provider.getLastRanking();
      this.customizeRanking(LineupUtils.wrapRanking(this.provider, ranking));
    }).then(() => {
      if (this.selectionAdapter) {
        // init first time
        return this.selectionAdapter.selectionChanged(null, () => this.createContext());
      }
    }).then(() => {
      this.builtLineUp(this.provider);

      //record after the initial one
      LineupTrackingManager.getInstance().clueify(this.taggle, this.context.ref, this.context.graph);
      this.setBusy(false);
    }).catch(ErrorAlertHandler.getInstance().errorAlert)
      .catch((error) => {
        console.error(error);
        this.setBusy(false);
      });
  }

  protected builtLineUp(lineup: LocalDataProvider) {
    // hook
  }

  protected createInitialRanking(lineup: LocalDataProvider, options: Partial<IInitialRankingOptions> = {}) {
    ColumnDescUtils.createInitialRanking(lineup, options);
  }

  protected customizeRanking(ranking: IRankingWrapper) {
    // hook
  }

  protected setLineUpData(rows: IRow[]) {
    this.setHint(rows.length === 0, I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.notFoundHint'));
    this.provider.setData(rows);
    this.selectionHelper.rows = rows;
    this.selectionHelper.setItemSelection(this.getItemSelection());
  }

  private reloadDataImpl() {
    return this.built = Promise.all([this.built, this.loadRows()]).then((r) => {
      const rows: IRow[] = r[1];
      this.setLineUpData(rows);
    });
  }

  private rebuildImpl() {
    return this.built = this.built.then(() => this.clear().then(() => this.build()));
  }

  /**
   * Writes the number of total, selected and shown items in the parameter area
   */
  updateLineUpStats() {
    const showStats = (total: number, selected = 0, shown = 0) => {
      const name = shown === 1 ? this.options.itemName : this.options.itemNamePlural;
      return `${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.showing')} ${shown} ${total > 0 ? `${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.of')} ${total}` : ''} ${typeof name === 'function' ? name() : name}${selected > 0 ? `; ${selected} ${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.selected')}` : ''}`;
    };

    const selected = this.provider.getSelection().length;
    const total = this.provider.data.length;

    const r = this.provider.getRankings()[0];
    const shown = r && r.getOrder() ? r.getOrder().length : 0;
    this.stats.textContent = showStats(total, selected, shown);
  }

  /**
   * removes alls data from lineup and resets it
   */
  protected clear() {
    //reset
    return LineupTrackingManager.getInstance().untrack(this.context.ref).then(() => {
      this.provider.clearRankings();
      this.provider.clearSelection();
      this.provider.clearData();
      this.provider.clearColumns();
    });
  }

}
