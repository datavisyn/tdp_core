import { Range, ParseRangeUtils } from '../range';
import { ValueTypeUtils } from '../data';
import { BaseUtils } from '../base/BaseUtils';
import { IDTypeManager, LocalIDAssigner } from '../idtype';
import { MatrixUtils } from './IMatrix';
import { AMatrix } from './AMatrix';
import { TransposedMatrix } from './internal/TransposedMatrix';
import { MatrixLoaderHelper } from './loader';
/**
 * Base matrix implementation holding the data
 */
export class Matrix extends AMatrix {
    constructor(desc, loader) {
        super(null);
        this.desc = desc;
        this.loader = loader;
        this.root = this;
        this.valuetype = desc.value;
        this.rowtype = IDTypeManager.getInstance().resolveIdType(desc.rowtype);
        this.coltype = IDTypeManager.getInstance().resolveIdType(desc.coltype);
        this._producttype = IDTypeManager.getInstance().resolveProduct(this.rowtype, this.coltype);
        this.t = new TransposedMatrix(this);
    }
    get producttype() {
        return this._producttype;
    }
    get idtypes() {
        return [this.rowtype, this.coltype];
    }
    /**
     * access at a specific position
     * @param i
     * @param j
     * @returns {*}
     */
    at(i, j) {
        return this.loader.at(this.desc, i, j);
    }
    data(range = Range.all()) {
        return this.loader.data(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    ids(range = Range.all()) {
        return this.loader.ids(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    /**
     * return the column ids of the matrix
     * @returns {*}
     */
    cols(range = Range.all()) {
        return this.loader.cols(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    colIds(range = Range.all()) {
        return this.loader.colIds(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    rows(range = Range.all()) {
        return this.loader.rows(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    rowIds(range = Range.all()) {
        return this.loader.rowIds(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    hist(bins, range = Range.all(), containedIds = 0) {
        if (this.loader.numericalHist && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
            // use loader for hist
            return this.loader.numericalHist(this.desc, ParseRangeUtils.parseRangeLike(range), bins);
        }
        // compute
        return super.hist(bins, range, containedIds);
    }
    stats(range = Range.all()) {
        if (this.loader.numericalStats && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
            // use loader for hist
            return this.loader.numericalStats(this.desc, ParseRangeUtils.parseRangeLike(range));
        }
        // compute
        return super.stats(range);
    }
    statsAdvanced(range = Range.all()) {
        if (this.loader.numericalStats && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
            // use loader for hist
            return this.loader.numericalStats(this.desc, ParseRangeUtils.parseRangeLike(range));
        }
        // compute
        return super.statsAdvanced(range);
    }
    size() {
        return this.desc.size;
    }
    persist() {
        return this.desc.id;
    }
    heatmapUrl(range = Range.all(), options = {}) {
        if (this.loader.heatmapUrl) {
            return this.loader.heatmapUrl(this.desc, range, options);
        }
        return null;
    }
    /**
     * module entry point for creating a datatype
     * @param desc
     * @param loader
     * @returns {IMatrix}
     */
    static create(desc, loader) {
        if (typeof loader === 'function') {
            return new Matrix(desc, MatrixLoaderHelper.adapterOne2Two(loader));
        }
        return new Matrix(desc, loader ? loader : MatrixLoaderHelper.viaAPI2Loader());
    }
    /**
     * parses a given dataset and convert is to a matrix
     * @param data the data array
     * @param rowsIdsOrOptions see options or the row ids of this matrix
     * @param colIds the optional column ids
     * @param options options for defining the dataset description
     * @returns {IMatrix}
     */
    static asMatrix(data, rowsIdsOrOptions, colIds, options = {}) {
        // first column if not defined, excluding 0,0
        const rows = Array.isArray(rowsIdsOrOptions) ? rowsIdsOrOptions : data.map((r) => r[0]).slice(1);
        // first row if not defined, excluding 0,0
        const cols = colIds || data[0].slice(1);
        if (typeof rowsIdsOrOptions === 'object') {
            options = rowsIdsOrOptions;
        }
        options = options || {};
        let realData = Array.isArray(rowsIdsOrOptions) ? data : data.slice(1).map((r) => r.slice(1));
        const valueType = ValueTypeUtils.guessValueTypeDesc([].concat.apply([], realData));
        if (valueType.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            realData = realData.map((row) => row.map(parseFloat));
        }
        else if (valueType.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            realData = realData.map((row) => row.map(parseInt));
        }
        const desc = BaseUtils.mixin(MatrixUtils.createDefaultMatrixDesc(), {
            size: [rows.length, cols.length],
            value: valueType,
        }, options);
        const rowAssigner = options.rowassigner || LocalIDAssigner.create();
        const colAssigner = options.rowassigner || LocalIDAssigner.create();
        const loader = {
            rowIds: (desc, range) => Promise.resolve(rowAssigner(range.filter(rows))),
            colIds: (desc, range) => Promise.resolve(colAssigner(range.filter(cols))),
            ids: (desc, range) => {
                const rc = rowAssigner(range.dim(0).filter(rows));
                const cc = colAssigner(range.dim(1).filter(cols));
                return Promise.resolve(Range.join(rc, cc));
            },
            at: (desc, i, j) => Promise.resolve(realData[i][j]),
            rows: (desc, range) => Promise.resolve(range.filter(rows)),
            cols: (desc, range) => Promise.resolve(range.filter(cols)),
            data: (desc, range) => Promise.resolve(range.filter(realData)),
        };
        return new Matrix(desc, loader);
    }
}
//# sourceMappingURL=Matrix.js.map