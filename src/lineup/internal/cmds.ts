/**
 * Created by Samuel Gratzl on 18.05.2016.
 */

import {IObjectRef, ProvenanceGraph, ICmdResult, ResolveNow, I18nextManager, ObjectRefUtils, ActionMetaData, ActionUtils, ActionNode, IAction} from 'phovea_core';
import {EngineRenderer, TaggleRenderer, NumberColumn, LocalDataProvider, StackColumn, ScriptColumn, OrdinalColumn, CompositeColumn, Ranking, ISortCriteria, Column, isMapAbleColumn, mappingFunctions, StringColumn, DateColumn, IGroup} from 'lineupjs';

import {LineUpFilterUtils} from './lineUpFilter';
import {isEqual} from 'lodash';

// used for function calls in the context of tracking or untracking actions in the provenance graph in order to get a consistent defintion of the used strings
enum LineUpTrackAndUntrackActions {
  ChangedSuffix = 'Changed.track', // used as suffix in `untrack()`

  metaData = 'metaData',
  filter = 'filter',
  rendererType = 'rendererType', // important: the corresponding functions in LineUp are called `getRenderer` and `setRenderer` (see `setColumnImpl()` below)
  groupRenderer = 'groupRenderer',
  summaryRenderer = 'summaryRenderer',
  sortMethod = 'sortMethod',
  width = 'width',
  grouping = 'grouping', // important: the corresponding functions in LineUp vary on the column type (see `setColumnImpl()` below)
  mapping = 'mapping',
  script = 'script'
}

// Actions that originate from LineUp
enum LineUpCmds {
  CMD_SET_SORTING_CRITERIA = 'lineupSetRankingSortCriteria',
  CMD_SET_SORTING_CRITERIAS = 'lineupSetSortCriteria',
  CMD_SET_GROUP_CRITERIA = 'lineupSetGroupCriteria',
  CMD_ADD_RANKING = 'lineupAddRanking',
  CMD_SET_COLUMN = 'lineupSetColumn',
  CMD_ADD_COLUMN = 'lineupAddColumn',
  CMD_MOVE_COLUMN = 'lineupMoveColumn',
  CMD_SET_AGGREGATION = 'lineupSetAggregation'
}

export interface IViewProviderLocal {
  data: LocalDataProvider;

  getInstance(): {updateLineUpStats()};
}

/**
 * Save the buffered action so it can be executed when dialog is confirmed
 */
interface IBufferedAction {
  /**
   * Name of the action, i.e., `filter`
   */
  name: string;

  /**
   * Push action to provenance graph
   */
  execute: (initialValue?: unknown) => void;
}

type bufferOrExecute = (action: IBufferedAction, initialValue: any, isActionBuffered?: boolean) => void;


interface IAggregationParameter {
  /**
   * Ranking ID
   */
  rid: number;

  /**
   * Single or multiple group names
   */
  group: string | string[];

  /**
   * Aggregation value
   */
  value: number | number[];
}

export class LineupTrackingManager {

  //TODO better solution
  private ignoreNext: string = null;

  /**
   * set of data provider to ignore
   * @type {Set<LocalDataProvider>}
   */
  private temporaryUntracked = new Set<string>();

  /**
   * Check if the given event should be ignored.
   * Events are ignored when the event name is:
   * 1. stored in the `LineupTrackingManager.getInstance().ignoreNext`; the variable is set to `null` in this function call
   * 2. or listed in the `LineupTrackingManager.getInstance().temporaryUntracked`
   * @param event The event name
   * @param objectRef The object reference that contains the LineUp data provider
   * @returns Returns `true` if the event should be ignored. Otherwise returns `false`.
   */
  private ignore(event: string, objectRef: IObjectRef<IViewProviderLocal>): boolean {
    if (LineupTrackingManager.getInstance().ignoreNext === event) {
      LineupTrackingManager.getInstance().ignoreNext = null;
      return true;
    }
    return LineupTrackingManager.getInstance().temporaryUntracked.has(objectRef.hash);
  }

