/**
 * Created by Samuel Gratzl on 18.05.2016.
 */


import {IObjectRef, action, meta, cat, op, ProvenanceGraph, ICmdResult} from 'phovea_core/src/provenance';
import {EngineRenderer, TaggleRenderer, ADialog, NumberColumn, LocalDataProvider, StackColumn, ScriptColumn, OrdinalColumn, CompositeColumn, Ranking, ISortCriteria, Column, isMapAbleColumn, mappingFunctions} from 'lineupjs';
import {resolveImmediately} from 'phovea_core/src';
import i18n from 'phovea_core/src/i18n';
import {isEqual} from 'lodash';


// used for function calls in the context of tracking or untracking actions in the provenance graph in order to get a consistent defintion of the used strings
enum LineUpTrackAndUntrackActions {
  metaData = 'metaData',
  filter = 'filter',
  rendererType = 'rendererType', // important: the corresponding functions in LineUp are called `getRenderer` and `setRenderer` (see `setColumnImpl()` below)
  groupRenderer = 'groupRenderer',
  summaryRenderer = 'summaryRenderer',
  sortMethod = 'sortMethod',
  ChangedFilter = 'Changed.filter',
  width = 'width',
}

const CMD_SET_SORTING_CRITERIA = 'lineupSetRankingSortCriteria';
const CMD_SET_SORTING_CRITERIAS = 'lineupSetSortCriteria';
const CMD_SET_GROUP_CRITERIA = 'lineupSetGroupCriteria';
const CMD_ADD_RANKING = 'lineupAddRanking';
const CMD_SET_COLUMN = 'lineupSetColumn';
const CMD_ADD_COLUMN = 'lineupAddColumn';
const CMD_MOVE_COLUMN = 'lineupMoveColumn';

//TODO better solution
let ignoreNext: string = null;

/**
 * set of data provider to ignore
 * @type {Set<LocalDataProvider>}
 */
const temporaryUntracked = new Set<string>();

/**
 * Check if the given event should be ignored.
 * Events are ignored when the event name is:
 * 1. stored in the `ignoreNext`; the variable is set to `null` in this function call
 * 2. or listed in the `temporaryUntracked`
 * @param event The event name
 * @param objectRef The object reference that contains the LineUp data provider
 * @returns Returns `true` if the event should be ignored. Otherwise returns `false`.
 */
function ignore(event: string, objectRef: IObjectRef<IViewProvider>): boolean {
  if (ignoreNext === event) {
    ignoreNext = null;
    return true;
  }
  return temporaryUntracked.has(objectRef.hash);
}

/**
 * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
 * @param ranking
 */
function dirtyRankingWaiter(ranking: Ranking): (undo: ICmdResult) => ICmdResult | Promise<ICmdResult> {
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

export async function addRankingImpl(inputs: IObjectRef<any>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const index: number = parameter.index;

  if (!parameter.dump) { // remove
    const ranking = p.getRankings()[index];
    ignoreNext = LocalDataProvider.EVENT_REMOVE_RANKING;
    p.removeRanking(ranking);
    return {
      inverse: addRanking(inputs[0], parameter.index, ranking.dump(p.toDescRef))
    };
  }

  // add
  ignoreNext = LocalDataProvider.EVENT_ADD_RANKING;
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
    inverse: addRanking(inputs[0], parameter.index, null)
  }));
}

export function addRanking(provider: IObjectRef<any>, index: number, dump?: any) {
  return action(meta(dump ? i18n.t('tdp:core.lineup.cmds.addRanking') : i18n.t('tdp:core.lineup.cmds.removeRanking'), cat.layout, dump ? op.create : op.remove), CMD_ADD_RANKING, addRankingImpl, [provider], {
    index,
    dump
  });
}

function toSortObject(v) {
  return {asc: v.asc, col: v.col ? v.col.fqpath : null};
}

export async function setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];
  const bak = toSortObject(ranking.getSortCriteria());
  ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
  //expects just null not undefined
  const waitForSorted = dirtyRankingWaiter(ranking);
  ranking.sortBy(parameter.value.col ? (ranking.findByPath(parameter.value.col) || null) : null, parameter.value.asc);

  return waitForSorted({
    inverse: setRankingSortCriteria(inputs[0], parameter.rid, bak)
  });
}


export function setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any) {
  return action(meta(i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), cat.layout, op.update), CMD_SET_SORTING_CRITERIA, setRankingSortCriteriaImpl, [provider], {
    rid,
    value
  });
}

