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
        if (this.ignoreNext === event) {
            this.ignoreNext = null;
            return true;
        }
        return this.temporaryUntracked.has(lineup.hash);
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
            this.ignoreNext = LocalDataProvider.EVENT_REMOVE_RANKING;
            p.removeRanking(ranking);
            return {
                inverse: this.addRanking(inputs[0], parameter.index, ranking.dump(p.toDescRef))
            };
        }
        // add
        this.ignoreNext = LocalDataProvider.EVENT_ADD_RANKING;
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
            inverse: this.addRanking(inputs[0], parameter.index, null)
        }));
    }
    addRanking(provider, index, dump) {
        return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addRanking') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeRanking'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_RANKING, this.addRankingImpl, [provider], {
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
        const bak = this.toSortObject(ranking.getSortCriteria());
        this.ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
        //expects just null not undefined
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        ranking.sortBy(parameter.value.col ? (ranking.findByPath(parameter.value.col) || null) : null, parameter.value.asc);
        return waitForSorted({
            inverse: this.setRankingSortCriteria(inputs[0], parameter.rid, bak)
        });
    }
    setRankingSortCriteria(provider, rid, value) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIA, this.setRankingSortCriteriaImpl, [provider], {
            rid,
            value
        });
    }
    async setSortCriteriaImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        let current;
        const columns = parameter.columns.map((c) => ({ col: ranking.findByPath(c.col), asc: c.asc }));
        if (parameter.isSorting) {
            current = ranking.getSortCriteria();
            this.ignoreNext = Ranking.EVENT_SORT_CRITERIA_CHANGED;
            ranking.setSortCriteria(columns);
        }
        else {
            current = ranking.getGroupSortCriteria();
            this.ignoreNext = Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED;
            ranking.setGroupSortCriteria(columns);
        }
        return waitForSorted({
            inverse: this.setSortCriteria(inputs[0], parameter.rid, current.map(this.toSortObject), parameter.isSorting)
        });
    }
    setSortCriteria(provider, rid, columns, isSorting = true) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeSortCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_SORTING_CRITERIAS, this.setSortCriteriaImpl, [provider], {
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
        this.ignoreNext = Ranking.EVENT_GROUP_CRITERIA_CHANGED;
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        ranking.setGroupCriteria(columns);
        return waitForSorted({
            inverse: this.setGroupCriteria(inputs[0], parameter.rid, current)
        });
    }
    setGroupCriteria(provider, rid, columns) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.changeGroupCriteria'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_GROUP_CRITERIA, this.setGroupCriteriaImpl, [provider], {
            rid,
            columns
        });
    }
    async setColumnImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        const prop = parameter.prop[0].toUpperCase() + parameter.prop.slice(1);
        let bak = null;
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        let source = ranking;
        if (parameter.path) {
            source = ranking.findByPath(parameter.path);
        }
        this.ignoreNext = `${parameter.prop}Changed`;
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
                    source[`set${prop}`].call(source, this.restoreRegExp(parameter.value)); // restore serialized regular expression before passing to LineUp
                    break;
            }
        }
        return waitForSorted({
            inverse: this.setColumn(inputs[0], parameter.rid, parameter.path, parameter.prop, bak)
        });
    }
    setColumn(provider, rid, path, prop, value) {
        // assert ALineUpView and update the stats
        provider.value.getInstance().updateLineUpStats();
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.setProperty', { prop }), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_SET_COLUMN, this.setColumnImpl, [provider], {
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
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        const index = parameter.index;
        let bak = null;
        if (parameter.path) {
            parent = ranking.findByPath(parameter.path);
        }
        if (parent) {
            if (parameter.dump) { //add
                this.ignoreNext = Ranking.EVENT_ADD_COLUMN;
                parent.insert(p.restoreColumn(parameter.dump), index);
            }
            else { //remove
                bak = parent.at(index);
                this.ignoreNext = Ranking.EVENT_REMOVE_COLUMN;
                parent.remove(bak);
            }
        }
        return waitForSorted({
            inverse: this.addColumn(inputs[0], parameter.rid, parameter.path, index, parameter.dump || !bak ? null : p.dumpColumn(bak))
        });
    }
    async moveColumnImpl(inputs, parameter) {
        const p = await ResolveNow.resolveImmediately((await inputs[0].v).data);
        const ranking = p.getRankings()[parameter.rid];
        let parent = ranking;
        const waitForSorted = this.dirtyRankingWaiter(ranking);
        const index = parameter.index;
        const target = parameter.moveTo;
        let bak = null;
        if (parameter.path) {
            parent = ranking.findByPath(parameter.path);
        }
        if (parent) {
            bak = parent.at(index);
            this.ignoreNext = Ranking.EVENT_MOVE_COLUMN;
            parent.move(bak, target);
        }
        return waitForSorted({
            //shift since indices shifted
            inverse: this.moveColumn(inputs[0], parameter.rid, parameter.path, target, index > target ? index + 1 : target)
        });
    }
    addColumn(provider, rid, path, index, dump) {
        return ActionUtils.action(ActionMetaData.actionMeta(dump ? I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.addColumn') : I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.removeColumn'), ObjectRefUtils.category.layout, dump ? ObjectRefUtils.operation.create : ObjectRefUtils.operation.remove), CMD_ADD_COLUMN, this.addColumnImpl, [provider], {
            rid,
            path,
            index,
            dump
        });
    }
    moveColumn(provider, rid, path, index, moveTo) {
        return ActionUtils.action(ActionMetaData.actionMeta(I18nextManager.getInstance().i18n.t('tdp:core.lineup.cmds.moveColumn'), ObjectRefUtils.category.layout, ObjectRefUtils.operation.update), CMD_MOVE_COLUMN, this.moveColumnImpl, [provider], {
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
            if (this.ignore(`${property}Changed`, lineupViewWrapper)) {
                return;
            }
            const newSerializedValue = this.serializeRegExp(newValue); // serialize possible RegExp object to be properly stored as provenance graph
            if (source instanceof Column) {
                // assert ALineUpView and update the stats
                lineupViewWrapper.value.getInstance().updateLineUpStats();
                const rid = this.rankingId(provider, source.findMyRanker());
                const path = source.fqpath;
                graph.pushWithResult(this.setColumn(lineupViewWrapper, rid, path, property, newSerializedValue), {
                    inverse: this.setColumn(lineupViewWrapper, rid, path, property, old)
                });
            }
            else if (source instanceof Ranking) {
                const rid = this.rankingId(provider, source);
                graph.pushWithResult(this.setColumn(lineupViewWrapper, rid, null, property, newSerializedValue), {
                    inverse: this.setColumn(lineupViewWrapper, rid, null, property, old)
                });
            }
        };
        source.on(`${property}Changed.track`, delayed > 0 ? this.delayedCall(f, delayed) : f);
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
        this.recordPropertyChange(col, provider, lineup, graph, 'metaData');
        this.recordPropertyChange(col, provider, lineup, graph, 'filter');
        this.recordPropertyChange(col, provider, lineup, graph, 'rendererType');
        this.recordPropertyChange(col, provider, lineup, graph, 'groupRenderer');
        this.recordPropertyChange(col, provider, lineup, graph, 'summaryRenderer');
        this.recordPropertyChange(col, provider, lineup, graph, 'sortMethod');
        //recordPropertyChange(col, provider, lineup, graph, 'width', 100);
        if (col instanceof CompositeColumn) {
            col.on(`${CompositeColumn.EVENT_ADD_COLUMN}.track`, (column, index) => {
                this.trackColumn(provider, lineup, graph, column);
                if (this.ignore(CompositeColumn.EVENT_ADD_COLUMN, lineup)) {
                    return;
                }
                // console.log(col.fqpath, 'addColumn', column, index);
                const d = provider.dumpColumn(column);
                const rid = this.rankingId(provider, col.findMyRanker());
                const path = col.fqpath;
                graph.pushWithResult(this.addColumn(lineup, rid, path, index, d), {
                    inverse: this.addColumn(lineup, rid, path, index, null)
                });
            });
            col.on(`${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, (column, index) => {
                this.untrackColumn(column);
                if (this.ignore(CompositeColumn.EVENT_REMOVE_COLUMN, lineup)) {
                    return;
                }
                // console.log(col.fqpath, 'addColumn', column, index);
                const d = provider.dumpColumn(column);
                const rid = this.rankingId(provider, col.findMyRanker());
                const path = col.fqpath;
                graph.pushWithResult(this.addColumn(lineup, rid, path, index, null), {
                    inverse: this.addColumn(lineup, rid, path, index, d)
                });
            });
            col.on(`${CompositeColumn.EVENT_MOVE_COLUMN}.track`, (column, index, oldIndex) => {
                if (this.ignore(CompositeColumn.EVENT_MOVE_COLUMN, lineup)) {
                    return;
                }
                // console.log(col.fqpath, 'addColumn', column, index);
                const rid = this.rankingId(provider, col.findMyRanker());
                const path = col.fqpath;
                graph.pushWithResult(this.moveColumn(lineup, rid, path, oldIndex, index), {
                    inverse: this.moveColumn(lineup, rid, path, index, oldIndex > index ? oldIndex + 1 : oldIndex)
                });
            });
            col.children.forEach(this.trackColumn.bind(this, provider, lineup, graph));
            if (col instanceof StackColumn) {
                this.recordPropertyChange(col, provider, lineup, graph, 'weights', 100);
            }
        }
        else if (col instanceof NumberColumn) {
            col.on(`${NumberColumn.EVENT_MAPPING_CHANGED}.track`, (old, newValue) => {
                if (this.ignore(NumberColumn.EVENT_MAPPING_CHANGED, lineup)) {
                    return;
                }
                // console.log(col.fqpath, 'mapping', old.dump(), newValue.dump());
                const rid = this.rankingId(provider, col.findMyRanker());
                const path = col.fqpath;
                graph.pushWithResult(this.setColumn(lineup, rid, path, 'mapping', newValue.dump()), {
                    inverse: this.setColumn(lineup, rid, path, 'mapping', old.dump())
                });
            });
        }
        else if (col instanceof ScriptColumn) {
            this.recordPropertyChange(col, provider, lineup, graph, 'script');
        }
        else if (col instanceof OrdinalColumn) {
            this.recordPropertyChange(col, provider, lineup, graph, 'mapping');
        }
    }
    untrackColumn(col) {
        col.on(this.suffix('Changed.filter', 'metaData', 'filter', 'width', 'rendererType', 'groupRenderer', 'summaryRenderer', 'sortMethod'), null);
        if (col instanceof CompositeColumn) {
            col.on([`${CompositeColumn.EVENT_ADD_COLUMN}.track`, `${CompositeColumn.EVENT_REMOVE_COLUMN}.track`, `${CompositeColumn.EVENT_MOVE_COLUMN}.track`], null);
            col.children.forEach(this.untrackColumn);
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
            if (this.ignore(Ranking.EVENT_SORT_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.setSortCriteria(lineup, rid, newValue.map(this.toSortObject)), {
                inverse: this.setSortCriteria(lineup, rid, old.map(this.toSortObject))
            });
        });
        ranking.on(`${Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED}.track`, (old, newValue) => {
            if (this.ignore(Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.setSortCriteria(lineup, rid, newValue.map(this.toSortObject), false), {
                inverse: this.setSortCriteria(lineup, rid, old.map(this.toSortObject), false)
            });
        });
        ranking.on(`${Ranking.EVENT_GROUP_CRITERIA_CHANGED}.track`, (old, newValue) => {
            if (this.ignore(Ranking.EVENT_GROUP_CRITERIA_CHANGED, lineup)) {
                return;
            }
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.setGroupCriteria(lineup, rid, newValue.map((c) => c.fqpath)), {
                inverse: this.setGroupCriteria(lineup, rid, old.map((c) => c.fqpath))
            });
        });
        ranking.on(`${Ranking.EVENT_ADD_COLUMN}.track`, (column, index) => {
            this.trackColumn(provider, lineup, graph, column);
            if (this.ignore(Ranking.EVENT_ADD_COLUMN, lineup)) {
                return;
            }
            // console.log(ranking, 'addColumn', column, index);
            const d = provider.dumpColumn(column);
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.addColumn(lineup, rid, null, index, d), {
                inverse: this.addColumn(lineup, rid, null, index, null)
            });
        });
        ranking.on(`${Ranking.EVENT_REMOVE_COLUMN}.track`, (column, index) => {
            this.untrackColumn(column);
            if (this.ignore(Ranking.EVENT_REMOVE_COLUMN, lineup)) {
                return;
            }
            // console.log(ranking, 'removeColumn', column, index);
            const d = provider.dumpColumn(column);
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.addColumn(lineup, rid, null, index, null), {
                inverse: this.addColumn(lineup, rid, null, index, d)
            });
        });
        ranking.on(`${Ranking.EVENT_MOVE_COLUMN}.track`, (_, index, oldIndex) => {
            if (this.ignore(Ranking.EVENT_MOVE_COLUMN, lineup)) {
                return;
            }
            // console.log(col.fqpath, 'addColumn', column, index);
            const rid = this.rankingId(provider, ranking);
            graph.pushWithResult(this.moveColumn(lineup, rid, null, oldIndex, index), {
                inverse: this.moveColumn(lineup, rid, null, index, oldIndex > index ? oldIndex + 1 : oldIndex)
            });
        });
        ranking.children.forEach(this.trackColumn.bind(this, provider, lineup, graph));
    }
    untrackRanking(ranking) {
        ranking.on(this.suffix('.track', Ranking.EVENT_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_SORT_CRITERIA_CHANGED, Ranking.EVENT_GROUP_CRITERIA_CHANGED, Ranking.EVENT_ADD_COLUMN, Ranking.EVENT_REMOVE_COLUMN, Ranking.EVENT_MOVE_COLUMN), null);
        ranking.children.forEach(this.untrackColumn);
    }
    /**
     * clueifies lineup
     * @param lineup the object ref on the lineup provider instance
     * @param graph
     */
    async clueify(lineup, graph) {
        const p = await ResolveNow.resolveImmediately((await lineup.v).data);
        p.on(`${LocalDataProvider.EVENT_ADD_RANKING}.track`, (ranking, index) => {
            if (this.ignore(LocalDataProvider.EVENT_ADD_RANKING, lineup)) {
                return;
            }
            const d = ranking.dump(p.toDescRef);
            graph.pushWithResult(this.addRanking(lineup, index, d), {
                inverse: this.addRanking(lineup, index, null)
            });
            this.trackRanking(p, lineup, graph, ranking);
        });
        p.on(`${LocalDataProvider.EVENT_REMOVE_RANKING}.track`, (ranking, index) => {
            if (this.ignore(LocalDataProvider.EVENT_REMOVE_RANKING, lineup)) {
                return;
            }
            const d = ranking.dump(p.toDescRef);
            graph.pushWithResult(this.addRanking(lineup, index, null), {
                inverse: this.addRanking(lineup, index, d)
            });
            this.untrackRanking(ranking);
        });
        p.getRankings().forEach(this.trackRanking.bind(this, p, lineup, graph));
    }
    async untrack(lineup) {
        const p = await ResolveNow.resolveImmediately((await lineup.v).data);
        p.on([`${LocalDataProvider.EVENT_ADD_RANKING}.track`, `${LocalDataProvider.EVENT_REMOVE_RANKING}.track`], null);
        p.getRankings().forEach(this.untrackRanking);
    }
    withoutTracking(lineup, fun) {
        return lineup.v.then((d) => ResolveNow.resolveImmediately(d.data)).then((p) => {
            this.temporaryUntracked.add(lineup.hash);
            const r = fun();
            this.temporaryUntracked.delete(lineup.hash);
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