/**
 * Created by Samuel Gratzl on 18.05.2016.
 */


import {IObjectRef, action, meta, cat, op, ProvenanceGraph, ICmdResult} from 'phovea_core/src/provenance';
import {NumberColumn, createMappingFunction, LocalDataProvider, StackColumn, ScriptColumn, OrdinalColumn, CompositeColumn, Ranking, ISortCriteria, Column, isMapAbleColumn} from 'lineupjs';
import {resolveImmediately} from 'phovea_core/src';


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


function ignore(event: string, lineup: IObjectRef<IViewProvider>) {
  if (ignoreNext === event) {
    ignoreNext = null;
    return true;
  }
  return temporaryUntracked.has(lineup.hash);
}

/**
 * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
 * @param ranking
 */
function dirtyRankingWaiter(ranking: Ranking) {
  let waiter: Promise<void> | null = null;

  ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, () => {
    // disable
    ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null);

    let resolver: () => void;
    waiter = new Promise<void>((resolve) => resolver = resolve);
    ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, () => {
      ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, null); // disable
      resolver();
    });
  });

  return (undo: ICmdResult) => {
    ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null); // disable
    if (!waiter) {
      return undo;
    }
    return waiter.then(() => undo);
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
  return waiter.then(() => ({
    inverse: addRanking(inputs[0], parameter.index, null)
  }));
}