export async function setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];

  const waitForSorted = dirtyRankingWaiter(ranking);

  let current: ISortCriteria[];
  const columns: ISortCriteria[] = parameter.columns.map((c) => ({col: ranking.findByPath(c.col), asc: c.asc}));
  if (parameter.isSorting) {
    current = ranking.getSortCriteria();
    ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
    ranking.setSortCriteria(columns);
  } else {
    current = ranking.getGroupSortCriteria();
    ignoreNext = Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED;
    ranking.setGroupSortCriteria(columns);
  }
  return waitForSorted({
    inverse: setSortCriteria(inputs[0], parameter.rid, current.map(toSortObject), parameter.isSorting)
  });
}


export function setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {asc: boolean, col: string}[], isSorting = true) {
  return action(meta(i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), cat.layout, op.update), CMD_SET_SORTING_CRITERIAS, setSortCriteriaImpl, [provider], {
    rid,
    columns,
    isSorting
  });
}

export async function setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];
  const current = ranking.getGroupCriteria().map((d) => d.fqpath);
  const columns = parameter.columns.map((p) => ranking.findByPath(p));
  ignoreNext = Ranking.EVENT_GROUP_CRITERIA_CHANGED;

  const waitForSorted = dirtyRankingWaiter(ranking);
  ranking.setGroupCriteria(columns);
  return waitForSorted({
    inverse: setGroupCriteria(inputs[0], parameter.rid, current)
  });
}

export function setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]) {
  return action(meta(i18n.t('tdp:core.lineup.cmds.changeGroupCriteria'), cat.layout, op.update), CMD_SET_GROUP_CRITERIA, setGroupCriteriaImpl, [provider], {
    rid,
    columns
  });
}

export async function setColumnImpl(inputs: IObjectRef<any>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];
  const prop = parameter.prop[0].toUpperCase() + parameter.prop.slice(1);

  let bak = null;
  const waitForSorted = dirtyRankingWaiter(ranking);
  let source: Column | Ranking = ranking;
  if (parameter.path) {
    source = ranking.findByPath(parameter.path);
  }
  ignoreNext = `${parameter.prop}Changed`;
  if (parameter.prop === 'mapping' && source instanceof Column && isMapAbleColumn(source)) {
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
      default:
        bak = source[`get${prop}`]();
        source[`set${prop}`].call(source, restoreRegExp(parameter.value)); // restore serialized regular expression before passing to LineUp
        break;
    }
  }

  return waitForSorted({
    inverse: setColumn(inputs[0], parameter.rid, parameter.path, parameter.prop, bak)
  });
}

export interface IViewProvider {
  data: LocalDataProvider;

  getInstance(): {updateLineUpStats()};
}

export function setColumn(provider: IObjectRef<IViewProvider>, rid: number, path: string, prop: string, value: any) {
  // assert ALineUpView and update the stats
  provider.value.getInstance().updateLineUpStats();

  return action(meta(i18n.t('tdp:core.lineup.cmds.setProperty', {prop}), cat.layout, op.update), CMD_SET_COLUMN, setColumnImpl, [provider], {
    rid,
    path,
    prop,
    value
  });
}

export async function addColumnImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];
  let parent: Ranking | CompositeColumn = ranking;

  const waitForSorted = dirtyRankingWaiter(ranking);
  const index: number = parameter.index;
  let bak = null;
  if (parameter.path) {
    parent = <CompositeColumn>ranking.findByPath(parameter.path);
  }
  if (parent) {
    if (parameter.dump) { //add
      ignoreNext = Ranking.EVENT_ADD_COLUMN;
      parent.insert(p.restoreColumn(parameter.dump), index);
    } else { //remove
      bak = parent.at(index);
      ignoreNext = Ranking.EVENT_REMOVE_COLUMN;
      parent.remove(bak);
    }
  }
  return waitForSorted({
    inverse: addColumn(inputs[0], parameter.rid, parameter.path, index, parameter.dump || !bak ? null : p.dumpColumn(bak))
  });
}

