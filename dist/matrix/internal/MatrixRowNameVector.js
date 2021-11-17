import { Range } from '../../range';
import { ANameVector } from '../../stratification/vector/ANameVector';
export class MatrixRowNameVector extends ANameVector {
    constructor(matrix) {
        super(matrix);
        this.root = this;
    }
    get idtype() {
        return this.base.rowtype;
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
    persist() {
        return {
            root: this.base.persist(),
            names: 'row'
        };
    }
    /**
     * converts the rows of the given matrix as a string vector
     * @param matrix
     * @return {IStringVector}
     */
    static asNameVector(matrix) {
        return new MatrixRowNameVector(matrix);
    }
}
//# sourceMappingURL=MatrixRowNameVector.js.map