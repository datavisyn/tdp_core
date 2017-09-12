/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {AView} from '../views/AView';
import {EViewMode, IViewContext, ISelection} from '../views/interfaces';

import {ILineUpConfig} from 'lineupjs/src/interfaces';
import Column, {IColumnDesc} from 'lineupjs/src/model/Column';
import {deriveColors} from 'lineupjs/src/utils';
import {LocalDataProvider} from 'lineupjs/src/provider';
import EngineRenderer from 'lineupjs/src/ui/engine/EngineRenderer';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';
import {resolve, IDTypeLike} from 'phovea_core/src/idtype';
import {clueify, withoutTracking, untrack} from './internal/cmds';
import {saveNamedSet} from '../storage';
import {showErrorModalDialog} from '../dialogs';
import LineUpSelectionHelper from './internal/LineUpSelectionHelper';
import {IScore, IScoreRow} from '../extensions';
import {createInitialRanking, IAdditionalColumnDesc, deriveColumns} from './desc';
import {pushScoreAsync} from './internal/scorecmds';
import {debounce, mixin} from 'phovea_core/src';
import LineUpColors from './internal/LineUpColors';
import {IRow} from '../rest';
import {IContext, ISelectionAdapter, ISelectionColumn} from './selection';
import {IServerColumn, IViewDescription} from '../rest';
import {defaultConfig} from 'lineupjs/src/config';
import LineUpPanelActions from './internal/LineUpPanelActions';
import {addLazyColumn} from './internal/column';

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
  subType: { key: string, value: string };
}

/**
 * base class for views based on LineUp
 */
export abstract class ARankingView extends AView {

  private readonly config: ILineUpConfig = mixin(defaultConfig(), {
    header: {
      summary: true
    }
  });
  /**
   * Stores the ranking data when collapsing columns on modeChange()
   * @type {any}
   */
  private dump: Map<string, number | boolean> = null;

  /**
   * DOM element for LineUp stats in parameter UI
   */
  private readonly stats: HTMLElement;

