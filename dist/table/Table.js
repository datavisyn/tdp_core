import { BaseUtils } from '../base/BaseUtils';
import { Range, ParseRangeUtils } from '../range';
import { LocalIDAssigner, IDTypeManager } from '../idtype';
import { ValueTypeUtils, DataCache } from '../data';
import { TableUtils } from './TableUtils';
import { ATable } from './ATable';
import { TableVector } from './internal/TableVector';
import { TableLoaderUtils } from './loader';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class Table extends ATable {
    constructor(desc, loader) {
        super(null);
        this.desc = desc;
        this.loader = loader;
        // set default column
        desc.columns.forEach((col) => col.column = col.column || col.name);
        this.root = this;
        this.vectors = desc.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
    }
    get idtype() {
        return IDTypeManager.getInstance().resolveIdType(this.desc.idtype || this.desc.rowtype);
    }
    get idtypes() {
        return [this.idtype];
    }
    col(i) {
        return this.vectors[i]; // TODO prevent `<any>` by using `<TableVector<any, IValueTypeDesc>>` leads to TS compile errors
    }
    cols(range = Range.all()) {
        return ParseRangeUtils.parseRangeLike(range).filter(this.vectors, [this.ncol]);
    }
    async at(row, col) {
        return (await this.colData(this.col(col).column, Range.list(row)))[0];
    }
    queryView(name, args) {
        return new Table(this.desc, TableLoaderUtils.adapterOne2Two(this.loader.view(this.desc, name, args)));
    }
    data(range = Range.all()) {
        return this.loader.data(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    colData(column, range = Range.all()) {
        return this.dataOfColumn(column, range);
    }
    dataOfColumn(column, range = Range.all()) {
        return this.loader.col(this.desc, column, ParseRangeUtils.parseRangeLike(range));
    }
    objects(range = Range.all()) {
        return this.loader.objs(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    rows(range = Range.all()) {
        return this.loader.rows(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    rowIds(range = Range.all()) {
        return this.loader.rowIds(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    ids(range = Range.all()) {
        return this.rowIds(range);
    }
    size() {
        return this.desc.size;
    }
    persist() {
        return this.desc.id;
    }
    restore(persisted) {
        if (persisted && typeof persisted.col === 'number') {
            return this.col(persisted.col);
        }
        return super.restore(persisted);
    }
    /**
     * module entry point for creating a datatype
     * @param desc
     * @param loader
     * @returns {ITable}
     */
    static create(desc, loader) {
        if (loader) {
            return new Table(desc, TableLoaderUtils.adapterOne2Two(loader));
        }
        return new Table(desc, TableLoaderUtils.viaAPI2Loader());
    }
    static wrapObjects(desc, data, nameProperty) {
        return new Table(desc, TableLoaderUtils.adapterOne2Two(TableLoaderUtils.viaDataLoader(data, nameProperty)));
    }
    static toObjects(data, cols) {
        return data.map((row) => {
            const r = {};
            cols.forEach((col, i) => r[col] = row[i]);
            return r;
        });
    }
    static toList(objs, cols) {
        return objs.map((obj) => cols.map((c) => obj[c]));
    }
    static asTableImpl(columns, rows, objs, data, options = {}) {
        const desc = BaseUtils.mixin(TableUtils.createDefaultTableDesc(), {
            columns,
            size: [rows.length, columns.length]
        }, options);
        const rowAssigner = options.rowassigner || LocalIDAssigner.create();
        const loader = () => {
            const r = {
                rowIds: rowAssigner(rows),
                rows,
                objs,
                data
            };
            return Promise.resolve(r);
        };
        return new Table(desc, TableLoaderUtils.adapterOne2Two(loader));
    }
    static asTableFromArray(data, options = {}) {
        const rows = data.map((r) => r[0]);
        const cols = data[0].slice(1);
        const tableData = data.slice(1).map((r) => r.slice(1));
        const columns = cols.map((col, i) => {
            return {
                name: col,
                column: col,
                value: ValueTypeUtils.guessValueTypeDesc(tableData.map((row) => row[i]))
            };
        });
        const realData = tableData.map((row) => columns.map((col, i) => (col.value.type === ValueTypeUtils.VALUE_TYPE_REAL || col.value.type === ValueTypeUtils.VALUE_TYPE_INT) ? parseFloat(row[i]) : row[i]));
        const objs = Table.toObjects(realData, cols);
        return Table.asTableImpl(columns, rows, objs, realData, options);
    }
    /**
     * Creates a new table from an array of arrays of data and an optional options data structure.
     * TODO: explain the relationship of this function and the "magic" JSON file.
     * @param data
     * @param options TODO - explain what these options are
     * @returns {Table}
     */
    static asTable(data, options = {}) {
        const keyProperty = options.keyProperty || '_id';
        const rows = data.map((r, i) => String(r[keyProperty] || i));
        const cols = Object.keys(data[0]);
        const objs = data;
        const realData = Table.toList(objs, cols);
        const columns = cols.map((col, i) => {
            return {
                name: col,
                column: col,
                value: ValueTypeUtils.guessValueTypeDesc(realData.map((row) => row[i]))
            };
        });
        return Table.asTableImpl(columns, rows, objs, realData, options);
    }
    /**
     * utility to convert a list of datatypes to a table compatible datatype object
     * @param list
     * @returns {any}
     */
    static convertToTable(list) {
        return Table.wrapObjects({
            id: '_data' + BaseUtils.randomId(5),
            name: 'data',
            description: 'list of data types',
            fqname: 'custom/data',
            creator: 'Anonymous',
            ts: Date.now(),
            type: 'table',
            idtype: '_data',
            size: [list.length, 4],
            columns: [
                {
                    name: 'Name',
                    value: {
                        type: 'string'
                    },
                    getter: (d) => d.desc.name
                },
                {
                    name: 'Type',
                    value: {
                        type: 'string'
                    },
                    getter: (d) => d.desc.type
                },
                {
                    name: 'Dimensions',
                    value: {
                        type: 'string'
                    },
                    getter: (d) => d.dim.join(' x ')
                },
                {
                    name: 'ID Types',
                    value: {
                        type: 'string'
                    },
                    getter: (d) => d.idtypes.join(' x ')
                },
            ]
        }, list, (d) => d.desc.name);
    }
    /**
     * utility function converting all contained tables in their vectors of individual columns
     * @param list
     * @returns {IDataType[]}
     */
    static convertTableToVectors(list) {
        const r = [];
        list.forEach((d) => {
            if (d.desc.type === 'table') {
                r.push(...d.cols());
            }
            else {
                r.push(d);
            }
        });
        return r;
    }
    /**
     * lists all datasets and converts them to a table
     * @param tablesAsVectors whether tables should be converted to individual vectors
     * @returns {Promise<*>}
     */
    static async listAsTable(tablesAsVectors = false) {
        let l = await DataCache.getInstance().list();
        if (tablesAsVectors) {
            l = Table.convertTableToVectors(l);
        }
        return Table.convertToTable(l);
    }
}
//# sourceMappingURL=Table.js.map