export async function moveColumnImpl(inputs: IObjectRef<IViewProvider>[], parameter: any) {
  const p: LocalDataProvider = await resolveImmediately((await inputs[0].v).data);
  const ranking = p.getRankings()[parameter.rid];
  let parent: Ranking | CompositeColumn = ranking;
  const waitForSorted = dirtyRankingWaiter(ranking);

  const index: number = parameter.index;
  const target: number = parameter.moveTo;
  let bak = null;
  if (parameter.path) {
    parent = <CompositeColumn>ranking.findByPath(parameter.path);
  }
  if (parent) {
    bak = parent.at(index);
    ignoreNext = Ranking.EVENT_MOVE_COLUMN;
    parent.move(bak, target);
  }
  return waitForSorted({
    //shift since indices shifted
    inverse: moveColumn(inputs[0], parameter.rid, parameter.path, target, index > target ? index + 1 : target)
  });
}

export function addColumn(provider: IObjectRef<IViewProvider>, rid: number, path: string, index: number, dump: any) {
  return action(meta(dump ? i18n.t('tdp:core.lineup.cmds.addColumn') : i18n.t('tdp:core.lineup.cmds.removeColumn'), cat.layout, dump ? op.create : op.remove), CMD_ADD_COLUMN, addColumnImpl, [provider], {
    rid,
    path,
    index,
    dump
  });
}

export function moveColumn(provider: IObjectRef<IViewProvider>, rid: number, path: string, index: number, moveTo: number) {
  return action(meta(i18n.t('tdp:core.lineup.cmds.moveColumn'), cat.layout, op.update), CMD_MOVE_COLUMN, moveColumnImpl, [provider], {
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
 */
function delayedCall(callback: (oldValue: any, newValue: any) => void, timeToDelay = 100, thisCallback = this): (oldValue: any, newValue: any) => void {
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
function rankingId(provider: LocalDataProvider, ranking: Ranking): number {
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
 */
function recordPropertyChange(source: Column | Ranking, provider: LocalDataProvider, objectRef: IObjectRef<IViewProvider>, graph: ProvenanceGraph, property: string, delayed = -1, bufferLivePreviewActions?: bufferLivePreviewActions): void {
  const func = (oldValue: any, newValue: any) => {
    const execute = (initialState = oldValue) => {
      if (ignore(`${property}Changed`, objectRef)) {
        return;
      }
      const newSerializedValue = serializeRegExp(newValue); // serialize possible RegExp object to be properly stored as provenance graph
      if (initialState !== undefined && isEqual(initialState, newSerializedValue)) {
        return;
      }
      // push to the prov graph with initial state as oldValue
      oldValue = initialState !== undefined ? initialState : oldValue;
      if (source instanceof Column) {
        // assert ALineUpView and update the stats
        objectRef.value.getInstance().updateLineUpStats();

        const rid = rankingId(provider, source.findMyRanker());
        const path = source.fqpath;
        graph.pushWithResult(setColumn(objectRef, rid, path, property, newSerializedValue), {
          inverse: setColumn(objectRef, rid, path, property, initialState)
        });

      } else if (source instanceof Ranking) {
        const rid = rankingId(provider, source);
        graph.pushWithResult(setColumn(objectRef, rid, null, property, newSerializedValue), {
          inverse: setColumn(objectRef, rid, null, property, initialState || oldValue)
        });
      }
    };

    if (bufferLivePreviewActions) {
      const action = {
        name: property,
        execute
      };

      return bufferLivePreviewActions(action, oldValue);
    }

    execute();
  };

  source.on(`${property}Changed.track`, delayed > 0 ? delayedCall(func, delayed) : func);
}

/**
 * Serialize RegExp objects from LineUp string columns as plain object
 * that can be stored in the provenance graph
 */
interface IRegExpFilter {
  /**
   * RegExp as string
   */
  value: string;
  /**
   * Flag to indicate the value should be restored as RegExp
   */
  isRegExp: boolean;
}

/**
 * Serializes RegExp objects to an IRegexFilter object, which can be stored in the provenance graph.
 * In case a string is passed to this function no serialization is applied.
 *
 * Background information:
 * The serialization step is necessary, because RegExp objects are converted into an empty object `{}` on `JSON.stringify`.
 * ```
 * JSON.stringify(/^123$/gm); // result: {}
 * ```
 *
 * @param value Input string or RegExp object
 * @returns {string | IRegExpFilter} Returns the input string or a plain `IRegExpFilter` object
 */
function serializeRegExp(value: string | RegExp): string | IRegExpFilter {
  if (!(value instanceof RegExp)) {
    return value;
  }
  return {value: value.toString(), isRegExp: true};
}

/**
 * Restores a RegExp object from a given IRegExpFilter object.
 * In case a string is passed to this function no deserialization is applied.
 *
 * @param filter Filter as string or plain object matching the IRegExpFilter
 * @returns {string | RegExp| null} Returns the input string or the restored RegExp object
 */
function restoreRegExp(filter: string | IRegExpFilter): string | RegExp {
  if (filter === null || !(<IRegExpFilter>filter).isRegExp) {
    return <string | null>filter;
  }

  const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
  const matches = serializedRegexParser.exec((<IRegExpFilter>filter).value);
  const [_full, regexString, regexFlags] = matches;
  return new RegExp(regexString, regexFlags);
}

/**
 * Adds the event listeners to track column events in the provenance graph.
 * @param provider LineUp local data provider
 * @param objectRef The object reference that contains the LineUp data provider
 * @param graph The provenance graph where the events should be tracked into
 * @param col The column instance that should be tracked
 */
function trackColumn(provider: LocalDataProvider, objectRef: IObjectRef<IViewProvider>, graph: ProvenanceGraph, col: Column, bufferLivePreviewActions: bufferLivePreviewActions) {
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.metaData);
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.filter, null, bufferLivePreviewActions);
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.rendererType, null, bufferLivePreviewActions);
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.groupRenderer, null, bufferLivePreviewActions);
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.summaryRenderer, null, bufferLivePreviewActions);
  recordPropertyChange(col, provider, objectRef, graph, LineUpTrackAndUntrackActions.sortMethod, null, bufferLivePreviewActions);
  //recordPropertyChange(col, provider, lineup, graph, 'width', 100);

  if (col instanceof CompositeColumn) {
    col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index: number) => {
      trackColumn(provider, objectRef, graph, column, bufferLivePreviewActions);
      if (ignore(CompositeColumn.EVENT_ADD_COLUMN, objectRef)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(addColumn(objectRef, rid, path, index, d), {
        inverse: addColumn(objectRef, rid, path, index, null)
      });
    });
    col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index: number) => {
      untrackColumn(column);
      if (ignore(CompositeColumn.EVENT_REMOVE_COLUMN, objectRef)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(addColumn(objectRef, rid, path, index, null), {
        inverse: addColumn(objectRef, rid, path, index, d)
      });
    });

    col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index: number, oldIndex: number) => {
      if (ignore(CompositeColumn.EVENT_MOVE_COLUMN, objectRef)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(moveColumn(objectRef, rid, path, oldIndex, index), {
        inverse: moveColumn(objectRef, rid, path, index, oldIndex > index ? oldIndex + 1 : oldIndex)
      });
    });
    col.children.forEach(trackColumn.bind(this, provider, objectRef, graph));

    if (col instanceof StackColumn) {
      recordPropertyChange(col, provider, objectRef, graph, 'weights', 100);
    }

  } else if (col instanceof NumberColumn) {
    col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, (old, newValue) => {
      if (ignore(NumberColumn.EVENT_MAPPING_CHANGED, objectRef)) {
        return;
      }
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(setColumn(objectRef, rid, path, 'mapping', newValue.toJSON()), {
        inverse: setColumn(objectRef, rid, path, 'mapping', old.toJSON())
      });
    });

  } else if (col instanceof ScriptColumn) {
    recordPropertyChange(col, provider, objectRef, graph, 'script', null, bufferLivePreviewActions);

  } else if (col instanceof OrdinalColumn) {
    recordPropertyChange(col, provider, objectRef, graph, 'mapping');
  }
}

