import { Range, ParseRangeUtils } from '../../range';
import { ATable } from '../ATable';
/**
 * @internal
 */
export class VectorTable extends ATable {
    constructor(desc, vectors) {
        super(null);
        this.vectors = vectors;
        this.root = this;
        const ref = vectors[0].desc;
        // generate the description extras
        const d = desc;
        d.idtype = ref.idtype;
        d.size = [vectors[0].length, vectors.length];
        d.columns = vectors.map((v) => {
            v.desc.column = v.desc.column || v.desc.name;
            return v.desc;
        });
        this.desc = d;
        this.idtype = vectors[0].idtype;
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
    at(i, j) {
        return this.col(i).at(j);
    }
    data(range = Range.all()) {
        return Promise.all(this.vectors.map((v) => v.data(range))).then((arr) => {
            const r = arr[0].map((i) => ([i]));
            arr.slice(1).forEach((ai) => ai.forEach((d, i) => r[i].push(d)));
            return r;
        });
    }
    colData(column, range = Range.all()) {
        return this.dataOfColumn(column, range);
    }
    dataOfColumn(column, range = Range.all()) {
        return this.vectors.find((d) => d.desc.name === column).data(range);
    }
    objects(range = Range.all()) {
        return Promise.all(this.vectors.map((v) => v.data(range))).then((arr) => {
            const names = this.vectors.map((d) => d.desc.name);
            const r = arr[0].map((i) => ({ [names[0]]: i }));
            arr.slice(1).forEach((ai, j) => {
                const name = names[j + 1];
                ai.forEach((d, i) => r[i][name] = d);
            });
            return r;
        });
    }
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    rows(range = Range.all()) {
        return this.col(0).names(range);
    }
    rowIds(range = Range.all()) {
        return this.col(0).ids(range);
    }
    ids(range = Range.all()) {
        return this.rowIds(range);
    }
    size() {
        return [this.col(0).length, this.vectors.length];
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
    queryView(name, args) {
        throw Error('not implemented');
    }
    static fromVectors(desc, vecs) {
        return new VectorTable(desc, vecs);
    }
}
//# sourceMappingURL=VectorTable.js.map