import { Ranking } from 'lineupjs';
import { Ajax } from 'visyn_core';
import { RestBaseUtils } from '../base/rest';
import { FormMap } from '../form/elements/FormMap';
export class AScoreAccessorProxy {
    constructor(missingValue = null) {
        this.missingValue = missingValue;
        /**
         * the accessor for the score column
         * @param row
         */
        this.accessor = (row) => this.access(row.v);
        this.scores = new Map();
    }
    clear() {
        this.scores.clear();
    }
    setRows(rows) {
        rows.forEach(({ id, score }) => this.scores.set(String(id), score));
    }
    access(row) {
        const rowId = String(row.id);
        if (this.scores === null || !this.scores.has(rowId)) {
            return this.missingValue;
        }
        return this.scores.get(rowId);
    }
}
class NumberScoreAccessorProxy extends AScoreAccessorProxy {
}
class CategoricalScoreAccessorProxy extends AScoreAccessorProxy {
    access(row) {
        const v = super.access(row);
        return String(v); // even null values;
    }
}
export class LineupUtils {
    /**
     * Wraps the score such that the plugin is loaded and the score modal opened, when the factory function is called
     * @param score
     * @returns {IScoreLoader}
     */
    static wrap(score) {
        return {
            text: score.name,
            id: score.id,
            scoreId: score.id,
            factory(extraArgs, count) {
                return score.load().then((p) => Promise.resolve(p.factory(score, extraArgs, count)));
            },
        };
    }
    /**
     * creates and accessor helper
     * @param colDesc
     * @returns {CategoricalScoreAccessorProxy|NumberScoreAccessorProxy}
     */
    static createAccessor(colDesc) {
        const accessor = colDesc.type === 'categorical' ? new CategoricalScoreAccessorProxy(colDesc.missingValue) : new NumberScoreAccessorProxy(colDesc.missingValue);
        colDesc.accessor = accessor.accessor;
        return accessor;
    }
    /**
     * converts the given filter object to request params
     * @param filter input filter
     */
    static toFilter(filter) {
        if (Array.isArray(filter)) {
            // map first
            return LineupUtils.toFilter(FormMap.convertRow2MultiMap(filter));
        }
        const clean = (v) => {
            if (Array.isArray(v)) {
                return v.map(clean);
            }
            if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
                return v.id;
            }
            return v;
        };
        const param = {};
        Object.keys(filter).forEach((k) => {
            param[k] = clean(filter[k]);
        });
        return param;
    }
    static toFilterString(filter, key2name) {
        const keys = Object.keys(filter);
        if (keys.length === 0) {
            return '<None>';
        }
        const toString = (v) => {
            if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
                return v.text;
            }
            return v.toString();
        };
        return keys
            .map((d) => {
            const v = filter[d];
            const label = key2name && key2name.has(d) ? key2name.get(d) : d;
            const vn = Array.isArray(v) ? `["${v.map(toString).join('","')}"]` : `"${toString(v)}"`;
            return `${label}=${vn}`;
        })
            .join(' & ');
    }
    /**
     * generator for a FormMap compatible badgeProvider based on the given database url
     */
    static previewFilterHint(database, view, extraParams) {
        let total = null;
        const cache = new Map();
        return (rows) => {
            if (total === null) {
                // compute all by no setting any filter
                total = RestBaseUtils.getTDPCount(database, view, extraParams ? extraParams() : {});
            }
            if (!rows) {
                // if no filter is set return all
                return total.then((count) => `${count} / ${count}`);
            }
            // compute filtered ones
            const filter = LineupUtils.toFilter(rows);
            const param = {};
            if (extraParams) {
                Object.assign(param, extraParams());
            }
            const key = `${Ajax.encodeParams(param)}@${Ajax.encodeParams(filter)}`;
            if (!cache.has(key)) {
                cache.set(key, RestBaseUtils.getTDPCount(database, view, param, filter));
            }
            return Promise.all([total, cache.get(key)]).then((results) => {
                return `${results[1]} / ${results[0]}`;
            }, () => {
                // ignore error and return dunno
                return `? / ?`;
            });
        };
    }
    static wrapRanking(data, ranking) {
        const findColumn = (column) => ranking.find((d) => d.desc.column === column || d.desc.label === column);
        return {
            findColumn,
            sortBy: (column, asc = true) => {
                const col = findColumn(column);
                if (!col) {
                    return false;
                }
                ranking.setSortCriteria({ col, asc });
                return true;
            },
            groupBy: (column, aggregate = false) => {
                const col = findColumn(column);
                if (!col) {
                    return false;
                }
                ranking.setGroupCriteria([col]);
                if (aggregate) {
                    ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, () => {
                        data.aggregateAllOf(ranking, true);
                        ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, null);
                    });
                }
                return true;
            },
        };
    }
}
//# sourceMappingURL=utils.js.map