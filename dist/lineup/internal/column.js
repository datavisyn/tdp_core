/**
 * Created by Samuel Gratzl on 12.09.2017.
 */
import { toCategories } from 'lineupjs';
import { LineupUtils } from '../utils';
import { EP_TDP_CORE_SCORE_COLUMN_PATCHER } from '../../base/extensions';
import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { extent, min, max } from 'd3';
import { PluginRegistry } from 'phovea_core';
function extentByType(type, rows, acc) {
    switch (type) {
        case 'numbers':
            return [min(rows, (d) => min(acc(d))), max(rows, (d) => max(acc(d)))];
        case 'boxplot':
            return [min(rows, (d) => acc(d).min), max(rows, (d) => acc(d).max)];
        default:
            return extent(rows, acc);
    }
}
export class LazyColumn {
    static addLazyColumn(colDesc, data, provider, position, done) {
        const ranking = provider.getLastRanking();
        const accessor = LineupUtils.createAccessor(colDesc);
        // generate a unique column
        colDesc.column = colDesc.scoreID || `dC${colDesc.label.replace(/\s+/, '')}`;
        provider.pushDesc(colDesc);
        //mark as lazy loaded
        colDesc.lazyLoaded = true;
        const col = provider.create(colDesc);
        if (position == null) {
            ranking.push(col);
        }
        else {
            if (position < 0) {
                position = ranking.children.length - -position + 1; // -- since negative
            }
            ranking.insert(col, position);
        }
        if (colDesc.sortedByMe) {
            col.sortByMe(colDesc.sortedByMe === true || colDesc.sortedByMe === 'asc');
        }
        if (colDesc.groupByMe) {
            col.groupByMe();
        }
        // error handling
        data
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch(() => {
            ranking.remove(col);
        });
        // success
        const loaded = data.then(async (rows) => {
            accessor.setRows(rows);
            await LazyColumn.patchColumn(colDesc, rows, col);
            LazyColumn.markLoaded(provider, colDesc, true);
            if (done) {
                done();
            }
            return col;
        });
        const reload = (newData) => {
            accessor.clear();
            LazyColumn.markLoaded(provider, colDesc, false);
            newData.catch(ErrorAlertHandler.getInstance().errorAlert);
            // success
            return newData.then(async (rows) => {
                accessor.setRows(rows);
                await LazyColumn.patchColumn(colDesc, rows, col);
                LazyColumn.markLoaded(provider, colDesc, true);
                return col;
            });
        };
        return { col, loaded, reload };
    }
    static markLoaded(provider, colDesc, loaded) {
        // find all columns with the same descriptions (generated snapshots) to set their `setLoaded` value
        provider.getRankings().forEach((ranking) => {
            const columns = ranking.flatColumns.filter((rankCol) => rankCol.desc === colDesc);
            columns.forEach((column) => column.setLoaded(loaded));
        });
        // mark the description as loaded true
        //mark as lazy loaded
        colDesc.lazyLoaded = !loaded;
    }
    static async patchColumn(colDesc, rows, col) {
        if (colDesc.type === 'number' || colDesc.type === 'boxplot' || colDesc.type === 'numbers') {
            const ncol = col;
            if (!(colDesc.constantDomain) || (colDesc.constantDomain === 'max' || colDesc.constantDomain === 'min')) { //create a dynamic range if not fixed
                const domain = extentByType(colDesc.type, rows, (d) => d.score);
                if (colDesc.constantDomain === 'min') {
                    domain[0] = colDesc.domain[0];
                }
                else if (colDesc.constantDomain === 'max') {
                    domain[1] = colDesc.domain[1];
                }
                //HACK by pass the setMapping function and set it inplace
                const ori = ncol.original;
                const current = ncol.mapping;
                colDesc.domain = domain;
                ori.domain = domain;
                current.domain = domain;
            }
        }
        if (colDesc.type === 'numbers' && rows.length > 0) {
            // hack in the data length
            const ncol = col;
            const columns = rows._columns;
            // inject labels
            if (columns) {
                ncol.originalLabels = colDesc.labels = columns;
            }
            ncol._dataLength = colDesc.dataLength = rows[0].score.length;
            ncol.setSplicer({ length: rows[0].score.length, splice: (d) => d });
        }
        if (colDesc.type === 'categorical' && rows._categories) {
            const ccol = col;
            colDesc.categories = rows._categories;
            const categories = toCategories(colDesc);
            ccol.categories = categories;
            ccol.lookup.clear();
            categories.forEach((c) => ccol.lookup.set(c.name, c));
        }
        // Await all patchers to complete before returning
        await Promise.all(PluginRegistry.getInstance().listPlugins(EP_TDP_CORE_SCORE_COLUMN_PATCHER).map(async (pluginDesc) => {
            const plugin = await pluginDesc.load();
            plugin.factory(pluginDesc, colDesc, rows, col);
        }));
    }
}
//# sourceMappingURL=column.js.map