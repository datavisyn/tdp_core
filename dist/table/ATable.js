import { Range, ParseRangeUtils } from '../range';
import { IDTypeManager, ASelectAble } from '../idtype';
import { MultiTableVector } from './internal/MultiTableVector';
/**
 * base class for different Table implementations, views, transposed,...
 * @internal
 */
export class ATable extends ASelectAble {
    constructor(root) {
        super();
        this.root = root;
    }
    get dim() {
        return this.size();
    }
    get nrow() {
        return this.dim[0];
    }
    get ncol() {
        return this.dim[1];
    }
    view(range = Range.all()) {
        // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new TableView(this.root, ParseRangeUtils.parseRangeLike(range));
    }
    async idView(idRange = Range.all()) {
        return this.view((await this.ids()).indexOf(ParseRangeUtils.parseRangeLike(idRange)));
    }
    reduce(f, thisArgument, valuetype, idtype) {
        return new MultiTableVector(this.root, f, thisArgument, valuetype, idtype);
    }
    restore(persisted) {
        if (persisted && persisted.f) {
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? IDTypeManager.getInstance().resolveIdType(persisted.idtype) : undefined);
        }
        else if (persisted && persisted.range) { //some view onto it
            return this.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        else {
            return this;
        }
    }
}
// circular dependency thus not extractable
/**
 * @internal
 */
export class TableView extends ATable {
    constructor(root, range) {
        super(root);
        this.range = range;
        this.range = range;
        this.vectors = this.root.cols(Range.list(range.dim(1))).map((v) => v.view(Range.list(range.dim(0))));
    }
    get desc() {
        return this.root.desc;
    }
    persist() {
        return {
            root: this.root.persist(),
            range: this.range.toString()
        };
    }
    restore(persisted) {
        let r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        return r;
    }
    size() {
        return this.range.size(this.root.dim);
    }
    at(row, col) {
        const inverted = this.range.invert([row, col], this.root.dim);
        return this.root.at(inverted[0], inverted[1]);
    }
    col(i) {
        return this.vectors[i]; // TODO prevent `<any>` by using `<IVector<any, IValueTypeDesc>>` leads to TS compile errors
    }
    cols(range = Range.all()) {
        return ParseRangeUtils.parseRangeLike(range).filter(this.vectors, [this.ncol]);
    }
    data(range = Range.all()) {
        return this.root.data(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    colData(column, range) {
        return this.dataOfColumn(column, range);
    }
    dataOfColumn(column, range = Range.all()) {
        // since we directly accessing the column by name there is no need for the column part of the range
        const rowRange = this.range.dim(0).preMultiply(ParseRangeUtils.parseRangeLike(range).dim(0), this.root.dim[0]);
        return this.root.dataOfColumn(column, new Range([rowRange]));
    }
    objects(range = Range.all()) {
        return this.root.objects(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    rows(range = Range.all()) {
        return this.root.rows(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    rowIds(range = Range.all()) {
        return this.root.rowIds(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    ids(range = Range.all()) {
        return this.rowIds(range);
    }
    view(range = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(range);
        if (r.isAll) {
            return this;
        }
        return new TableView(this.root, this.range.preMultiply(r, this.dim));
    }
    get idtype() {
        return this.root.idtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    queryView(name, args) {
        throw new Error('not implemented');
    }
}
//# sourceMappingURL=ATable.js.map