/**
 * Removes the event listener from the provided column
 * @param col Column
 */
function untrackColumn(col: Column) {
  col.on(suffix(LineUpTrackAndUntrackActions.ChangedFilter, LineUpTrackAndUntrackActions.metaData, LineUpTrackAndUntrackActions.filter, LineUpTrackAndUntrackActions.width, LineUpTrackAndUntrackActions.rendererType, LineUpTrackAndUntrackActions.groupRenderer, LineUpTrackAndUntrackActions.summaryRenderer, LineUpTrackAndUntrackActions.sortMethod), null);

  if (col instanceof CompositeColumn) {
    col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
    col.children.forEach(untrackColumn);
  } else if (col instanceof NumberColumn) {
    col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, null);
  } else if (col instanceof ScriptColumn) {
    col.on(`${ScriptColumn.EVENT_SCRIPT_CHANGED}.track`, null);
  }
}

/**
 * Save the buffered action so it can be executed when dialog is confirmed
 */
interface IBufferedAction {
  /**
   * Name of the action, i.e:, `filter`
   */
  name: string;
  /**
   * Push action to provenance graph
   */
  execute: (initialValue?: unknown) => void;
}

type bufferLivePreviewActions = (action: IBufferedAction, initialValue: any) => void;
/**
 * Adds the event listeners to ranking events and adds event listeners for all columns of that ranking.
 * @param provider LineUp local data provider
 * @param objectRef The object reference that contains the LineUp data provider
 * @param graph The provenance graph where the events should be tracked into
 * @param ranking The current ranking that should be tracked
 */
