import {EngineRenderer, spaceFillingRule, defaultOptions, IRule, IGroupData, IGroupItem, isGroup, Column, IColumnDesc, LocalDataProvider, deriveColors, StackColumn, TaggleRenderer, ITaggleOptions } from 'lineupjs';
import {AView} from '../views/AView';
import {EViewMode, IViewContext, ISelection} from '../views';

import {resolve, IDTypeLike} from 'phovea_core/src/idtype';
import {clueify, withoutTracking, untrack} from './internal/cmds';
import {saveNamedSet} from '../storage';
import {showErrorModalDialog} from '../dialogs';
import LineUpSelectionHelper from './internal/LineUpSelectionHelper';
import {IScore, IScoreRow} from '../extensions';
import {createInitialRanking, IAdditionalColumnDesc, deriveColumns, IInitialRankingOptions} from './desc';
import {IRankingWrapper, wrapRanking} from './internal/ranking';
import {pushScoreAsync} from './internal/scorecmds';
import {debounce, mixin, resolveImmediately} from 'phovea_core/src';
import LineUpColors from './internal/LineUpColors';
import {IRow} from '../rest';
import {IContext, ISelectionAdapter, ISelectionColumn} from './selection';
import {IServerColumn, IViewDescription} from '../rest';
import LineUpPanelActions, {rule} from './internal/LineUpPanelActions';
import {addLazyColumn} from './internal/column';
import {successfullySaved} from '../notifications';

export {IRankingWrapper} from './internal/ranking';
export {LocalDataProvider as DataProvider} from 'lineupjs';

export interface IARankingViewOptions {
  /**
   * name of a single item in LineUp
   * @default item
   */
  itemName: string | (() => string);
  /**
   * plural version of before
   * @default items
   */
  itemNamePlural: string | (() => string);
  /**
   * the idtype of the shown items
   */
  itemIDType: IDTypeLike | null;

  /**
   * custom argument (or callback function) to pass to scores dialogs
   */
  additionalScoreParameter: object | (() => object);
  /**
   * custom argument (or callback function) to pass to scores computations
   */
  additionalComputeScoreParameter: object | (() => object);
  /**
   * additional attributes for stored named sets
   */
  subType: {key: string, value: string};

  /**
   * enable taggle overview mode switcher
   * @default true
   */
  enableOverviewMode: boolean | 'active';
  /**
   * enable zoom button
   * @default true
   */
  enableZoom: boolean;

  enableSidePanel: boolean | 'collapsed';

  enableAddingColumns: boolean;

  enableHeaderSummary: boolean;

  enableHeaderRotation: boolean;

  /**
   * enable alternating pattern background
   * @default false
   */
  enableStripedBackground: boolean;

  itemRowHeight: number | ((row: any, index: number) => number) | null;

  customOptions: Partial<ITaggleOptions>;
}

export const MAX_AMOUNT_OF_ROWS_TO_DISABLE_OVERVIEW = 2000;

/**
 * base class for views based on LineUp
 */
export abstract class ARankingView extends AView {

  /**
   * Stores the ranking data when collapsing columns on modeChange()
   * @type {any}
   */
  private dump: Map<string, number | boolean | number[]> = null;

  readonly naturalSize = [800, 500];

  /**
   * DOM element for LineUp stats in parameter UI
   */
  private readonly stats: HTMLElement;

  private readonly provider = new LocalDataProvider([], [], {
    maxNestedSortingCriteria: Infinity,
    maxGroupColumns: Infinity,
    filterGlobally: true
  });
  private readonly taggle: EngineRenderer | TaggleRenderer;
  private readonly selectionHelper: LineUpSelectionHelper;
  private readonly panel: LineUpPanelActions;

  /**
   * clears and rebuilds this lineup instance from scratch
   * @returns {Promise<any[]>} promise when done
   */
  protected rebuild = debounce(() => this.rebuildImpl(), 100);

