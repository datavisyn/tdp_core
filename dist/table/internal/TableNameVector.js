import { Range } from '../../range';
import { ANameVector } from '../../stratification/vector/ANameVector';
export class TableNameVector extends ANameVector {
    constructor(table) {
        super(table);
        this.root = this;
    }
    get idtype() {
        return this.base.idtype;
    }
    names(range = Range.all()) {
        return this.base.rows(range);
    }
    ids(range = Range.all()) {
        return this.base.rowIds(range);
    }
    size() {
        return this.base.nrow;
    }
    /**
     * converts the rows of the given table as a string vector
     * @param table
     * @return {IStringVector}
     */
    static asNameVector(table) {
        return new TableNameVector(table);
    }
}
//# sourceMappingURL=TableNameVector.js.map