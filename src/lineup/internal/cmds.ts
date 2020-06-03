/**
 * Created by Samuel Gratzl on 18.05.2016.
 */


import {IObjectRef, ProvenanceGraph, ICmdResult, ResolveNow, I18nextManager, ObjectRefUtils, ActionMetaData, ActionUtils} from 'phovea_core';
import {NumberColumn, createMappingFunction, LocalDataProvider, StackColumn, ScriptColumn, OrdinalColumn, CompositeColumn, Ranking, ISortCriteria, Column, isMapAbleColumn} from 'lineupjs';


const CMD_SET_SORTING_CRITERIA = 'lineupSetRankingSortCriteria';
const CMD_SET_SORTING_CRITERIAS = 'lineupSetSortCriteria';
const CMD_SET_GROUP_CRITERIA = 'lineupSetGroupCriteria';
const CMD_ADD_RANKING = 'lineupAddRanking';
const CMD_SET_COLUMN = 'lineupSetColumn';
const CMD_ADD_COLUMN = 'lineupAddColumn';
const CMD_MOVE_COLUMN = 'lineupMoveColumn';


export interface IViewProviderLocal {
  data: LocalDataProvider;

  getInstance(): {updateLineUpStats()};
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

export class LinupTrackingManager {

  //TODO better solution
  private ignoreNext: string = null;

  /**
   * set of data provider to ignore
   * @type {Set<LocalDataProvider>}
   */
  private temporaryUntracked = new Set<string>();


  private ignore(event: string, lineup: IObjectRef<IViewProviderLocal>) {
    if (LinupTrackingManager.getInstance().ignoreNext === event) {
      LinupTrackingManager.getInstance().ignoreNext = null;
      return true;
    }
    return LinupTrackingManager.getInstance().temporaryUntracked.has(lineup.hash);
  }