  /**
   * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
   * @param ranking
   */
  private dirtyRankingWaiter(ranking: Ranking): (undo: ICmdResult) => ICmdResult | Promise<ICmdResult> {
    let waiter: Promise<void> | null = null;

    ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, () => {
      // disable
      ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null);

      let resolver: () => void;
      // store the promise and the resolve function in variables
      // the waiter (promise) will only be resolved when the resolver is called
      // so the promise is locked until the `${Ranking.EVENT_ORDER_CHANGED}.track` event is triggered
      waiter = new Promise<void>((resolve) => resolver = resolve);
      ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, () => {
        ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, null); // disable
        resolver(); // resolve waiter promise
      });
    });

    return (undo: ICmdResult) => {
      ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null); // disable
      if (!waiter) {
        return undo;
      }
      return waiter.then(() => undo); // locked until the resolver is executed (i.e. when the event dispatches)
    };
  }

  static async addRankingImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const index: number = parameter.index;

    if (!parameter.dump) { // remove
      const ranking = p.getRankings()[index];
      LineupTrackingManager.getInstance().ignoreNext = LocalDataProvider.EVENT_REMOVE_RANKING;
      p.removeRanking(ranking);
      return {
        inverse: LineupTrackingManager.getInstance().addRanking(inputs[0], parameter.index, ranking.dump(p.toDescRef.bind(p)))
      };
    }

    // add
    LineupTrackingManager.getInstance().ignoreNext = LocalDataProvider.EVENT_ADD_RANKING;
    const added = p.restoreRanking(parameter.dump);

    // wait for sorted
    let resolver: () => void;
    const waiter = new Promise<void>((resolve) => resolver = resolve);
    added.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, () => {
      added.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, null); // disable
      resolver();
    });
    p.insertRanking(added, index);
    return waiter.then(() => ({ // the waiter promise is resolved as soon as the `${Ranking.EVENT_ORDER_CHANGED}.track` event is dispatched. see the `dirtyRankingWaiter` function for details
      inverse: LineupTrackingManager.getInstance().addRanking(inputs[0], parameter.index, null)
    }));
  }

  public addRanking(provider: IObjectRef<any>, index: number, dump?: any): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addRanking') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeRanking'), ObjectRefUtils.category.layout, dump ?  ObjectRefUtils.operation.create :  ObjectRefUtils.operation.remove), LineUpCmds.CMD_ADD_RANKING, LineupTrackingManager.addRankingImpl, [provider], {
      index,
      dump
    });
  }

  /**
   * Create an object structure from the LineUp sort event listener that can stored in a provenance graph
   * @param v Object from LineUp sort event listener
   */
  private toSortObject(v: any) {
    return {
      asc: v.asc,
      col: v.col ? v.col.fqpath : null
    };
  }

  static async setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const bak = LineupTrackingManager.getInstance().toSortObject(ranking.getSortCriteria());
    LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
    //expects just null not undefined
    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    ranking.sortBy(parameter.value.col ? (ranking.findByPath(parameter.value.col) || null) : null, parameter.value.asc);

    return waitForSorted({
      inverse: LineupTrackingManager.getInstance().setRankingSortCriteria(inputs[0], parameter.rid, bak)
    });
  }


  public setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout,  ObjectRefUtils.operation.update), LineUpCmds.CMD_SET_SORTING_CRITERIA, LineupTrackingManager.setRankingSortCriteriaImpl, [provider], {
      rid,
      value
    });
  }

  static async setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];

    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);

    let current: ISortCriteria[];
    const columns: ISortCriteria[] = parameter.columns.map((c) => ({col: ranking.findByPath(c.col), asc: c.asc}));
    if (parameter.isSorting) {
      current = ranking.getSortCriteria();
      LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
      ranking.setSortCriteria(columns);
    } else {
      current = ranking.getGroupSortCriteria();
      LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED;
      ranking.setGroupSortCriteria(columns);
    }
    return waitForSorted({
      inverse: LineupTrackingManager.getInstance().setSortCriteria(inputs[0], parameter.rid, current.map(LineupTrackingManager.getInstance().toSortObject), parameter.isSorting)
    });
  }

  public setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {asc: boolean, col: string}[], isSorting = true): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout,  ObjectRefUtils.operation.update), LineUpCmds.CMD_SET_SORTING_CRITERIAS, LineupTrackingManager.setSortCriteriaImpl, [provider], {
      rid,
      columns,
      isSorting
    });
  }
  static async setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const current = ranking.getGroupCriteria().map((d) => d.fqpath);
    const columns = parameter.columns.map((p) => ranking.findByPath(p));
    LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_GROUP_CRITERIA_CHANGED;

    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    ranking.setGroupCriteria(columns);
    return waitForSorted({
      inverse: LineupTrackingManager.getInstance().setGroupCriteria(inputs[0], parameter.rid, current)
    });
  }


  public setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeGroupCriteria'), ObjectRefUtils.category.layout,  ObjectRefUtils.operation.update), LineUpCmds.CMD_SET_GROUP_CRITERIA, LineupTrackingManager.setGroupCriteriaImpl, [provider], {
      rid,
      columns
    });
  }

  public setAggregation(provider: IObjectRef<any>, rid: number, group: string | string[], value: number | number[]): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeAggregation'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), LineUpCmds.CMD_SET_AGGREGATION, LineupTrackingManager.setAggregationImpl, [provider], <IAggregationParameter>{
      rid,
      group,
      value
    });
  }

  static async setAggregationImpl(inputs: IObjectRef<any>[], parameter: IAggregationParameter) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];

    LineupTrackingManager.getInstance().ignoreNext = LocalDataProvider.EVENT_GROUP_AGGREGATION_CHANGED;

    const waiter = new Promise<void>((resolve) => {
      p.on(`${LocalDataProvider.EVENT_GROUP_AGGREGATION_CHANGED}.track`, () => {
         p.on(`${LocalDataProvider.EVENT_GROUP_AGGREGATION_CHANGED}.track`, null); // disable
         resolve(); // resolve promise
      });
    });

    let inverseValue: number | number[];

    if (Array.isArray(parameter.group)) {
      // use `filter()` for multiple groups
      const groups = ranking.getFlatGroups().filter((d) => parameter.group.includes(d.name));
      inverseValue = groups.map((group) => p.getTopNAggregated(ranking, group));
      p.setTopNAggregated(ranking, groups, parameter.value);

    } else {
      // use `find()` to avoid unnecessary iterations for single groups
      const group = ranking.getFlatGroups().find((d) => d.name === parameter.group);
      inverseValue = p.getTopNAggregated(ranking, group); // default = -1 if group === undefined (see LineUp code)
      if (group) {
        p.setTopNAggregated(ranking, group, parameter.value);
      }
    }

    return waiter.then(() => ({
      inverse: LineupTrackingManager.getInstance().setAggregation(inputs[0], parameter.rid, parameter.group, inverseValue)
    }));
  }

  static async setColumnImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const prop = parameter.prop[0].toUpperCase() + parameter.prop.slice(1);

    let bak = null;
    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    let source: Column | Ranking = ranking;
    if (parameter.path) {
      source = ranking.findByPath(parameter.path);
    }

    LineupTrackingManager.getInstance().ignoreNext = `${parameter.prop}Changed`;

    if (parameter.prop === LineUpTrackAndUntrackActions.mapping && source instanceof Column && isMapAbleColumn(source)) {
      bak = source.getMapping().toJSON();
      if (parameter.value.type.includes('linear')) {
        parameter.value.type = 'linear';
      }
      const availableMappingFunctions = mappingFunctions();
      const selectedMappingFunction = mappingFunctions()[parameter.value.type];
      source.setMapping(new selectedMappingFunction(parameter.value));
    } else if (source) {
      // fixes bug that is caused by the fact that the function `getRendererType()` does not exist (only `getRenderer()`)
      switch (parameter.prop) {
        case LineUpTrackAndUntrackActions.rendererType:
          bak = source[`getRenderer`]();
          source[`setRenderer`].call(source, parameter.value);
          break;

        case LineUpTrackAndUntrackActions.filter:
          bak = source[`get${prop}`]();
          // restore serialized regular expression before passing to LineUp
          const value = LineUpFilterUtils.isSerializedFilter(parameter.value) ? LineUpFilterUtils.restoreLineUpFilter(parameter.value) : parameter.value;
          source[`set${prop}`].call(source, value);
          break;

        case LineUpTrackAndUntrackActions.grouping:
          // call different column methods dependending on column type
          if (source instanceof NumberColumn) {
            bak = source[`getGroupThresholds`]();
            source[`setGroupThresholds`].call(source, parameter.value);
          } else if (source instanceof StringColumn) {
            bak = source[`getGroupCriteria`]();
            source[`setGroupCriteria`].call(source, LineUpFilterUtils.restoreGroupByValue(parameter.value));
          } else if (source instanceof DateColumn) {
            bak = source[`getDateGrouper`]();
            source[`setDateGrouper`].call(source, parameter.value);
          }
          break;

        default:
          bak = source[`get${prop}`]();
          source[`set${prop}`].call(source, parameter.value);
          break;
      }
    }
    return waitForSorted({
      inverse: LineupTrackingManager.getInstance().setColumn(inputs[0], parameter.rid, parameter.path, parameter.prop, bak)
    });
  }

  public setColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, prop: string, value: any): IAction {
    // assert ALineUpView and update the stats
    provider.value.getInstance().updateLineUpStats();

    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.setProperty', {prop}), ObjectRefUtils.category.layout,  ObjectRefUtils.operation.update), LineUpCmds.CMD_SET_COLUMN, LineupTrackingManager.setColumnImpl, [provider], {
      rid,
      path,
      prop,
      value
    });
  }

  static async addColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    let parent: Ranking | CompositeColumn = ranking;

    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    const index: number = parameter.index;
    let bak = null;
    if (parameter.path) {
      parent = <CompositeColumn>ranking.findByPath(parameter.path);
    }
    if (parent) {
      if (parameter.dump) { //add
        LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_ADD_COLUMN;
        parent.insert(p.restoreColumn(parameter.dump), index);
      } else { //remove
        bak = parent.at(index);
        LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_REMOVE_COLUMN;
        parent.remove(bak);
      }
    }
    return waitForSorted({
      inverse: LineupTrackingManager.getInstance().addColumn(inputs[0], parameter.rid, parameter.path, index, parameter.dump || !bak ? null : p.dumpColumn(bak))
    });
  }

  static async moveColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    let parent: Ranking | CompositeColumn = ranking;
    const waitForSorted = LineupTrackingManager.getInstance().dirtyRankingWaiter(ranking);

    const index: number = parameter.index;
    const target: number = parameter.moveTo;
    let bak = null;
    if (parameter.path) {
      parent = <CompositeColumn>ranking.findByPath(parameter.path);
    }
    if (parent) {
      bak = parent.at(index);
      LineupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_MOVE_COLUMN;
      parent.move(bak, target);
    }
    return waitForSorted({
      //shift since indices shifted
      inverse: LineupTrackingManager.getInstance().moveColumn(inputs[0], parameter.rid, parameter.path, target, index > target ? index + 1 : target)
    });
  }

  public addColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, dump: any): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addColumn') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeColumn'), ObjectRefUtils.category.layout, dump ?  ObjectRefUtils.operation.create :  ObjectRefUtils.operation.remove), LineUpCmds.CMD_ADD_COLUMN, LineupTrackingManager.addColumnImpl, [provider], {
      rid,
      path,
      index,
      dump
    });
  }

  public moveColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, moveTo: number): IAction {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.moveColumn'), ObjectRefUtils.category.layout,  ObjectRefUtils.operation.update), LineUpCmds.CMD_MOVE_COLUMN, LineupTrackingManager.moveColumnImpl, [provider], {
      rid,
      path,
      index,
      moveTo
    });
  }

  /**
   * Wrap the callback with a function that delays the execution of the callback.
   * @param callback The provenance function that should be delayed
   * @param timeToDelay Number of milliseconds that callback call should be delayed (default = 100 ms)
   * @param thisCallback Provide a different `this` context for the callback
   * @returns Returns a function that wraps the callback with a setTimeout call to delay the execution
   */
  private delayedCall(callback: (oldValue: any, newValue: any) => void, timeToDelay = 100, thisCallback = this): (oldValue: any, newValue: any) => void {
    let tm = -1;
    let oldestValue = null;

    function callbackImpl(newValue) {
      callback.call(thisCallback, oldestValue, newValue);
      oldestValue = null;
      tm = -1;
    }

    return (oldValue: any, newValue: any) => {
      if (tm >= 0) {
        clearTimeout(tm);
        tm = -1;
      } else {
        oldestValue = oldValue;
      }
      tm = self.setTimeout(callbackImpl.bind(this, newValue), timeToDelay);
    };
  }

  /**
   * Returns the ID of the current ranking
   * @param provider LineUp local data provider
   * @param ranking LineUp ranking
   */
  private rankingId(provider: LocalDataProvider, ranking: Ranking): number {
    return provider.getRankings().indexOf(ranking);
  }

  /**
   * Adds an event listener for the given source and property. The tracking call can be delayed by some milliseconds.
   * @param source The column or ranking that is tracked
   * @param provider LineUp local data provider
   * @param objectRef The object reference that contains the LineUp data provider
   * @param graph The provenance graph where the events should be tracked into
   * @param property The name of the property that is tracked
   * @param delayed Number of milliseconds to delay the tracking call (default is -1 = immediately)
   * @param bufferOrExecute Function that immediately executes the action or buffers LineUp live preview events and executes them when a dialog is confirmed
   */
  private recordPropertyChange(source: Column | Ranking, provider: LocalDataProvider, objectRef: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, property: string, delayed = -1, bufferOrExecute?: bufferOrExecute): void {
    const eventListenerFunction = (oldValue: any, newValue: any) => {
      // wrap the execution in a separate function to buffer it if the `bufferOrExecute` is set
      const execute = (initialState = oldValue) => {
        if (LineupTrackingManager.getInstance().ignore(`${property}Changed`, objectRef)) {
          return;
        }

        if (property === LineUpTrackAndUntrackActions.filter) {
          newValue = LineUpFilterUtils.isLineUpStringFilter(newValue) ? LineUpFilterUtils.serializeLineUpFilter(newValue) : newValue; // serialize possible RegExp object to be properly stored as provenance graph
        }
        if (property === LineUpTrackAndUntrackActions.grouping && source instanceof StringColumn) { // only string columns can be grouped by RegExp
          newValue = LineUpFilterUtils.serializeGroupByValue(newValue); // serialize possible RegExp object to be properly stored as provenance graph
        }
        if (initialState !== undefined && isEqual(initialState, newValue)) {
          return;
        }

        // push to the prov graph with initial state as oldValue
        oldValue = initialState !== undefined ? initialState : oldValue;
        if (source instanceof Column) {
          // assert ALineUpView and update the stats
          objectRef.value.getInstance().updateLineUpStats();

          const rid = LineupTrackingManager.getInstance().rankingId(provider, source.findMyRanker());
          const path = source.fqpath;
          graph.pushWithResult(LineupTrackingManager.getInstance().setColumn(objectRef, rid, path, property, newValue), {
            inverse: LineupTrackingManager.getInstance().setColumn(objectRef, rid, path, property, initialState)
          });

        } else if (source instanceof Ranking) {
          const rid = LineupTrackingManager.getInstance().rankingId(provider, source);
          graph.pushWithResult(LineupTrackingManager.getInstance().setColumn(objectRef, rid, null, property, newValue), {
            inverse: LineupTrackingManager.getInstance().setColumn(objectRef, rid, null, property, initialState || oldValue)
          });
        }
      };

      if (bufferOrExecute) {
        const action = {
          name: property,
          execute
        };

        return bufferOrExecute(action, oldValue);
      }

      execute(); // execute immediately
    };

    source.on(LineupTrackingManager.getInstance().suffix(LineUpTrackAndUntrackActions.ChangedSuffix, property), delayed > 0 ? LineupTrackingManager.getInstance().delayedCall(eventListenerFunction, delayed) : eventListenerFunction);
  }

  /**
   * Adds the event listeners to track column events in the provenance graph.
   * @param provider LineUp local data provider
   * @param objectRef The object reference that contains the LineUp data provider
   * @param graph The provenance graph where the events should be tracked into
   * @param col The column instance that should be tracked
   * @param bufferOrExecute Function that immediately executes the action or buffers LineUp live preview events and executes them when a dialog is confirmed
   */
  private trackColumn(provider: LocalDataProvider, objectRef: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, col: Column, bufferOrExecute: bufferOrExecute): void {
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.metaData);
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.filter, null, bufferOrExecute);
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.rendererType, null, bufferOrExecute);
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.groupRenderer, null, bufferOrExecute);
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.summaryRenderer, null, bufferOrExecute);
    LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.sortMethod, null, bufferOrExecute);
    //recordPropertyChange(col, provider, lineup, graph, LineUpTrackAndUntrackActions.width, 100);

    if (col instanceof CompositeColumn) {
      col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index: number) => {
        LineupTrackingManager.getInstance().trackColumn(provider, objectRef, graph, column, bufferOrExecute);
        if (LineupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_ADD_COLUMN, objectRef)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const d = provider.dumpColumn(column);
        const rid = LineupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LineupTrackingManager.getInstance().addColumn(objectRef, rid, path, index, d), {
          inverse: LineupTrackingManager.getInstance().addColumn(objectRef, rid, path, index, null)
        });
      });
      col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index: number) => {
        LineupTrackingManager.getInstance().untrackColumn(column);
        if (LineupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_REMOVE_COLUMN, objectRef)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const d = provider.dumpColumn(column);
        const rid = LineupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LineupTrackingManager.getInstance().addColumn(objectRef, rid, path, index, null), {
          inverse: LineupTrackingManager.getInstance().addColumn(objectRef, rid, path, index, d)
        });
      });

      col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index: number, oldIndex: number) => {
        if (LineupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_MOVE_COLUMN, objectRef)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const rid = LineupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LineupTrackingManager.getInstance().moveColumn(objectRef, rid, path, oldIndex, index), {
          inverse: LineupTrackingManager.getInstance().moveColumn(objectRef, rid, path, index, oldIndex > index ? oldIndex + 1 : oldIndex)
        });
      });
      col.children.forEach(LineupTrackingManager.getInstance().trackColumn.bind(this, provider, objectRef, graph));

      if (col instanceof StackColumn) {
        LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, 'weights', 100);
      }

    } else if (col instanceof NumberColumn) {
      LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.grouping, null, bufferOrExecute);
      col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, (old, newValue) => {
        if (LineupTrackingManager.getInstance().ignore(NumberColumn.EVENT_MAPPING_CHANGED, objectRef)) {
          return;
        }
        const rid = LineupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LineupTrackingManager.getInstance().setColumn(objectRef, rid, path, LineUpTrackAndUntrackActions.mapping, newValue.toJSON()), {
          inverse: LineupTrackingManager.getInstance().setColumn(objectRef, rid, path, LineUpTrackAndUntrackActions.mapping, old.toJSON())
        });
      });

    } else if (col instanceof ScriptColumn) {
      LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.script, null, bufferOrExecute);

    } else if (col instanceof OrdinalColumn) {
      LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.mapping);
    } else if (col instanceof StringColumn || col instanceof DateColumn) {
      LineupTrackingManager.getInstance().recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.grouping, null, bufferOrExecute);
    }
  }

  /**
   * Removes the event listener from the provided column
   * @param col Column
   */
  private untrackColumn(col: Column) {
    col.on(LineupTrackingManager.getInstance().suffix(LineUpTrackAndUntrackActions.ChangedSuffix, LineUpTrackAndUntrackActions.metaData, LineUpTrackAndUntrackActions.filter, LineUpTrackAndUntrackActions.width, LineUpTrackAndUntrackActions.rendererType, LineUpTrackAndUntrackActions.groupRenderer, LineUpTrackAndUntrackActions.summaryRenderer, LineUpTrackAndUntrackActions.sortMethod), null);

    if (col instanceof CompositeColumn) {
      col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
      col.children.forEach(LineupTrackingManager.getInstance().untrackColumn);
    } else if (col instanceof NumberColumn) {
      col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, null);
      col.on(`${NumberColumn.EVENT_GROUPING_CHANGED}.track`, null);
    } else if (col instanceof ScriptColumn) {
      col.on(`${ScriptColumn.EVENT_SCRIPT_CHANGED}.track`, null);
    } else if (col instanceof StringColumn || col instanceof DateColumn) {
      col.on(`${StringColumn.EVENT_GROUPING_CHANGED}.track`, null);
    }
  }

  /**
   * Adds the event listeners to ranking events and adds event listeners for all columns of that ranking.
   * @param provider LineUp local data provider
   * @param objectRef The object reference that contains the LineUp data provider
   * @param graph The provenance graph where the events should be tracked into
   * @param ranking The current ranking that should be tracked
   */
  private trackRanking(lineup: EngineRenderer | TaggleRenderer, provider: LocalDataProvider, objectRef: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, ranking: Ranking): void {

    // Map containing the initial state/value (before the dialog was opened) of the actions that are buffered.
    // Use this initial value to compare it to the last saved action. So if you open the filter dialog and the final result
    // is the same as it was before the dialog was opened, do not execute this action.
    const initialStates = new Map<string, string>();

    // First time an action is buffered save the initial value of the ranking and compare it to the final action.
    // If there is no difference between final action state and initial state before opening the dialog, don't execute.
    const bufferedActions = new Map<string, IBufferedAction>();

    // Is there any dialog open?
    let isDialogOpen: boolean = false;

    // When dialog is closed empty the buffered actions
    const emptyBufferedActions = () => {
      bufferedActions.clear();
      initialStates.clear();
    };

    // Save the onclick callback and the initial value of the actions that have a live preview.
    // Execute the callback when the dialog is confirmed passing the initial value as the old state.
    // If a dialog contains multiple actions like the visualization dialog, save all three actions and execute all three on confirm.
    const bufferLivePreviewActions = (action: IBufferedAction, initialValue: any) => {
      bufferedActions.set(action.name, action);
      if (initialStates.has(action.name)) {
        return;
      }
      initialStates.set(action.name, initialValue);
    };

    // If there has been a dialog opened (`isDialogOpen === true`) buffer the current action and execute if dialog is confirmed.
    // Otherwise execute action immediately.
    const bufferOrExecute = (action: IBufferedAction, initialValue: any, isActionBuffered: boolean = isDialogOpen) => {
      return isActionBuffered ? bufferLivePreviewActions(action, initialValue) : action.execute();
    };

    // Empty any buffered actions and set `isDialogOpen = true`. Necessary for actions that have a popup dialog and none (e.g., sort, group by).
    lineup.on(`${EngineRenderer.EVENT_DIALOG_OPENED}.track`, () => {
      isDialogOpen = true;
      emptyBufferedActions();
    });

    lineup.on(`${EngineRenderer.EVENT_DIALOG_CLOSED}.track`, (_dialog, dialogAction: 'cancel' | 'confirm') => {
      if (dialogAction === 'confirm' && bufferedActions.size > 0) {
        bufferedActions.forEach((action, name) => {
          action.execute(initialStates.get(name));
        });
      }

      emptyBufferedActions();
      isDialogOpen = false;
    });

    // Close all dialogs before executing any provenance action or run the provenance chain
    // (otherwise actions would be buffered while a dialog is open and result in a wrong application state)
    graph.on('run_chain', () => {
      lineup.ctx.dialogManager.removeAll();
    });

    // Close dialogs also when executing new provenance actions
    graph.on('execute', (_event, action: ActionNode) => {
      // Dialogs do not need to be closed for LineUp actions, since the dialog events are handled
      // separately for each ranking above (see EVENT_DIALOG_CLOSED and EVENT_DIALOG_OPENED).
      if (Object.values(LineUpCmds).some((cmd) => action.f_id === cmd)) {
        return;
      }

      // close open dialogs if a non-LineUp action occurs, to avoid side effects
      lineup.ctx.dialogManager.removeAll();
    });

    ranking.on(`${Ranking.EVENT_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
      // wrap the execution in a function to buffer it if a dialog is open
      const execute = (initialState: ISortCriteria[] = old) => {
        if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, objectRef)) {
          return;
        }

        // cancel the execution if nothing has changed
        if (isEqual(initialState.map(LineupTrackingManager.getInstance().toSortObject), newValue.map(LineupTrackingManager.getInstance().toSortObject))) {
          return;
        }

        const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
        graph.pushWithResult(LineupTrackingManager.getInstance().setSortCriteria(objectRef, rid, newValue.map(LineupTrackingManager.getInstance().toSortObject)), {
          inverse: LineupTrackingManager.getInstance().setSortCriteria(objectRef, rid, initialState.map(LineupTrackingManager.getInstance().toSortObject))
        });
      };

      const action = {
        name: 'sortCriteria',
        execute
      };

      bufferOrExecute(action, old, isDialogOpen);
    });

    ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
      // wrap the execution in a function to buffer it if a dialog is open
      const execute = (initialState: ISortCriteria[] = old) => {
        if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, objectRef)) {
          return;
        }

        // cancel the execution if nothing has changed
        if (isEqual(initialState.map(LineupTrackingManager.getInstance().toSortObject), newValue.map(LineupTrackingManager.getInstance().toSortObject))) {
          return;
        }

        const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
        graph.pushWithResult(LineupTrackingManager.getInstance().setSortCriteria(objectRef, rid, newValue.map(LineupTrackingManager.getInstance().toSortObject), false), {
          inverse: LineupTrackingManager.getInstance().setSortCriteria(objectRef, rid, initialState.map(LineupTrackingManager.getInstance().toSortObject), false)
        });
      };

      const action = {
        name: 'groupSortCriteria',
        execute
      };

      bufferOrExecute(action, old, isDialogOpen);
    });

    ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old: Column[], newValue: Column[]) => {
      // wrap the execution in a function to buffer it if a dialog is open
      const execute = (initialState: Column[] = old) => {
        if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, objectRef)) {
          return;
        }

        // cancel the execution if nothing has changed
        if (isEqual(initialState, newValue)) {
          return;
        }

        const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
        graph.pushWithResult(LineupTrackingManager.getInstance().setGroupCriteria(objectRef, rid, newValue.map((c) => c.fqpath)), {
          inverse: LineupTrackingManager.getInstance().setGroupCriteria(objectRef, rid, initialState.map((c) => c.fqpath))
        });
      };

      const action = {
        name: 'groupCriteria',
        execute
      };

      bufferOrExecute(action, old, isDialogOpen);
    });

    ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column: Column, index: number) => {
      LineupTrackingManager.getInstance().trackColumn(provider, objectRef, graph, column, bufferOrExecute);

      if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_ADD_COLUMN, objectRef)) {
        return;
      }

      // console.log(ranking, 'addColumn', column, index);

      const d = provider.dumpColumn(column);
      const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LineupTrackingManager.getInstance().addColumn(objectRef, rid, null, index, d), {
        inverse: LineupTrackingManager.getInstance().addColumn(objectRef, rid, null, index, null)
      });
    });

    ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column: Column, index: number) => {
      LineupTrackingManager.getInstance().untrackColumn(column);

      if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_REMOVE_COLUMN, objectRef)) {
        return;
      }

      // console.log(ranking, 'removeColumn', column, index);

      const d = provider.dumpColumn(column);
      const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LineupTrackingManager.getInstance().addColumn(objectRef, rid, null, index, null), {
        inverse: LineupTrackingManager.getInstance().addColumn(objectRef, rid, null, index, d)
      });
    });

    ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index: number, oldIndex: number) => {
      if (LineupTrackingManager.getInstance().ignore(Ranking.EVENT_MOVE_COLUMN, objectRef)) {
        return;
      }

      // console.log(col.fqpath, 'addColumn', column, index);

      const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LineupTrackingManager.getInstance().moveColumn(objectRef, rid, null, oldIndex, index), {
        inverse: LineupTrackingManager.getInstance().moveColumn(objectRef, rid, null, index, oldIndex > index ? oldIndex + 1 : oldIndex)
      });
    });

    provider.on(`${LocalDataProvider.EVENT_GROUP_AGGREGATION_CHANGED}.track`, (ranking: Ranking, groups: IGroup | IGroup[], previousTopN: number | number[], currentTopN: number) => {
      if (LineupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_GROUP_AGGREGATION_CHANGED, objectRef)) {
        return;
      }

      const rid = LineupTrackingManager.getInstance().rankingId(provider, ranking);
      const groupNames = Array.isArray(groups) ? groups.map((g) => g.name) : groups.name;

      graph.pushWithResult(LineupTrackingManager.getInstance().setAggregation(objectRef, rid, groupNames, currentTopN), {
        inverse: LineupTrackingManager.getInstance().setAggregation(objectRef, rid, groupNames, previousTopN)
      });
    });

    ranking.children.forEach((col) => LineupTrackingManager.getInstance().trackColumn(provider, objectRef, graph, col, bufferOrExecute));
  }

  /**
   * Removes the event listener for ranking events from the provided ranking
   * @param ranking LineUp Ranking
   */
  private untrackRanking(ranking: Ranking) {
    ranking.on(LineupTrackingManager.getInstance().suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
    ranking.children.forEach(LineupTrackingManager.getInstance().untrackColumn);
  }

  /**
   * Clueifies the given LineUp instance. Adds event listeners to track add and remove rankings
   * from the local data provider and adds event listeners for ranking events.
   * @param lineup: The LineUp instance
   * @param objectRef The object reference that contains the LineUp data provider
   * @param graph The provenance graph where the events should be tracked into
   * @returns Returns a promise that is waiting for the object reference (LineUp instance)
   */
  public async clueify(lineup: EngineRenderer | TaggleRenderer, objectRef: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph): Promise<void> {
    const p = await ResolveNow.resolveImmediately((await objectRef.v).data);
    p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking: Ranking, index: number) => {
      if (LineupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_ADD_RANKING, objectRef)) {
        return;
      }
      const rankingDump = ranking.dump(p.toDescRef.bind(p));
      graph.pushWithResult(LineupTrackingManager.getInstance().addRanking(objectRef, index, rankingDump), {
        inverse: LineupTrackingManager.getInstance().addRanking(objectRef, index, null)
      });
      LineupTrackingManager.getInstance().trackRanking(lineup, p, objectRef, graph, ranking);
    });

    p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking: Ranking, index: number) => {
      if (LineupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_REMOVE_RANKING, objectRef)) {
        return;
      }
      const rankingDump = ranking.dump(p.toDescRef.bind(p));
      graph.pushWithResult(LineupTrackingManager.getInstance().addRanking(objectRef, index, null), {
        inverse: LineupTrackingManager.getInstance().addRanking(objectRef, index, rankingDump)
      });
      LineupTrackingManager.getInstance().untrackRanking(ranking);
    });

    // track further ranking event
    p.getRankings().forEach(LineupTrackingManager.getInstance().trackRanking.bind(this, lineup, p, objectRef, graph));
  }

  /**
   * Removes the event listener for adding and removing a ranking from the provided LineUp instance.
   * @param objectRef The object reference that contains the LineUp data provider
   * @returns Returns a promise that is waiting for the object reference (LineUp instance)
   */
  public async untrack(objectRef: IObjectRef<IViewProviderLocal>): Promise<void> {
    const p = await ResolveNow.resolveImmediately((await objectRef.v).data);
    p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
    p.getRankings().forEach(LineupTrackingManager.getInstance().untrackRanking);
  }

  /**
   * Execute a given LineUp function without being tracked by the provenance graph
   * @param objectRef The object reference that contains the LineUp data provider
   * @param func Function that is executed without provenance tracking
   * @returns Returns a promise that is waiting for the object reference (LineUp instance)
   */
  public withoutTracking<T>(objectRef: IObjectRef<IViewProviderLocal>, func: () => T): PromiseLike<T> {
    return objectRef.v.then((d) => ResolveNow.resolveImmediately(d.data)).then((p) => {
      LineupTrackingManager.getInstance().temporaryUntracked.add(objectRef.hash);
      const r = func();
      LineupTrackingManager.getInstance().temporaryUntracked.delete(objectRef.hash);
      return r;
    });
  }

  /**
   * Adds a given suffix to the list of following parameters (prefix)
   * @param suffix Suffix string that is appended to each prefix
   * @param prefix Multiple parameters that should get the suffix
   * @returns List of combined prefixes with suffixes
   */
  private suffix(suffix: string, ...prefix: string[]): string[] {
    return prefix.map((p) => `${p}${suffix}`);
  }

  private static instance: LineupTrackingManager;

  public static getInstance(): LineupTrackingManager {
    if (!LineupTrackingManager.instance) {
      LineupTrackingManager.instance = new LineupTrackingManager();
    }
    return LineupTrackingManager.instance;
  }
}