  /**
   * similar to rebuild but just loads new data and keep the columns
   * @returns {Promise<any[]>} promise when done
   */
  protected reloadData = debounce(() => this.reloadDataImpl(), 100);

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
    enableAddingColumns: true,
    enableSidePanel: 'collapsed',
    enableHeaderSummary: true,
    enableStripedBackground: false,
    enableHeaderRotation: false,
    customOptions: {}
  };

  private readonly selectionAdapter: ISelectionAdapter | null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent);

    // variants for deriving the item name
    const idTypeNames = options.itemIDType ? {
      itemName: resolve(options.itemIDType).name,
      itemNamePlural: resolve(options.itemIDType).name
    } : {};
    const names = options.itemName ? {itemNamePlural: typeof options.itemName === 'function' ? () => `${(<any>options.itemName)()}s` : `${options.itemName}s`} : {};
    mixin(this.options, idTypeNames, names, options);


    this.node.classList.add('lineup', 'lu-taggle', 'lu');
    this.node.insertAdjacentHTML('beforeend', `<div></div>`);
    this.stats = this.node.ownerDocument.createElement('p');


    // hack in for providing the data provider within the graph
    this.context.ref.value.data = this.provider;

    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED, () => this.updateLineUpStats());

    const config: ITaggleOptions = mixin(defaultOptions(), <Partial<ITaggleOptions>>{
      summaryHeader: this.options.enableHeaderSummary,
      labelRotation: this.options.enableHeaderRotation ? 45 : 0
    }, options.customOptions);

    if (typeof this.options.itemRowHeight === 'number' && this.options.itemRowHeight > 0) {
      config.rowHeight = this.options.itemRowHeight;
    } else if (typeof this.options.itemRowHeight === 'function') {
      const f = this.options.itemRowHeight;
      config.dynamicHeight = () => ({
        defaultHeight: 18,
        padding: () => 0,
        height: (item: IGroupItem | IGroupData) => {
          return isGroup(item) ? 70 : f(item.v, item.i);
        }
      });
    }



    const lineupParent = <HTMLElement>this.node.firstElementChild!;
    this.taggle = !this.options.enableOverviewMode ? new EngineRenderer(this.provider, lineupParent, config) : new TaggleRenderer(this.provider, lineupParent, Object.assign(config, {
      violationChanged: (_: IRule, violation: string) => this.panel.setViolation(violation)
    }));

    this.panel = new LineUpPanelActions(this.provider, this.taggle.ctx, this.options);
    this.panel.on(LineUpPanelActions.EVENT_SAVE_NAMED_SET, (_event, order: number[], name: string, description: string, isPublic: boolean) => {
      this.saveNamedSet(order, name, description, isPublic);
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
      this.panel.on(LineUpPanelActions.EVENT_RULE_CHANGED, (_event: any, rule: IRule) => {
        (<TaggleRenderer>this.taggle).switchRule(rule);
      });
      if (this.options.enableOverviewMode === 'active') {
        (<TaggleRenderer>this.taggle).switchRule(rule);
      }
    }

    if (this.options.enableSidePanel) {
      this.node.appendChild(this.panel.node);
      this.taggle.pushUpdateAble((ctx) => this.panel.panel.update(ctx));
    }

    this.selectionHelper = new LineUpSelectionHelper(this.provider, () => this.itemIDType);
    this.selectionHelper.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, selection: ISelection) => {
      this.setItemSelection(selection);
    });
    this.selectionAdapter = this.createSelectionAdapter();
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>) {
    return resolveImmediately(super.init(params, onParameterChange)).then(() => {
      // inject stats
      const base = <HTMLElement>params.querySelector('form') || params;
      base.insertAdjacentHTML('beforeend', `<div class="form-group"></div>`);
      base.lastElementChild!.appendChild(this.stats);
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
    return this.options.itemIDType ? resolve(this.options.itemIDType) : null;
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
    const weightsSuffix = '_weights';

    if (mode === EViewMode.FOCUS) {
      this.panel.show();
      if (this.dump) {
        ranking.children.forEach((c) => {
          if (!this.dump.has(c.id)) {
            return;
          }

          c.setWidth(<number>this.dump.get(c.id));
          if (this.dump.has(c.id + weightsSuffix)) {
            (<StackColumn>c).setWeights(<number[]>this.dump.get(c.id + weightsSuffix));
          }
        });
      }
      this.dump = null;
      return;
    }

    this.panel.hide();

    if (this.dump !== null) {
      return;
    }

    const s = ranking.getPrimarySortCriteria();
    const labelColumn = ranking.children.filter((c) => c.desc.type === 'string')[0];

    this.dump = new Map<string, number | boolean | number[]>();
    ranking.children.forEach((c) => {
      if (c === labelColumn ||
        (s && c === s.col) ||
        c.desc.type === 'rank' ||
        c.desc.type === 'selection' ||
        (<any>c.desc).column === 'id' // = Ensembl column
      ) {
        // keep these columns
      } else {
        if (c instanceof StackColumn) {
          this.dump.set(c.id + weightsSuffix, (<StackColumn>c).getWeights());
        }
        this.dump.set(c.id, c.getWidth());
        c.hide();
      }
    });
  }


  private async saveNamedSet(order: number[], name: string, description: string, isPublic: boolean = false) {
    const ids = this.selectionHelper.rowIdsAsSet(order);
    const namedSet = await saveNamedSet(name, this.itemIDType, ids, this.options.subType, description, isPublic);
    successfullySaved('Named Set', name);
    this.fire(AView.EVENT_UPDATE_ENTRY_POINT, namedSet);
  }

  private addColumn(colDesc: any, data: Promise<IScoreRow<any>[]>, id = -1, position?: number): {col: Column, loaded: Promise<Column>} {
    colDesc.color = this.colors.getColumnColor(id);
    return addLazyColumn(colDesc, data, this.provider, position, () => {
      this.taggle.update();
      this.panel.updateChooser(this.itemIDType, this.provider.getColumns());
    });
  }

  private addScoreColumn(score: IScore<any>) {
    const colDesc = score.createDesc();
    // flag that it is a score
    colDesc._score = true;

    const ids = this.selectionHelper.rowIdsAsSet(this.provider.getRankings()[0].getOrder());
    const args = typeof this.options.additionalComputeScoreParameter === 'function' ? this.options.additionalComputeScoreParameter() : this.options.additionalComputeScoreParameter;
    const data = score.compute(ids, this.itemIDType, args);
    return this.addColumn(colDesc, data);
  }

  protected async withoutTracking<T>(f: () => T): Promise<T> {
    return this.built.then(() => withoutTracking(this.context.ref, f));
  }

  /**
   * used by commands to trigger adding a tracked score
   * @param {IScore<any>} score
   * @returns {Promise<{col: Column; loaded: Promise<Column>}>}
   */
  addTrackedScoreColumn(score: IScore<any>) {
    return this.withoutTracking(() => this.addScoreColumn(score));
  }

  private pushTrackedScoreColumn(scoreName: string, scoreId: string, params: any) {
    return pushScoreAsync(this.context.graph, this.context.ref, scoreName, scoreId, params);
  }

  /**
   * used by commands to remove a tracked score again
   * @param {string} columnId
   * @returns {Promise<boolean>}
   */
  removeTrackedScoreColumn(columnId: string) {
    return this.withoutTracking(() => {
      const column = this.provider.find(columnId);
      return column.removeMe();
    });
  }

  /**
   * load the table description from the server
   * @returns {Promise<IViewDescription>} the column descriptions
   */
  protected abstract loadColumnDesc(): Promise<IViewDescription>;

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
    return deriveColumns(columns);
  }

  private getColumns(): Promise<IAdditionalColumnDesc[]> {
    return this.loadColumnDesc().then(({columns}) => {
      const cols = this.getColumnDescs(columns);
      deriveColors(cols);
      return cols;
    });
  }

  private build() {
    this.setBusy(true);
    return Promise.all([this.getColumns(), this.loadRows()]).then((r) => {
      const columns: IColumnDesc[] = r[0];
      columns.forEach((c) => this.provider.pushDesc(c));

      this.panel.updateChooser(this.itemIDType, this.provider.getColumns());

      const rows: IRow[] = r[1];

      this.setLineUpData(rows);
      this.createInitialRanking(this.provider);
      const ranking = this.provider.getLastRanking();
      this.customizeRanking(wrapRanking(this.provider, ranking));
      this.colors.init(ranking);
    }).then(() => {
      if (this.selectionAdapter) {
        // init first time
        return this.selectionAdapter.selectionChanged(null, () => this.createContext());
      }
    }).then(() => {
      this.builtLineUp(this.provider);

      //record after the initial one
      clueify(this.context.ref, this.context.graph);
      this.setBusy(false);
    }).catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
        this.setBusy(false);
      });
  }

  protected builtLineUp(lineup: LocalDataProvider) {
    // hook
  }

  protected createInitialRanking(lineup: LocalDataProvider, options: Partial<IInitialRankingOptions> = {}) {
    createInitialRanking(lineup, options);
  }

  protected customizeRanking(ranking: IRankingWrapper) {
    // hook
  }

  protected setLineUpData(rows: IRow[]) {
    this.setHint(rows.length === 0, 'No data found for selection and parameter.');
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
      return `Showing ${shown} ${total > 0 ? `of ${total}` : ''} ${typeof name === 'function' ? name() : name}${selected > 0 ? `; ${selected} selected` : ''}`;
    };

    const selected = this.provider.getSelection().length;
    const total = this.provider.data.length;

    const r = this.provider.getRankings()[0];
    const shown = r && r.getOrder() ? r.getOrder().length : 0;
    this.stats.textContent = showStats(total, selected, shown);
    this.panel.toggleDisableOverviewButton(shown > MAX_AMOUNT_OF_ROWS_TO_DISABLE_OVERVIEW);
  }

  /**
   * removes alls data from lineup and resets it
   */
  protected clear() {
    //reset
    return untrack(this.context.ref).then(() => {
      this.provider.clearRankings();
      this.provider.clearSelection();
      this.provider.clearData();
      this.provider.clearColumns();
    });
  }

}

export default ARankingView;