  /**
   * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
   * @param ranking
   */
  private dirtyRankingWaiter(ranking: Ranking) {
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

  public async addRankingImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const index: number = parameter.index;

    if (!parameter.dump) { // remove
      const ranking = p.getRankings()[index];
      LinupTrackingManager.getInstance().ignoreNext = LocalDataProvider.EVENT_REMOVE_RANKING;
      p.removeRanking(ranking);
      return {
        inverse: LinupTrackingManager.getInstance().addRanking(inputs[0], parameter.index, ranking.dump(p.toDescRef))
      };
    }

    // add
    LinupTrackingManager.getInstance().ignoreNext = LocalDataProvider.EVENT_ADD_RANKING;
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
      inverse: LinupTrackingManager.getInstance().addRanking(inputs[0], parameter.index, null)
    }));
  }

  public addRanking(provider: IObjectRef<any>, index: number, dump?: any) {
    return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addRanking') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeRanking'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_RANKING, LinupTrackingManager.getInstance().addRankingImpl, [provider], {
      index,
      dump
    });
  }

  private toSortObject(v) {
    return {asc: v.asc, col: v.col ? v.col.fqpath : null};
  }

  public async setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const bak = LinupTrackingManager.getInstance().toSortObject(ranking.getSortCriteria());
    LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
    //expects just null not undefined
    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    ranking.sortBy(parameter.value.col ? (ranking.findByPath(parameter.value.col) || null) : null, parameter.value.asc);

    return waitForSorted({
      inverse: LinupTrackingManager.getInstance().setRankingSortCriteria(inputs[0], parameter.rid, bak)
    });
  }


  public setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any) {
    return ActionUtils.action(ActionMetaData.actionMeta( I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIA, LinupTrackingManager.getInstance().setRankingSortCriteriaImpl, [provider], {
      rid,
      value
    });
  }

  public async setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];

    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);

    let current: ISortCriteria[];
    const columns: ISortCriteria[] = parameter.columns.map((c) => ({col: ranking.findByPath(c.col), asc: c.asc}));
    if (parameter.isSorting) {
      current = ranking.getSortCriteria();
      LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
      ranking.setSortCriteria(columns);
    } else {
      current = ranking.getGroupSortCriteria();
      LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED;
      ranking.setGroupSortCriteria(columns);
    }
    return waitForSorted({
      inverse: LinupTrackingManager.getInstance().setSortCriteria(inputs[0], parameter.rid, current.map(LinupTrackingManager.getInstance().toSortObject, this), parameter.isSorting)
    });
  }


  public setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {asc: boolean, col: string}[], isSorting = true) {
    return ActionUtils.action(ActionMetaData.actionMeta( I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIAS, LinupTrackingManager.getInstance().setSortCriteriaImpl, [provider], {
      rid,
      columns,
      isSorting
    });
  }

  public async setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const current = ranking.getGroupCriteria().map((d) => d.fqpath);
    const columns = parameter.columns.map((p) => ranking.findByPath(p));
    LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_GROUP_CRITERIA_CHANGED;

    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    ranking.setGroupCriteria(columns);
    return waitForSorted({
      inverse: LinupTrackingManager.getInstance().setGroupCriteria(inputs[0], parameter.rid, current)
    });
  }

  public setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]) {
    return ActionUtils.action(ActionMetaData.actionMeta( I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeGroupCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_GROUP_CRITERIA, LinupTrackingManager.getInstance().setGroupCriteriaImpl, [provider], {
      rid,
      columns
    });
  }

  public async setColumnImpl(inputs: IObjectRef<any>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    const prop = parameter.prop[0].toUpperCase() + parameter.prop.slice(1);

    let bak = null;
    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    let source: Column | Ranking = ranking;
    if (parameter.path) {
      source = ranking.findByPath(parameter.path);
    }
    LinupTrackingManager.getInstance().ignoreNext = `${parameter.prop}Changed`;
    if (parameter.prop === 'mapping' && source instanceof Column && isMapAbleColumn(source)) {
      bak = source.getMapping().dump();
      source.setMapping(createMappingFunction(parameter.value));
    } else if (source) {
      // fixes bug that is caused by the fact that the function `getRendererType()` does not exist (only `getRenderer()`)
      switch (parameter.prop) {
        case 'rendererType':
          bak = source[`getRenderer`]();
          source[`setRenderer`].call(source, parameter.value);
          break;
        default:
          bak = source[`get${prop}`]();
          source[`set${prop}`].call(source, LinupTrackingManager.getInstance().restoreRegExp(parameter.value)); // restore serialized regular expression before passing to LineUp
          break;
      }
    }

    return waitForSorted({
      inverse: LinupTrackingManager.getInstance().setColumn(inputs[0], parameter.rid, parameter.path, parameter.prop, bak)
    });
  }

  public setColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, prop: string, value: any) {
    // assert ALineUpView and update the stats
    provider.value.getInstance().updateLineUpStats();

    return ActionUtils.action(ActionMetaData.actionMeta( I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.setProperty', {prop}), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_COLUMN, LinupTrackingManager.getInstance().setColumnImpl, [provider], {
      rid,
      path,
      prop,
      value
    });
  }

  public async addColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    let parent: Ranking | CompositeColumn = ranking;

    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
    const index: number = parameter.index;
    let bak = null;
    if (parameter.path) {
      parent = <CompositeColumn>ranking.findByPath(parameter.path);
    }
    if (parent) {
      if (parameter.dump) { //add
        LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_ADD_COLUMN;
        parent.insert(p.restoreColumn(parameter.dump), index);
      } else { //remove
        bak = parent.at(index);
        LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_REMOVE_COLUMN;
        parent.remove(bak);
      }
    }
    return waitForSorted({
      inverse: LinupTrackingManager.getInstance().addColumn(inputs[0], parameter.rid, parameter.path, index, parameter.dump || !bak ? null : p.dumpColumn(bak))
    });
  }

  public async moveColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any) {
    const p: LocalDataProvider = await ResolveNow.resolveImmediately((await inputs[0].v).data);
    const ranking = p.getRankings()[parameter.rid];
    let parent: Ranking | CompositeColumn = ranking;
    const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);

    const index: number = parameter.index;
    const target: number = parameter.moveTo;
    let bak = null;
    if (parameter.path) {
      parent = <CompositeColumn>ranking.findByPath(parameter.path);
    }
    if (parent) {
      bak = parent.at(index);
      LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_MOVE_COLUMN;
      parent.move(bak, target);
    }
    return waitForSorted({
      //shift since indices shifted
      inverse: LinupTrackingManager.getInstance().moveColumn(inputs[0], parameter.rid, parameter.path, target, index > target ? index + 1 : target)
    });
  }

  public addColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, dump: any) {
    return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addColumn') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeColumn'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_COLUMN, LinupTrackingManager.getInstance().addColumnImpl, [provider], {
      rid,
      path,
      index,
      dump
    });
  }

  public moveColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, moveTo: number) {
    return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.moveColumn'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_MOVE_COLUMN, LinupTrackingManager.getInstance().moveColumnImpl, [provider], {
      rid,
      path,
      index,
      moveTo
    });
  }

  private delayedCall(callback: (old: any, newValue: any) => void, timeToDelay = 100, thisCallback = this) {
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

  private rankingId(provider: LocalDataProvider, ranking: Ranking) {
    return provider.getRankings().indexOf(ranking);
  }


  private recordPropertyChange(source: Column | Ranking, provider: LocalDataProvider, lineupViewWrapper: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, property: string, delayed = -1) {
    const f = (old: any, newValue: any) => {
      if (LinupTrackingManager.getInstance().ignore(`${property}Changed`, lineupViewWrapper)) {
        return;
      }

      const newSerializedValue = LinupTrackingManager.getInstance().serializeRegExp(newValue); // serialize possible RegExp object to be properly stored as provenance graph

      if (source instanceof Column) {
        // assert ALineUpView and update the stats
        lineupViewWrapper.value.getInstance().updateLineUpStats();

        const rid = LinupTrackingManager.getInstance().rankingId(provider, source.findMyRanker());
        const path = source.fqpath;
        graph.pushWithResult(LinupTrackingManager.getInstance().setColumn(lineupViewWrapper, rid, path, property, newSerializedValue), {
          inverse: LinupTrackingManager.getInstance().setColumn(lineupViewWrapper, rid, path, property, old)
        });
      } else if (source instanceof Ranking) {
        const rid = LinupTrackingManager.getInstance().rankingId(provider, source);
        graph.pushWithResult(LinupTrackingManager.getInstance().setColumn(lineupViewWrapper, rid, null, property, newSerializedValue), {
          inverse: LinupTrackingManager.getInstance().setColumn(lineupViewWrapper, rid, null, property, old)
        });
      }
    };
    source.on(`${property}Changed.track`, delayed > 0 ? LinupTrackingManager.getInstance().delayedCall(f, delayed) : f);
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
  private serializeRegExp(value: string | RegExp): string | IRegExpFilter {
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
  private restoreRegExp(filter: string | IRegExpFilter): string | RegExp {
    if (filter === null || !(<IRegExpFilter>filter).isRegExp) {
      return <string | null>filter;
    }

    const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
    const matches = serializedRegexParser.exec((<IRegExpFilter>filter).value);
    const [_full, regexString, regexFlags] = matches;
    return new RegExp(regexString, regexFlags);
  }

  private trackColumn(provider: LocalDataProvider, lineup: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, col: Column) {
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'metaData');
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'filter');
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'rendererType');
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'groupRenderer');
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'summaryRenderer');
    LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'sortMethod');
    //recordPropertyChange(col, provider, lineup, graph, 'width', 100);

    if (col instanceof CompositeColumn) {
      col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index: number) => {
        LinupTrackingManager.getInstance().trackColumn(provider, lineup, graph, column);
        if (LinupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_ADD_COLUMN, lineup)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const d = provider.dumpColumn(column);
        const rid = LinupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LinupTrackingManager.getInstance().addColumn(lineup, rid, path, index, d), {
          inverse: LinupTrackingManager.getInstance().addColumn(lineup, rid, path, index, null)
        });
      });
      col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index: number) => {
        LinupTrackingManager.getInstance().untrackColumn(column);
        if (LinupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_REMOVE_COLUMN, lineup)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const d = provider.dumpColumn(column);
        const rid = LinupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LinupTrackingManager.getInstance().addColumn(lineup, rid, path, index, null), {
          inverse: LinupTrackingManager.getInstance().addColumn(lineup, rid, path, index, d)
        });
      });

      col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index: number, oldIndex: number) => {
        if (LinupTrackingManager.getInstance().ignore(CompositeColumn.EVENT_MOVE_COLUMN, lineup)) {
          return;
        }
        // console.log(col.fqpath, 'addColumn', column, index);
        const rid = LinupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LinupTrackingManager.getInstance().moveColumn(lineup, rid, path, oldIndex, index), {
          inverse: LinupTrackingManager.getInstance().moveColumn(lineup, rid, path, index, oldIndex > index ? oldIndex + 1 : oldIndex)
        });
      });
      col.children.forEach(LinupTrackingManager.getInstance().trackColumn.bind(this, provider, lineup, graph));

      if (col instanceof StackColumn) {
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'weights', 100);
      }
    } else if (col instanceof NumberColumn) {
      col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, (old, newValue) => {
        if (LinupTrackingManager.getInstance().ignore(NumberColumn.EVENT_MAPPING_CHANGED, lineup)) {
          return;
        }
        // console.log(col.fqpath, 'mapping', old.dump(), newValue.dump());
        const rid = LinupTrackingManager.getInstance().rankingId(provider, col.findMyRanker());
        const path = col.fqpath;
        graph.pushWithResult(LinupTrackingManager.getInstance().setColumn(lineup, rid, path, 'mapping', newValue.dump()), {
          inverse: LinupTrackingManager.getInstance().setColumn(lineup, rid, path, 'mapping', old.dump())
        });
      });
    } else if (col instanceof ScriptColumn) {
      LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'script');
    } else if (col instanceof OrdinalColumn) {
      LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'mapping');
    }
  }


  private untrackColumn(col: Column) {
    col.on(LinupTrackingManager.getInstance().suffix('Changed.filter', 'metaData', 'filter', 'width', 'rendererType', 'groupRenderer', 'summaryRenderer', 'sortMethod'), null);

    if (col instanceof CompositeColumn) {
      col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
      col.children.forEach(LinupTrackingManager.getInstance().untrackColumn);
    } else if (col instanceof NumberColumn) {
      col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, null);
    } else if (col instanceof ScriptColumn) {
      col.on(`${ScriptColumn.EVENT_SCRIPT_CHANGED}.track`, null);
    }
  }

  private trackRanking(provider: LocalDataProvider, lineup: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph, ranking: Ranking) {
    ranking.on(`${Ranking.EVENT_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, lineup)) {
        return;
      }
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, newValue.map(LinupTrackingManager.getInstance().toSortObject, this)), {
        inverse: LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, old.map(LinupTrackingManager.getInstance().toSortObject, this))
      });
    });
    ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old: ISortCriteria[], newValue: ISortCriteria[]) => {
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, lineup)) {
        return;
      }
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, newValue.map(LinupTrackingManager.getInstance().toSortObject, this), false), {
        inverse: LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, old.map(LinupTrackingManager.getInstance().toSortObject, this), false)
      });
    });
    ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old: Column[], newValue: Column[]) => {
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, lineup)) {
        return;
      }
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().setGroupCriteria(lineup, rid, newValue.map((c) => c.fqpath)), {
        inverse: LinupTrackingManager.getInstance().setGroupCriteria(lineup, rid, old.map((c) => c.fqpath))
      });
    });
    ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column: Column, index: number) => {
      LinupTrackingManager.getInstance().trackColumn(provider, lineup, graph, column);
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_ADD_COLUMN, lineup)) {
        return;
      }
      // console.log(ranking, 'addColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().addColumn(lineup, rid, null, index, d), {
        inverse: LinupTrackingManager.getInstance().addColumn(lineup, rid, null, index, null)
      });
    });
    ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column: Column, index: number) => {
      LinupTrackingManager.getInstance().untrackColumn(column);
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_REMOVE_COLUMN, lineup)) {
        return;
      }
      // console.log(ranking, 'removeColumn', column, index);
      const d = provider.dumpColumn(column);
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().addColumn(lineup, rid, null, index, null), {
        inverse: LinupTrackingManager.getInstance().addColumn(lineup, rid, null, index, d)
      });
    });
    ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index: number, oldIndex: number) => {
      if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_MOVE_COLUMN, lineup)) {
        return;
      }
      // console.log(col.fqpath, 'addColumn', column, index);
      const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
      graph.pushWithResult(LinupTrackingManager.getInstance().moveColumn(lineup, rid, null, oldIndex, index), {
        inverse: LinupTrackingManager.getInstance().moveColumn(lineup, rid, null, index, oldIndex > index ? oldIndex + 1 : oldIndex)
      });
    });
    ranking.children.forEach(LinupTrackingManager.getInstance().trackColumn.bind(this, provider, lineup, graph));
  }

  private untrackRanking(ranking: Ranking) {
    ranking.on(LinupTrackingManager.getInstance().suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
    ranking.children.forEach(LinupTrackingManager.getInstance().untrackColumn);
  }

  /**
   * clueifies lineup
   * @param lineup the object ref on the lineup provider instance
   * @param graph
   */
  public async clueify(lineup: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph) {
    const p = await ResolveNow.resolveImmediately((await lineup.v).data);
    p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking: Ranking, index: number) => {
      if (LinupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_ADD_RANKING, lineup)) {
        return;
      }
      const d = ranking.dump(p.toDescRef);
      graph.pushWithResult(LinupTrackingManager.getInstance().addRanking(lineup, index, d), {
        inverse: LinupTrackingManager.getInstance().addRanking(lineup, index, null)
      });
      LinupTrackingManager.getInstance().trackRanking(p, lineup, graph, ranking);
    });
    p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking: Ranking, index: number) => {
      if (LinupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_REMOVE_RANKING, lineup)) {
        return;
      }
      const d = ranking.dump(p.toDescRef);
      graph.pushWithResult(LinupTrackingManager.getInstance().addRanking(lineup, index, null), {
        inverse: LinupTrackingManager.getInstance().addRanking(lineup, index, d)
      });
      LinupTrackingManager.getInstance().untrackRanking(ranking);
    });
    p.getRankings().forEach(LinupTrackingManager.getInstance().trackRanking.bind(this, p, lineup, graph));
  }

  public async untrack(lineup: IObjectRef<IViewProviderLocal>) {
    const p = await ResolveNow.resolveImmediately((await lineup.v).data);
    p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
    p.getRankings().forEach(LinupTrackingManager.getInstance().untrackRanking);
  }

  public withoutTracking<T>(lineup: IObjectRef<IViewProviderLocal>, fun: () => T): PromiseLike<T> {
    return lineup.v.then((d) => ResolveNow.resolveImmediately(d.data)).then((p) => {
      LinupTrackingManager.getInstance().temporaryUntracked.add(lineup.hash);
      const r = fun();
      LinupTrackingManager.getInstance().temporaryUntracked.delete(lineup.hash);
      return r;
    });
  }

  private suffix(suffix: string, ...prefix: string[]) {
    return prefix.map((p) => `${p}${suffix}`);
  }

  private static instance: LinupTrackingManager;

  public static getInstance(): LinupTrackingManager {
    if (!LinupTrackingManager.instance) {
      LinupTrackingManager.instance = new LinupTrackingManager();
    }
    return LinupTrackingManager.instance;
  }
}
