/**
 * Created by Samuel Gratzl on 18.05.2016.
 */
import { ResolveNow, I18nextManager, ObjectRefUtils, ActionMetaData, ActionUtils } from 'phovea_core';
import { NumberColumn, createMappingFunction, LocalDataProvider, StackColumn, ScriptColumn, OrdinalColumn, CompositeColumn, Ranking, Column, isMapAbleColumn } from 'lineupjs';
const CMD_SET_SORTING_CRITERIA = 'lineupSetRankingSortCriteria';
const CMD_SET_SORTING_CRITERIAS = 'lineupSetSortCriteria';
const CMD_SET_GROUP_CRITERIA = 'lineupSetGroupCriteria';
const CMD_ADD_RANKING = 'lineupAddRanking';
const CMD_SET_COLUMN = 'lineupSetColumn';
const CMD_ADD_COLUMN = 'lineupAddColumn';
const CMD_MOVE_COLUMN = 'lineupMoveColumn';
export class LinupTrackingManager {
    constructor() {
        //TODO better solution
        this.ignoreNext = null;
        /**
         * set of data provider to ignore
         * @type {Set<LocalDataProvider>}
         */
        this.temporaryUntracked = new Set();
    }
    ignore(event, lineup) {
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
    dirtyRankingWaiter(ranking) {
        let waiter = null;
        ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, () => {
            // disable
            ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null);
            let resolver;
            // store the promise and the resolve function in variables
            // the waiter (promise) will only be resolved when the resolver is called
            // so the promise is locked until the `${Ranking.EVENT_ORDER_CHANGED}.track` event is triggered
            waiter = new Promise((resolve) => resolver = resolve);
            ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, () => {
                ranking.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, null); // disable
                resolver(); // resolve waiter promise
            });
        });
        return (undo) => {
            ranking.on(`${Ranking.EVENT_DIRTY_ORDER}.track`, null); // disable
            if (!waiter) {
                return undo;
            }
            return waiter.then(() => undo); // locked until the resolver is executed (i.e. when the event dispatches)
        };
    }
    async addRankingImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const index = parameter.index;
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
        let resolver;
        const waiter = new Promise((resolve) => resolver = resolve);
        added.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, () => {
            added.on(`${Ranking.EVENT_ORDER_CHANGED}.track`, null); // disable
            resolver();
        });
        p.insertRanking(added, index);
        return waiter.then(() => ({
            inverse: LinupTrackingManager.getInstance().addRanking(inputs[0], parameter.index, null)
        }));
    }
    addRanking(provider, index, dump) {
        return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addRanking') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeRanking'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_RANKING, LinupTrackingManager.getInstance().addRankingImpl, [provider], {
            index,
            dump
        });
    }
    toSortObject(v) {
        return { asc: v.asc, col: v.col ? v.col.fqpath : null };
    }
    async setRankingSortCriteriaImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
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
    setRankingSortCriteria(provider, rid, value) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIA, LinupTrackingManager.getInstance().setRankingSortCriteriaImpl, [provider], {
            rid,
            value
        });
    }
    async setSortCriteriaImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
        let current;
        const columns = parameter.columns.map((c) => ({ col: ranking.findByPath(c.col), asc: c.asc }));
        if (parameter.isSorting) {
            current = ranking.getSortCriteria();
            LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
            ranking.setSortCriteria(columns);
        }
        else {
            current = ranking.getGroupSortCriteria();
            LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED;
            ranking.setGroupSortCriteria(columns);
        }
        return waitForSorted({
            inverse: LinupTrackingManager.getInstance().setSortCriteria(inputs[0], parameter.rid, current.map(LinupTrackingManager.getInstance().toSortObject, this), parameter.isSorting)
        });
    }
    setSortCriteria(provider, rid, columns, isSorting = true) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIAS, LinupTrackingManager.getInstance().setSortCriteriaImpl, [provider], {
            rid,
            columns,
            isSorting
        });
    }
    async setGroupCriteriaImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
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
    setGroupCriteria(provider, rid, columns) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeGroupCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_GROUP_CRITERIA, LinupTrackingManager.getInstance().setGroupCriteriaImpl, [provider], {
            rid,
            columns
        });
    }
    async setColumnImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        const prop = parameter.prop[0].toUpperCase() + parameter.prop.slice(1);
        let bak = null;
        const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
        let source = ranking;
        if (parameter.path) {
            source = ranking.findByPath(parameter.path);
        }
        LinupTrackingManager.getInstance().ignoreNext = `${parameter.prop}Changed`;
        if (parameter.prop === 'mapping' && source instanceof Column && isMapAbleColumn(source)) {
            bak = source.getMapping().dump();
            source.setMapping(createMappingFunction(parameter.value));
        }
        else if (source) {
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
    setColumn(provider, rid, path, prop, value) {
        // assert ALineUpView and update the stats
        provider.value.getInstance().updateLineUpStats();
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.setProperty', { prop }), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_COLUMN, LinupTrackingManager.getInstance().setColumnImpl, [provider], {
            rid,
            path,
            prop,
            value
        });
    }
    async addColumnImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        let parent = ranking;
        const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
        const index = parameter.index;
        let bak = null;
        if (parameter.path) {
            parent = ranking.findByPath(parameter.path);
        }
        if (parent) {
            if (parameter.dump) { //add
                LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_ADD_COLUMN;
                parent.insert(p.restoreColumn(parameter.dump), index);
            }
            else { //remove
                bak = parent.at(index);
                LinupTrackingManager.getInstance().ignoreNext = Ranking.EVENT_REMOVE_COLUMN;
                parent.remove(bak);
            }
        }
        return waitForSorted({
            inverse: LinupTrackingManager.getInstance().addColumn(inputs[0], parameter.rid, parameter.path, index, parameter.dump || !bak ? null : p.dumpColumn(bak))
        });
    }
    async moveColumnImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        let parent = ranking;
        const waitForSorted = LinupTrackingManager.getInstance().dirtyRankingWaiter(ranking);
        const index = parameter.index;
        const target = parameter.moveTo;
        let bak = null;
        if (parameter.path) {
            parent = ranking.findByPath(parameter.path);
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
    addColumn(provider, rid, path, index, dump) {
        return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addColumn') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeColumn'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_COLUMN, LinupTrackingManager.getInstance().addColumnImpl, [provider], {
            rid,
            path,
            index,
            dump
        });
    }
    moveColumn(provider, rid, path, index, moveTo) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.moveColumn'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_MOVE_COLUMN, LinupTrackingManager.getInstance().moveColumnImpl, [provider], {
            rid,
            path,
            index,
            moveTo
        });
    }
    delayedCall(callback, timeToDelay = 100, thisCallback = this) {
        let tm = -1;
        let oldest = null;
        function callbackImpl(newValue) {
            callback.call(thisCallback, oldest, newValue);
            oldest = null;
            tm = -1;
        }
        return (old, newValue) => {
            if (tm >= 0) {
                clearTimeout(tm);
                tm = -1;
            }
            else {
                oldest = old;
            }
            tm = self.setTimeout(callbackImpl.bind(this, newValue), timeToDelay);
        };
    }
    rankingId(provider, ranking) {
        return provider.getRankings().indexOf(ranking);
    }
    recordPropertyChange(source, provider, lineupViewWrapper, graph, property, delayed = -1) {
        const f = (old, newValue) => {
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
            }
            else if (source instanceof Ranking) {
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
    serializeRegExp(value) {
        if (!(value instanceof RegExp)) {
            return value;
        }
        return { value: value.toString(), isRegExp: true };
    }
    /**
     * Restores a RegExp object from a given IRegExpFilter object.
     * In case a string is passed to this function no deserialization is applied.
     *
     * @param filter Filter as string or plain object matching the IRegExpFilter
     * @returns {string | RegExp| null} Returns the input string or the restored RegExp object
     */
    restoreRegExp(filter) {
        if (filter === null || !filter.isRegExp) {
            return filter;
        }
        const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
        const matches = serializedRegexParser.exec(filter.value);
        const [_full, regexString, regexFlags] = matches;
        return new RegExp(regexString, regexFlags);
    }
    trackColumn(provider, lineup, graph, col) {
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'metaData');
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'filter');
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'rendererType');
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'groupRenderer');
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'summaryRenderer');
        LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'sortMethod');
        //recordPropertyChange(col, provider, lineup, graph, 'width', 100);
        if (col instanceof CompositeColumn) {
            col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index) => {
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
            col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index) => {
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
            col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index, oldIndex) => {
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
        }
        else if (col instanceof NumberColumn) {
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
        }
        else if (col instanceof ScriptColumn) {
            LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'script');
        }
        else if (col instanceof OrdinalColumn) {
            LinupTrackingManager.getInstance().recordPropertyChange(col, provider, lineup, graph, 'mapping');
        }
    }
    untrackColumn(col) {
        col.on(LinupTrackingManager.getInstance().suffix('Changed.filter', 'metaData', 'filter', 'width', 'rendererType', 'groupRenderer', 'summaryRenderer', 'sortMethod'), null);
        if (col instanceof CompositeColumn) {
            col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
            col.children.forEach(LinupTrackingManager.getInstance().untrackColumn);
        }
        else if (col instanceof NumberColumn) {
            col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, null);
        }
        else if (col instanceof ScriptColumn) {
            col.on(`${ScriptColumn.EVENT_SCRIPT_CHANGED}.track`, null);
        }
    }
    trackRanking(provider, lineup, graph, ranking) {
        ranking.on(`${Ranking.EVENT_SORT_CRITERIA_CHANGED}.track`, (old, newValue) => {
            if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
            graph.pushWithResult(LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, newValue.map(LinupTrackingManager.getInstance().toSortObject, this)), {
                inverse: LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, old.map(LinupTrackingManager.getInstance().toSortObject, this))
            });
        });
        ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old, newValue) => {
            if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
            graph.pushWithResult(LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, newValue.map(LinupTrackingManager.getInstance().toSortObject, this), false), {
                inverse: LinupTrackingManager.getInstance().setSortCriteria(lineup, rid, old.map(LinupTrackingManager.getInstance().toSortObject, this), false)
            });
        });
        ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old, newValue) => {
            if (LinupTrackingManager.getInstance().ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = LinupTrackingManager.getInstance().rankingId(provider, ranking);
            graph.pushWithResult(LinupTrackingManager.getInstance().setGroupCriteria(lineup, rid, newValue.map((c) => c.fqpath)), {
                inverse: LinupTrackingManager.getInstance().setGroupCriteria(lineup, rid, old.map((c) => c.fqpath))
            });
        });
        ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column, index) => {
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
        ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column, index) => {
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
        ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index, oldIndex) => {
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
    untrackRanking(ranking) {
        ranking.on(LinupTrackingManager.getInstance().suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
        ranking.children.forEach(LinupTrackingManager.getInstance().untrackColumn);
    }
    /**
     * clueifies lineup
     * @param lineup the object ref on the lineup provider instance
     * @param graph
     */
    async clueify(lineup, graph) {
        const p = await ResolveNow.resolveImmediately((await lineup.v).data);
        p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking, index) => {
            if (LinupTrackingManager.getInstance().ignore(LocalDataProvider.EVENT_ADD_RANKING, lineup)) {
                return;
            }
            const d = ranking.dump(p.toDescRef);
            graph.pushWithResult(LinupTrackingManager.getInstance().addRanking(lineup, index, d), {
                inverse: LinupTrackingManager.getInstance().addRanking(lineup, index, null)
            });
            LinupTrackingManager.getInstance().trackRanking(p, lineup, graph, ranking);
        });
        p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking, index) => {
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
    async untrack(lineup) {
        const p = await ResolveNow.resolveImmediately((await lineup.v).data);
        p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
        p.getRankings().forEach(LinupTrackingManager.getInstance().untrackRanking);
    }
    withoutTracking(lineup, fun) {
        return lineup.v.then((d) => ResolveNow.resolveImmediately(d.data)).then((p) => {
            LinupTrackingManager.getInstance().temporaryUntracked.add(lineup.hash);
            const r = fun();
            LinupTrackingManager.getInstance().temporaryUntracked.delete(lineup.hash);
            return r;
        });
    }
    suffix(suffix, ...prefix) {
        return prefix.map((p) => `${p}${suffix}`);
    }
    static getInstance() {
        if (!LinupTrackingManager.instance) {
            LinupTrackingManager.instance = new LinupTrackingManager();
        }
        return LinupTrackingManager.instance;
    }
}
//# sourceMappingURL=cmds.js.map