import { AppContext } from '../app/AppContext';
import { Range, ParseRangeUtils } from '../range';
import { ValueTypeUtils } from '../data';
import { IDTypeManager } from '../idtype';
function filterObjects(objs, range, desc) {
    if (range.isAll) {
        return objs;
    }
    objs = range.dim(0).filter(objs, desc.size[0]);
    if (range.ndim > 1 && !range.dim(1).isAll) {
        // filter the columns by index
        const toKeep = range.dim(1).filter(desc.columns, desc.columns.length);
        const toKeepNames = toKeep.map((col) => col.column || col.name);
        return objs.map((obj) => {
            const r = {};
            toKeepNames.forEach((key) => (r[key] = obj[key]));
            return r;
        });
    }
    return objs;
}
export class TableLoaderUtils {
    /**
     * @internal
     */
    static viaAPIViewLoader(name, args) {
        let _loader;
        return (desc) => {
            if (!_loader) {
                // in the cache
                _loader = AppContext.getInstance()
                    .getAPIJSON(`/dataset/table/${desc.id}/view/${name}`, args)
                    .then((data) => {
                    data.rowIds = ParseRangeUtils.parseRangeLike(data.rowIds);
                    data.objs = TableLoaderUtils.maskObjects(data.data, desc);
                    // mask the data
                    return data;
                });
            }
            return _loader;
        };
    }
    static maskCol(arr, col) {
        // mask data
        if (col.value && (col.value.type === ValueTypeUtils.VALUE_TYPE_INT || col.value.type === ValueTypeUtils.VALUE_TYPE_REAL)) {
            return ValueTypeUtils.mask(arr, col.value);
        }
        return arr;
    }
    static maskObjects(arr, desc) {
        // mask data
        const maskAble = desc.columns.filter((col) => col.value && (col.value.type === ValueTypeUtils.VALUE_TYPE_INT || col.value.type === ValueTypeUtils.VALUE_TYPE_REAL));
        if (maskAble.length > 0) {
            arr.forEach((row) => {
                maskAble.forEach((col) => (row[col.name] = ValueTypeUtils.mask(row[col.name], col.value)));
            });
        }
        return arr;
    }
    /**
     * @internal
     */
    static viaAPI2Loader() {
        const cols = {};
        let rowIds = null;
        let rows = null;
        let objs = null;
        let data = null;
        function fillIds(desc) {
            if (rowIds !== null && rows !== null) {
                Promise.all([rowIds, rows]).then(([rowIdValues, rowValues]) => {
                    const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
                    const rowIds = ParseRangeUtils.parseRangeLike(rowIdValues);
                    idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
                });
            }
        }
        const r = {
            rowIds: (desc, range) => {
                if (rowIds == null) {
                    rowIds = AppContext.getInstance().getAPIJSON(`/dataset/table/${desc.id}/rowIds`).then(ParseRangeUtils.parseRangeLike);
                    fillIds(desc);
                }
                return rowIds.then((d) => d.preMultiply(range, desc.size));
            },
            rows: (desc, range) => {
                if (rows == null) {
                    rows = AppContext.getInstance().getAPIJSON(`/dataset/table/${desc.id}/rows`);
                    fillIds(desc);
                }
                return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
            },
            objs: (desc, range) => {
                if (objs == null && (range.isAll || desc.loadAtOnce)) {
                    objs = AppContext.getInstance()
                        .getAPIJSON(`/dataset/table/${desc.id}/raw`)
                        .then((data) => TableLoaderUtils.maskObjects(data, desc));
                }
                if (range.isAll) {
                    return objs;
                }
                if (objs != null) {
                    // already loading all
                    return objs.then((d) => range.filter(d, desc.size));
                }
                // server side slicing
                return AppContext.getInstance()
                    .getAPIData(`/dataset/table/${desc.id}/raw`, { range: range.toString() })
                    .then((data) => TableLoaderUtils.maskObjects(data, desc));
            },
            data: (desc, range) => {
                if (data == null && (range.isAll || desc.loadAtOnce)) {
                    data = r.objs(desc, Range.all()).then((objs) => TableLoaderUtils.toFlat(objs, desc.columns));
                }
                if (range.isAll) {
                    return data;
                }
                if (data != null) {
                    // already loading all
                    return data.then((d) => range.filter(d, desc.size));
                }
                // server side slicing
                return r.objs(desc, range).then((objs) => TableLoaderUtils.toFlat(objs, desc.columns));
            },
            col: (desc, column, range) => {
                const colDesc = desc.columns.find((c) => c.column === column || c.name === column);
                if (cols[column] == null && (range.isAll || desc.loadAtOnce)) {
                    if (objs === null) {
                        if (desc.loadAtOnce) {
                            objs = AppContext.getInstance()
                                .getAPIJSON(`/dataset/table/${desc.id}/raw`)
                                .then((data) => TableLoaderUtils.maskObjects(data, desc));
                            cols[column] = objs.then((objs) => objs.map((row) => row[column]));
                        }
                        else {
                            cols[column] = AppContext.getInstance()
                                .getAPIJSON(`/dataset/table/${desc.id}/col/${column}`)
                                .then((data) => TableLoaderUtils.maskCol(data, colDesc));
                        }
                    }
                    else {
                        cols[column] = objs.then((objs) => objs.map((row) => row[column]));
                    }
                }
                if (range.isAll) {
                    return cols[column];
                }
                if (cols[column] != null) {
                    // already loading all
                    return cols[column].then((d) => filterObjects(d, range, desc));
                }
                // server side slicing
                return AppContext.getInstance()
                    .getAPIData(`/dataset/table/${desc.id}/col/${column}`, { range: range.toString() })
                    .then((data) => TableLoaderUtils.maskCol(data, colDesc));
            },
            view: (desc, name, args) => TableLoaderUtils.viaAPIViewLoader(name, args),
        };
        return r;
    }
    static toFlat(data, vecs) {
        return data.map((row) => vecs.map((col) => row[col.column]));
    }
    /**
     * @internal
     */
    static viaDataLoader(data, nameProperty) {
        let _data;
        return (desc) => {
            if (_data) {
                // in the cache
                return Promise.resolve(_data);
            }
            const name = typeof nameProperty === 'function' ? nameProperty : (d) => d[nameProperty.toString()];
            function toGetter(col) {
                if (col.getter) {
                    return col.getter;
                }
                return (d) => d[col.column];
            }
            const getters = desc.columns.map(toGetter);
            const objs = data.map((row) => {
                const r = { _: row };
                desc.columns.forEach((col, i) => {
                    r[col.column] = getters[i](row);
                });
                return r;
            });
            const rows = data.map(name);
            _data = {
                rowIds: desc.rowassigner ? desc.rowassigner.map(rows) : Range.range(0, data.length),
                rows,
                objs,
                data: getters.map((getter) => data.map(getter)),
            };
            return Promise.resolve(_data);
        };
    }
    /**
     * @internal
     */
    static adapterOne2Two(loader) {
        return {
            rowIds: (desc, range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
            rows: (desc, range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
            col: (desc, column, range) => loader(desc).then((d) => range.filter(d.objs.map((d) => d[column]), desc.size)),
            objs: (desc, range) => loader(desc).then((d) => filterObjects(d.objs, range, desc)),
            data: (desc, range) => loader(desc).then((d) => range.filter(TableLoaderUtils.toFlat(d.objs, desc.columns), desc.size)),
            view: (desc, name, args) => {
                throw new Error('not implemented');
            },
        };
    }
}
//# sourceMappingURL=loader.js.map