import { createSelectionDesc, createAggregateDesc, DEFAULT_COLOR, createRankDesc } from 'lineupjs';
import { extent } from 'd3v3';
export class ColumnDescUtils {
    static baseColumn(column, options = {}) {
        return {
            type: 'string',
            // @ts-ignore
            column,
            label: column,
            color: '',
            initialRanking: options.visible != null ? options.visible : true,
            width: -1,
            selectedId: null,
            selectedSubtype: undefined,
            ...options,
            ...(options.extras || {}),
        };
    }
    static numberColFromArray(column, rows, options = {}) {
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {
            type: 'number',
            domain: extent(rows, (d) => d[column]),
        });
    }
    /**
     * creates a new LineUp description for a numerical column
     * @param {string} column the column name to use
     * @param {number} min the input minimal value
     * @param {number} max the input maximal value
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static numberCol(column, min, max, options = {}) {
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {
            type: 'number',
            domain: [min || Number.NaN, max || Number.NaN],
        });
    }
    /**
     * creates a new LineUp description for a categorical column
     * @param {string} column the column name to use
     * @param {(string | Partial<ICategory>)[]} categories description of the categories
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     * @deprecated use `LineUpBuilder` instead, i.e. `buildCategoricalColumn(column).categories(categories).custom('initialRanking', true)`.
     */
    static categoricalCol(column, categories, options = {}) {
        if (ColumnDescUtils.isHierarchical(categories)) {
            return ColumnDescUtils.hierarchicalCol(column, ColumnDescUtils.deriveHierarchy(categories), options);
        }
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {
            type: 'categorical',
            categories,
        });
    }
    static hierarchicalCol(column, hierarchy, options = {}) {
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {
            type: 'hierarchy',
            hierarchy,
        });
    }
    /**
     * creates a new LineUp description for a string column
     * @param {string} column the column name to use
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static stringCol(column, options = {}) {
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {});
    }
    /**
     * creates a new LineUp description for a link column
     * @param {string} column the column name to use
     * @param {string} linkPattern the pattern to resolve links from values, $1 will be replaced by the current value, $2 with the URL encoded version of it
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static linkCol(column, linkPattern, options = {}) {
        return Object.assign(ColumnDescUtils.stringCol(column, options), {
            type: 'link',
            pattern: linkPattern,
        });
    }
    /**
     * creates a new LineUp description for a boolean column
     * @param {string} column the column name to use
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static booleanCol(column, options = {}) {
        return Object.assign(ColumnDescUtils.baseColumn(column, options), {
            type: 'boolean',
        });
    }
    static createInitialRanking(provider, options = {}) {
        const o = { aggregate: true, selection: true, rank: true, order: [], ...options };
        const ranking = provider.pushRanking();
        const r = ranking.find((d) => d.desc.type === 'rank');
        if (o.rank) {
            if (!r) {
                ranking.insert(provider.create(createRankDesc()), 0);
            }
        }
        else if (r) {
            r.removeMe();
        }
        if (o.aggregate) {
            ranking.insert(provider.create(createAggregateDesc()), 0);
        }
        if (o.selection) {
            ranking.push(provider.create(createSelectionDesc()));
        }
        const resolve = () => {
            const all = provider.getColumns();
            const cols = [];
            o.order.forEach((c) => {
                const col = all.find((d) => d.column === c || d.label === c);
                if (col) {
                    cols.push(col);
                }
            });
            return cols;
        };
        const visibles = provider.getColumns().filter((d) => d.initialRanking);
        const descs = o.order.length > 0 ? resolve() : visibles;
        descs.forEach((d) => {
            const col = provider.create(d);
            ranking.push(col);
        });
    }
    static deriveColumns(columns) {
        const niceName = (label) => label
            .split('_')
            .map((l) => l[0].toUpperCase() + l.slice(1))
            .join(' ');
        return columns.map((col) => {
            switch (col.type) {
                case 'categorical':
                    return ColumnDescUtils.categoricalCol(col.column, col.categories, { label: niceName(col.label) });
                case 'number':
                    return ColumnDescUtils.numberCol(col.column, col.min, col.max, { label: niceName(col.label) });
                default:
                    return ColumnDescUtils.stringCol(col.column, { label: niceName(col.label) });
            }
        });
    }
    static isHierarchical(categories) {
        if (categories?.length === 0 || typeof categories?.[0] === 'string') {
            return false;
        }
        // check if any has a given parent name
        return categories?.some((c) => c.parent != null);
    }
    static deriveHierarchy(categories) {
        const lookup = new Map();
        categories.forEach((c) => {
            const p = c.parent || '';
            // set and fill up proxy
            const item = Object.assign({
                children: [],
                label: c.name,
                name: c.name,
                color: DEFAULT_COLOR,
                value: 0,
            }, lookup.get(c.name) || {}, c);
            lookup.set(c.name, item);
            if (!lookup.has(p)) {
                // create proxy
                lookup.set(p, { name: p, children: [], label: p, value: 0, color: DEFAULT_COLOR });
            }
            lookup.get(p).children.push(item);
        });
        const root = lookup.get('');
        console.assert(root !== undefined, 'hierarchy with no root');
        if (root.children.length === 1) {
            return root.children[0];
        }
        return root;
    }
}
//# sourceMappingURL=desc.js.map