function trackRanking(lineup: EngineRenderer | TaggleRenderer, provider: LocalDataProvider, objectRef: IObjectRef<IViewProvider>, graph: ProvenanceGraph, ranking: Ranking): void {

  // First time an action is buffered save the initial value of the ranking and compare it to the final action.
  // If there is no difference between final action state and initial state before opening the dialog, don't execute.
  const initialStates = new Map<string, string>();
  const bufferedActions = new Map<string, IBufferedAction>();
  let openDialog: boolean;

  const emptyBufferedActions = () => {
    bufferedActions.clear();
    initialStates.clear();
  };

  // Pass callback to actions that have a live preview. Instead of pushing said actions directly to the provenance graph,
  // buffer it and execute when the confirm button is clicked on the dialog.
  // If a dialog contains multiple actions like the visualization dialog save all three actions and execute on confirm.
  const bufferLivePreviewActions = (action: IBufferedAction, initialValue: any) => {
    bufferedActions.set(action.name, action);
    if (initialStates.has(action.name)) {
      return;
    }
    initialStates.set(action.name, initialValue);
  };

  const bufferOrExecute = (action: IBufferedAction, initialValue: ISortCriteria[] | Column[], buffer: boolean) => {
    return buffer ? bufferLivePreviewActions(action, initialValue) : action.execute();
  };

  // Empty any buffered actions and set `openDialog:true`.Necessary for actions that have a popup dialog and none.
  lineup.on(`${EngineRenderer.EVENT_DIALOG_OPENED}.track`, () => {
    openDialog = true;
    emptyBufferedActions();
  });

  lineup.on(`${EngineRenderer.EVENT_DIALOG_CLOSED}.track`, (_, dialogAction: 'cancel' | 'confirm') => {
    if (dialogAction === 'confirm' && bufferedActions.size) {
      bufferedActions.forEach((action, name) => {
        action.execute(initialStates.get(name));
      });
    }
    emptyBufferedActions();
    openDialog = false;
  });


  ranking.on(`${Ranking.EVENT_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {

    const execute = (initialState: ISortCriteria[] = old) => {
      if (ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, objectRef)) {
        return;
      }

      if (isEqual(initialState.map(toSortObject), newValue.map(toSortObject))) {
        return;
      }

      const rid = rankingId(provider, ranking);
      graph.pushWithResult(setSortCriteria(objectRef, rid, newValue.map(toSortObject)), {
        inverse: setSortCriteria(objectRef, rid, initialState.map(toSortObject))
      });
    };

    const action = {
      name: 'sortCriteria',
      execute
    };

    bufferOrExecute(action, old, openDialog);
  });

  ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
    const execute = (initialState: ISortCriteria[] = old) => {
      if (ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, objectRef)) {
        return;
      }
      if (isEqual(initialState.map(toSortObject), newValue.map(toSortObject))) {
        return;
      }
      const rid = rankingId(provider, ranking);
      graph.pushWithResult(setSortCriteria(objectRef, rid, newValue.map(toSortObject), false), {
        inverse: setSortCriteria(objectRef, rid, initialState.map(toSortObject), false)
      });
    };
    const action = {
      name: 'groupSortCriteria',
      execute
    };

    bufferOrExecute(action, old, openDialog);
  });

  ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old: Column[], newValue: Column[]) => {
    const execute = (initialState: Column[] = old) => {
      if (ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, objectRef)) {
        return;
      }

      if (isEqual(initialState, newValue)) {
        return;
      }
      const rid = rankingId(provider, ranking);
      graph.pushWithResult(setGroupCriteria(objectRef, rid, newValue.map((c) => c.fqpath)), {
        inverse: setGroupCriteria(objectRef, rid, initialState.map((c) => c.fqpath))
      });
    };
    const action = {
      name: 'groupCriteria',
      execute
    };

    bufferOrExecute(action, old, openDialog);
  });

  ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column: Column, index: number) => {
    trackColumn(provider, objectRef, graph, column, bufferLivePreviewActions);
    if (ignore(Ranking.EVENT_ADD_COLUMN, objectRef)) {
      return;
    }
    // console.log(ranking, 'addColumn', column, index);
    const d = provider.dumpColumn(column);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(addColumn(objectRef, rid, null, index, d), {
      inverse: addColumn(objectRef, rid, null, index, null)
    });
  });

  ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column: Column, index: number) => {
    untrackColumn(column);
    if (ignore(Ranking.EVENT_REMOVE_COLUMN, objectRef)) {
      return;
    }
    // console.log(ranking, 'removeColumn', column, index);
    const d = provider.dumpColumn(column);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(addColumn(objectRef, rid, null, index, null), {
      inverse: addColumn(objectRef, rid, null, index, d)
    });
  });

  ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index: number, oldIndex: number) => {
    if (ignore(Ranking.EVENT_MOVE_COLUMN, objectRef)) {
      return;
    }
    // console.log(col.fqpath, 'addColumn', column, index);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(moveColumn(objectRef, rid, null, oldIndex, index), {
      inverse: moveColumn(objectRef, rid, null, index, oldIndex > index ? oldIndex + 1 : oldIndex)
    });
  });

  ranking.children.forEach((col) => trackColumn(provider, objectRef, graph, col, bufferLivePreviewActions));
}

/**
 * Removes the event listener for ranking events from the provided ranking
 * @param ranking LineUp Ranking
 */
function untrackRanking(ranking: Ranking) {
  ranking.on(suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
  ranking.children.forEach(untrackColumn);
}

/**
 * Clueifies the given LineUp instance. Adds event listeners to track add and remove rankings
 * from the local data provider and adds event listeners for ranking events.
 * @param lineup: The LineUp instance
 * @param objectRef The object reference that contains the LineUp data provider
 * @param graph The provenance graph where the events should be tracked into
 * @returns Returns a promise that is waiting for the object reference (LineUp instance)
 */
export async function clueify(lineup: EngineRenderer | TaggleRenderer, objectRef: IObjectRef<IViewProvider>, graph: ProvenanceGraph): Promise<void> {
  const p = await resolveImmediately((await objectRef.v).data);

  p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking: Ranking, index: number) => {
    if (ignore(LocalDataProvider.EVENT_ADD_RANKING, objectRef)) {
      return;
    }
    const d = ranking.dump(p.toDescRef);
    graph.pushWithResult(addRanking(objectRef, index, d), {
      inverse: addRanking(objectRef, index, null)
    });
    trackRanking(lineup, p, objectRef, graph, ranking);
  });

  p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking: Ranking, index: number) => {
    if (ignore(LocalDataProvider.EVENT_REMOVE_RANKING, objectRef)) {
      return;
    }
    const d = ranking.dump(p.toDescRef);
    graph.pushWithResult(addRanking(objectRef, index, null), {
      inverse: addRanking(objectRef, index, d)
    });
    untrackRanking(ranking);
  });

  // track further ranking event
  p.getRankings().forEach(trackRanking.bind(this, lineup, p, objectRef, graph));
}

/**
 * Removes the event listener for adding and removing a ranking from the provided LineUp instance.
 * @param objectRef The object reference that contains the LineUp data provider
 * @returns Returns a promise that is waiting for the object reference (LineUp instance)
 */
export async function untrack(objectRef: IObjectRef<IViewProvider>): Promise<void> {
  const p = await resolveImmediately((await objectRef.v).data);
  p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
  p.getRankings().forEach(untrackRanking);
}

/**
 * Execute a given LineUp function without being tracked by the provenance graph
 * @param objectRef The object reference that contains the LineUp data provider
 * @param func Function that is executed without provenance tracking
 * @returns Returns a promise that is waiting for the object reference (LineUp instance)
 */
export function withoutTracking<T>(objectRef: IObjectRef<IViewProvider>, func: () => T): PromiseLike<T> {
  return objectRef.v.then((d) => resolveImmediately(d.data)).then((p) => {
    temporaryUntracked.add(objectRef.hash);
    const r = func();
    temporaryUntracked.delete(objectRef.hash);
    return r;
  });
}

/**
 * Adds a given suffix to the list of following parameters (prefix)
 * @param suffix Suffix string that is appended to each prefix
 * @param prefix Multiple parameters that should get the suffix
 * @returns List of combined prefixes with suffixes
 */
function suffix(suffix: string, ...prefix: string[]): string[] {
  return prefix.map((p) => `${p}${suffix}`);
}

