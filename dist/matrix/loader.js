import { AppContext } from '../app/AppContext';
import { Range, ParseRangeUtils } from '../range';
import { ValueTypeUtils } from '../data';
import { Histogram } from '../data/histogram';
import { IDTypeManager } from '../idtype';
export class MatrixLoaderHelper {
    static adapterOne2Two(loader) {
        return {
            rowIds: (desc, range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
            rows: (desc, range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
            colIds: (desc, range) => loader(desc).then((d) => range.preMultiply(d.colIds, desc.size)),
            cols: (desc, range) => loader(desc).then((d) => range.dim(1).filter(d.cols, desc.size[1])),
            ids: (desc, range) => loader(desc).then((d) => range.preMultiply(d.ids, desc.size)),
            at: (desc, i, j) => loader(desc).then((d) => d.data[i][j]),
            data: (desc, range) => loader(desc).then((d) => range.filter(d.data, desc.size))
        };
    }
    static maskIt(desc) {
        if (desc.value.type === ValueTypeUtils.VALUE_TYPE_INT || desc.value.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            return (v) => ValueTypeUtils.mask(v, desc.value);
        }
        return (v) => v;
    }
    static viaAPI2Loader() {
        let rowIds = null, rows = null, colIds = null, cols = null, data = null, hist = null, stats = null;
        function fillRowIds(desc) {
            if (rowIds !== null && rows !== null) {
                Promise.all([rowIds, rows]).then(([rowIdValues, rowValues]) => {
                    const idType = IDTypeManager.getInstance().resolveIdType(desc.rowtype);
                    const rowIds = ParseRangeUtils.parseRangeLike(rowIdValues);
                    idType.fillMapCache(rowIds.dim(0).asList(rowValues.length), rowValues);
                });
            }
        }
        function fillColumnIds(desc) {
            if (colIds !== null && cols !== null) {
                Promise.all([colIds, cols]).then(([colIdValues, colValues]) => {
                    const idType = IDTypeManager.getInstance().resolveIdType(desc.coltype);
                    const colIds = ParseRangeUtils.parseRangeLike(colIdValues);
                    idType.fillMapCache(colIds.dim(0).asList(colValues.length), colValues);
                });
            }
        }
        const r = {
            rowIds: (desc, range) => {
                if (rowIds == null) {
                    rowIds = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/rowIds`).then(ParseRangeUtils.parseRangeLike);
                    fillRowIds(desc);
                }
                return rowIds.then((d) => d.preMultiply(range, desc.size));
            },
            rows: (desc, range) => {
                if (rows == null) {
                    rows = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/rows`);
                    fillRowIds(desc);
                }
                return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
            },
            colIds: (desc, range) => {
                if (colIds == null) {
                    colIds = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/colIds`).then(ParseRangeUtils.parseRangeLike);
                    fillColumnIds(desc);
                }
                return colIds.then((d) => d.preMultiply(range, desc.size));
            },
            cols: (desc, range) => {
                if (cols == null) {
                    cols = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/cols`);
                    fillColumnIds(desc);
                }
                return cols.then((d) => range.dim(1).filter(d, desc.size[1]));
            },
            ids: (desc, range) => {
                if (range.ndim === 1) {
                    return r.rowIds(desc, range);
                }
                range.dim(0); //ensure two dim
                range.dim(1); //ensure two dim
                const split = range.split();
                return Promise.all([r.rowIds(desc, split[0] || Range.all()), r.colIds(desc, split[1] || Range.all())]).then(Range.join);
            },
            numericalStats: (desc, range) => {
                if (range.isAll) {
                    if (stats == null) {
                        stats = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/stats`);
                    }
                    return stats;
                }
                const args = {
                    range: range.toString()
                };
                return AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/stats`, args);
            },
            numericalHist: (desc, range, bins = NaN) => {
                const valueRange = desc.value.range;
                if (range.isAll) {
                    if (hist == null) {
                        hist = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/hist`).then((hist) => Histogram.wrapHist(hist, valueRange));
                    }
                    return hist;
                }
                const args = {
                    range: range.toString()
                };
                if (!isNaN(bins)) {
                    args.bins = bins;
                }
                return AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/hist`, args).then((hist) => Histogram.wrapHist(hist, valueRange));
            },
            at: (desc, i, j) => r.data(desc, Range.list([i], [j])).then((data) => MatrixLoaderHelper.maskIt(desc)(data[0][0])),
            data: (desc, range) => {
                if (range.isAll) {
                    if (data == null) {
                        data = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(MatrixLoaderHelper.maskIt(desc)); // TODO avoid <any> type cast
                    }
                    return data;
                }
                if (data != null) { //already loading all
                    return data.then((d) => range.filter(d, desc.size));
                }
                const size = desc.size;
                if (size[0] * size[1] < 1000 || desc.loadAtOnce) { // small file load all
                    data = AppContext.getInstance().getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(MatrixLoaderHelper.maskIt(desc)); // TODO avoid <any> type cast
                    return data.then((d) => range.filter(d, desc.size));
                }
                //server side slicing
                return AppContext.getInstance().getAPIData(`/dataset/matrix/${desc.id}/raw`, { range: range.toString() }).then(MatrixLoaderHelper.maskIt(desc));
            },
            heatmapUrl: (desc, range, options) => {
                const params = MatrixLoaderHelper.prepareHeatmapUrlParameter(range, options);
                return AppContext.getInstance().api2absURL(`/dataset/matrix/${desc.id}/data`, params);
            }
        };
        return r;
    }
    /**
     * Prepare the URL Parameters to load the Heatmap with the given range and options
     * @param range range for the subset of the matrix
     * @param options options for the URL configuration
     */
    static prepareHeatmapUrlParameter(range, options) {
        const args = {
            format: options.format || 'png',
            range: range.toString()
        };
        if (options.transpose === true) {
            args.format_transpose = true;
        }
        if (options.range) {
            args.format_min = options.range[0];
            args.format_max = options.range[1];
        }
        if (options.palette) {
            args.format_palette = options.palette.toString();
        }
        if (options.missing) {
            args.format_missing = options.missing;
        }
        return args;
    }
}
//# sourceMappingURL=loader.js.map