  private readonly provider = new LocalDataProvider([], [], {
    maxNestedSortingCriteria: 2,
    grouping: true
  });
  private readonly engine: EngineRenderer;
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
    itemIDType: null,
    additionalScoreParameter: null,
    additionalComputeScoreParameter: null,
    subType: {key: '', value: ''}
  };

  private readonly selectionAdapter: ISelectionAdapter|null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent);

    // variants for deriving the item name
    const idTypeNames = options.itemIDType ? {itemName: resolve(options.itemIDType).name, itemNamePlural: resolve(options.itemIDType).name}: {};
    const names = options.itemName ? {itemNamePlural: typeof options.itemName === 'function' ? () => `${(<any>options.itemName)()}s` : `${options.itemName}s`} : {};
    mixin(this.options, idTypeNames, names, options);


    this.node.classList.add('lineup');
    this.node.insertAdjacentHTML('beforeend', `<div><div class="lu"></div></div>`);

    this.stats = this.node.ownerDocument.createElement('p');


    // hack in for providing the data provider within the graph
    this.context.ref.value.data = this.provider;

    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED, () => this.updateLineUpStats());
    this.engine = new EngineRenderer(this.provider, <HTMLElement>this.node.querySelector('div.lu')!, this.config);

    this.panel = new LineUpPanelActions(this.provider, this.engine.ctx, () => this.itemIDType, this.options.additionalScoreParameter);
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
      this.engine.zoomOut();
    });
    this.panel.on(LineUpPanelActions.EVENT_ZOOM_IN, () => {
      this.engine.zoomIn();
    });


    this.node.appendChild(this.panel.node);
    this.engine.pushUpdateAble((ctx) => this.panel.panel.update(ctx));


    this.selectionHelper = new LineUpSelectionHelper(this.provider, () => this.itemIDType);
    this.selectionHelper.on(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, (_event, selection: ISelection) => {
      this.setItemSelection(selection);
    });
    this.selectionAdapter = this.createSelectionAdapter();
  }

  init(params: HTMLElement, onParameterChange: (name: string, value: any) => Promise<any>) {
    super.init(params, onParameterChange);

    // inject stats
    const base = <HTMLElement>params.querySelector('form') || params;
    base.insertAdjacentHTML('beforeend', `<div class="form-group"></div>`);
    base.lastElementChild!.appendChild(this.stats);
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

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    if (this.selectionAdapter) {
      this.selectionAdapter.parameterChanged(this.built, () => this.createContext());
    }
  }

  protected itemSelectionChanged() {
    this.selectionHelper.setItemSelection(this.getItemSelection());
    this.updateLineUpStats();
    super.itemSelectionChanged();
  }

  protected selectionChanged() {
    if (this.selectionAdapter) {
      this.selectionAdapter.selectionChanged(this.built, () => this.createContext());
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
        columns.forEach((col) => this.addColumn(col.desc, col.data, col.id));
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
      this.panel.releaseForce();
      if (this.dump) {
        ranking.children.forEach((c) => {
          if (!this.dump.has(c.id)) {
            return;
          }
          c.setWidth(<number>this.dump.get(c.id));
        });
      }
      this.dump = null;
      return;
    }

    this.panel.forceCollapse();

    if (this.dump !== null) {
      return;
    }

    const s = ranking.getSortCriteria();
    const labelColumn = ranking.children.filter((c) => c.desc.type === 'string')[0];

    this.dump = new Map<string, number | boolean>();
    ranking.children.forEach((c) => {
      if (c === labelColumn ||
        c === s.col ||
        c.desc.type === 'rank' ||
        c.desc.type === 'selection' ||
        (<any>c.desc).column === 'id' // = Ensembl column
      ) {
        // keep these columns
      } else {
        this.dump.set(c.id, c.getWidth());
        c.hide();
      }
    });
  }


  private async saveNamedSet(order: number[], name: string, description: string, isPublic: boolean = false) {
    const ids = this.selectionHelper.rowIdsAsSet(order);
    const namedSet = await saveNamedSet(name, this.itemIDType, ids, this.options.subType, description, isPublic);
    this.fire(AView.EVENT_UPDATE_ENTRY_POINT, namedSet);
  }

  private addColumn(colDesc: any, data: Promise<IScoreRow<any>[]>, id = -1): { col: Column, loaded: Promise<Column> } {
    colDesc.color = this.colors.getColumnColor(id);
    return addLazyColumn(colDesc, data, this.provider, () => this.engine.update());
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

  private async withoutTracking<T>(f: () => T): Promise<T> {
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
      const rows: IRow[] = r[1];

      this.setLineUpData(rows);
      this.createInitialRanking(this.provider);
      this.colors.init(this.provider.getLastRanking());

      if (this.selectionAdapter) {
        // init first time
        this.selectionAdapter.selectionChanged(this.built, () => this.createContext());
      }

      //record after the initial one
      clueify(this.context.ref, this.context.graph);
      this.setBusy(false);
    }).catch(showErrorModalDialog)
      .catch((error) => {
      console.error(error);
      this.setBusy(false);
    });
  }

  protected createInitialRanking(lineup: ADataProvider) {
    createInitialRanking(this.provider);
  }

  private setLineUpData(rows: IRow[]) {
    if (rows.length > 0) {
      this.node.classList.remove('nodata');
    } else {
      this.node.classList.add('nodata');
    }
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
    return this.clear().then(() => this.built = this.build());
  }

  /**
   * Writes the number of total, selected and shown items in the parameter area
   */
  private updateLineUpStats() {
    const showStats = (total: number, selected = 0, shown = 0) => {
      const name = shown === 1 ? this.options.itemName : this.options.itemNamePlural;
      return `Showing ${shown} ${total > 0 ? `of ${total}` : ''} ${typeof name === 'function' ? name() : name} ${selected > 0 ? `; ${selected} selected` : ''}`;
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
    return untrack(this.context.ref).then(() => {
      this.provider.clearRankings();
      this.provider.clearSelection();
      this.provider.clearData();
      this.provider.clearColumns();
    });
  }

}

export default ARankingView;