export function addRanking(provider: IObjectRef<any>, index: number, dump?: any) {
  return action(meta(dump ? 'Add Ranking' : 'Remove Ranking', cat.layout, dump ? op.create : op.remove), CMD_ADD_RANKING, addRankingImpl, [provider], {
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
  return action(meta('Change Sort Criteria', cat.layout, op.update), CMD_SET_SORTING_CRITERIA, setRankingSortCriteriaImpl, [provider], {
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
  return action(meta('Change Sort Criteria', cat.layout, op.update), CMD_SET_SORTING_CRITERIAS, setSortCriteriaImpl, [provider], {
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
  return action(meta('Change Group Criteria', cat.layout, op.update), CMD_SET_GROUP_CRITERIA, setGroupCriteriaImpl, [provider], {
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
    bak = source.getMapping().dump();
    source.setMapping(createMappingFunction(parameter.value));
  } else if (source) {
    bak = source[`get${prop}`]();
    source[`set${prop}`].call(source, parameter.value);
  }

  return waitForSorted({
    inverse: setColumn(inputs[0], parameter.rid, parameter.path, parameter.prop, bak)
  });
}

export interface IViewProvider {
  data: LocalDataProvider;

  getInstance(): { updateLineUpStats() };
}

export function setColumn(provider: IObjectRef<IViewProvider>, rid: number, path: string, prop: string, value: any) {
  // assert ALineUpView and update the stats
  provider.value.getInstance().updateLineUpStats();

  return action(meta(`Set Property ${prop}`, cat.layout, op.update), CMD_SET_COLUMN, setColumnImpl, [provider], {
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
  return action(meta(dump ? 'Add Column' : 'Remove Column', cat.layout, dump ? op.create : op.remove), CMD_ADD_COLUMN, addColumnImpl, [provider], {
    rid,
    path,
    index,
    dump
  });
}

export function moveColumn(provider: IObjectRef<IViewProvider>, rid: number, path: string, index: number, moveTo: number) {
  return action(meta('Move Column', cat.layout, op.update), CMD_MOVE_COLUMN, moveColumnImpl, [provider], {
    rid,
    path,
    index,
    moveTo
  });
}

function delayedCall(callback: (old: any, newValue: any) => void, timeToDelay = 100, thisCallback = this) {
  let tm = -1;
  let oldest = null;

  function callbackImpl(newValue) {
    callback.call(thisCallback, oldest, newValue);
    oldest = null;
    tm = -1;
  }

  return (old: any, newValue: any) => {
    if (tm >= 0) {
      clearTimeout(tm);
      tm = -1;
    } else {
      oldest = old;
    }
    tm = self.setTimeout(callbackImpl.bind(this, newValue), timeToDelay);
  };
}

function rankingId(provider: LocalDataProvider, ranking: Ranking) {
  return provider.getRankings().indexOf(ranking);
}


function recordPropertyChange(source: Column | Ranking, provider: LocalDataProvider, lineupViewWrapper: IObjectRef<IViewProvider>, graph: ProvenanceGraph, property: string, delayed = -1) {
  const f = (old: any, newValue: any) => {
    if (ignore(`${property}Changed`, lineupViewWrapper)) {
      return;
    }
    // console.log(source, property, old, newValue);
    if (source instanceof Column) {
      // assert ALineUpView and update the stats
      lineupViewWrapper.value.getInstance().updateLineUpStats();

      const rid = rankingId(provider, source.findMyRanker());
      const path = source.fqpath;
      graph.pushWithResult(setColumn(lineupViewWrapper, rid, path, property, newValue), {
        inverse: setColumn(lineupViewWrapper, rid, path, property, old)
      });
    } else if (source instanceof Ranking) {
      const rid = rankingId(provider, source);
      graph.pushWithResult(setColumn(lineupViewWrapper, rid, null, property, newValue), {
        inverse: setColumn(lineupViewWrapper, rid, null, property, old)
      });
    }
  };
  source.on(`${property}Changed.track`, delayed > 0 ? delayedCall(f, delayed) : f);
}

function trackColumn(provider: LocalDataProvider, lineup: IObjectRef<IViewProvider>, graph: ProvenanceGraph, col: Column) {
  recordPropertyChange(col, provider, lineup, graph, 'metaData');
  recordPropertyChange(col, provider, lineup, graph, 'filter');
  recordPropertyChange(col, provider, lineup, graph, 'rendererType');
  recordPropertyChange(col, provider, lineup, graph, 'groupRenderer');
  recordPropertyChange(col, provider, lineup, graph, 'sortMethod');
  //recordPropertyChange(col, provider, lineup, graph, 'width', 100);

  if (col instanceof CompositeColumn) {
    col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index: number) => {
      trackColumn(provider, lineup, graph, column);
      if (ignore(CompositeColumn.EVENT_ADD_COLUMN, lineup)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(addColumn(lineup, rid, path, index, d), {
        inverse: addColumn(lineup, rid, path, index, null)
      });
    });
    col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index: number) => {
      untrackColumn(column);
      if (ignore(CompositeColumn.EVENT_REMOVE_COLUMN, lineup)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(addColumn(lineup, rid, path, index, null), {
        inverse: addColumn(lineup, rid, path, index, d)
      });
    });

    col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index: number, oldIndex: number) => {
      if (ignore(CompositeColumn.EVENT_MOVE_COLUMN, lineup)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(moveColumn(lineup, rid, path, oldIndex, index), {
        inverse: moveColumn(lineup, rid, path, index, oldIndex > index ? oldIndex + 1 : oldIndex)
      });
    });
    col.children.forEach(trackColumn.bind(this, provider, lineup, graph));

    if (col instanceof StackColumn) {
      recordPropertyChange(col, provider, lineup, graph, 'weights', 100);
    }
  } else if (col instanceof NumberColumn) {
    col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, (old, newValue) => {
      if (ignore(NumberColumn.EVENT_MAPPING_CHANGED, lineup)) {
        return;
      }
      // console.log(col.fqpath, 'mapping', old.dump(), newValue.dump());
      const rid = rankingId(provider, col.findMyRanker());
      const path = col.fqpath;
      graph.pushWithResult(setColumn(lineup, rid, path, 'mapping', newValue.dump()), {
        inverse: setColumn(lineup, rid, path, 'mapping', old.dump())
      });
    });
  } else if (col instanceof ScriptColumn) {
    recordPropertyChange(col, provider, lineup, graph, 'script');
  } else if (col instanceof OrdinalColumn) {
    recordPropertyChange(col, provider, lineup, graph, 'mapping');
  }
}


function untrackColumn(col: Column) {
  col.on(suffix('Changed.filter', 'metaData', 'filter', 'width', 'rendererType', 'groupRenderer', 'sortMethod'), null);

  if (col instanceof CompositeColumn) {
    col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
    col.children.forEach(untrackColumn);
  } else if (col instanceof NumberColumn) {
    col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, null);
  } else if (col instanceof ScriptColumn) {
    col.on(`${ScriptColumn.EVENT_SCRIPT_CHANGED}.track`, null);
  }
}

function trackRanking(provider: LocalDataProvider, lineup: IObjectRef<IViewProvider>, graph: ProvenanceGraph, ranking: Ranking) {
  ranking.on(`${Ranking.EVENT_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
    if (ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, lineup)) {
      return;
    }
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(setSortCriteria(lineup, rid, newValue.map(toSortObject)), {
      inverse: setSortCriteria(lineup, rid, old.map(toSortObject))
    });
  });
  ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
    if (ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, lineup)) {
      return;
    }
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(setSortCriteria(lineup, rid, newValue.map(toSortObject), false), {
      inverse: setSortCriteria(lineup, rid, old.map(toSortObject), false)
    });
  });
  ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old: Column[], newValue: Column[]) => {
    if (ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, lineup)) {
      return;
    }
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(setGroupCriteria(lineup, rid, newValue.map((c) => c.fqpath)), {
      inverse: setGroupCriteria(lineup, rid, old.map((c) => c.fqpath))
    });
  });
  ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column: Column, index: number) => {
    trackColumn(provider, lineup, graph, column);
    if (ignore(Ranking.EVENT_ADD_COLUMN, lineup)) {
      return;
    }
    // console.log(ranking, 'addColumn', column, index);
    const d = provider.dumpColumn(column);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(addColumn(lineup, rid, null, index, d), {
      inverse: addColumn(lineup, rid, null, index, null)
    });
  });
  ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column: Column, index: number) => {
    untrackColumn(column);
    if(ignore(Ranking.EVENT_REMOVE_COLUMN, lineup)) {
      return;
    }
    // console.log(ranking, 'removeColumn', column, index);
    const d = provider.dumpColumn(column);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(addColumn(lineup, rid, null, index, null), {
      inverse: addColumn(lineup, rid, null, index, d)
    });
  });
  ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index: number, oldIndex: number) => {
    if(ignore(Ranking.EVENT_MOVE_COLUMN, lineup)) {
      return;
    }
    // console.log(col.fqpath, 'addColumn', column, index);
    const rid = rankingId(provider, ranking);
    graph.pushWithResult(moveColumn(lineup, rid, null, oldIndex, index), {
      inverse: moveColumn(lineup, rid, null, index, oldIndex > index ? oldIndex + 1 : oldIndex)
    });
  });
  ranking.children.forEach(trackColumn.bind(this, provider, lineup, graph));
}

function untrackRanking(ranking: Ranking) {
  ranking.on(suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
  ranking.children.forEach(untrackColumn);
}

/**
 * clueifies lineup
 * @param lineup the object ref on the lineup provider instance
 * @param graph
 */
export async function clueify(lineup: IObjectRef<IViewProvider>, graph: ProvenanceGraph) {
  const p = await resolveImmediately((await lineup.v).data);
  p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking: Ranking, index: number) => {
    if (ignore(LocalDataProvider.EVENT_ADD_RANKING, lineup)) {
      return;
    }
    const d = ranking.dump(p.toDescRef);
    graph.pushWithResult(addRanking(lineup, index, d), {
      inverse: addRanking(lineup, index, null)
    });
    trackRanking(p, lineup, graph, ranking);
  });
  p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking: Ranking, index: number) => {
    if (ignore(LocalDataProvider.EVENT_REMOVE_RANKING, lineup)) {
      return;
    }
    const d = ranking.dump(p.toDescRef);
    graph.pushWithResult(addRanking(lineup, index, null), {
      inverse: addRanking(lineup, index, d)
    });
    untrackRanking(ranking);
  });
  p.getRankings().forEach(trackRanking.bind(this, p, lineup, graph));
}

export async function untrack(lineup: IObjectRef<IViewProvider>) {
  const p = await resolveImmediately((await lineup.v).data);
  p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
  p.getRankings().forEach(untrackRanking);
}

export function withoutTracking<T>(lineup: IObjectRef<IViewProvider>, fun: () => T): PromiseLike<T> {
  return lineup.v.then((d) => resolveImmediately(d.data)).then((p) => {
    temporaryUntracked.add(lineup.hash);
    const r = fun();
    temporaryUntracked.delete(lineup.hash);
    return r;
  });
}

function suffix(suffix: string, ...prefix: string[]) {
  return prefix.map((p) => `${p}${suffix}`);
}

