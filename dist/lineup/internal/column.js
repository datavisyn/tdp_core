import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { LineupUtils } from '../utils';
export class LazyColumn {
    static addLazyColumn(colDesc, data, provider, position, done) {
        const ranking = provider.getLastRanking();
        const accessor = LineupUtils.createAccessor(colDesc);
        // generate a unique column
        colDesc.column = colDesc.scoreID || `dC${colDesc.label.replace(/\s+/, '')}`;
        provider.pushDesc(colDesc);
        // mark as lazy loaded
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
        data.catch(ErrorAlertHandler.getInstance().errorAlert).catch(() => {
            ranking.remove(col);
        });
        // success
        const loaded = data.then(async (rows) => {
            accessor.setRows(rows);
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
        // mark as lazy loaded
        colDesc.lazyLoaded = !loaded;
    }
}
//# sourceMappingURL=column.js.map