import { Range } from '../../range';
import { ANameVector } from '../../stratification/vector/ANameVector';
export class MatrixColumnNameVector extends ANameVector {
    constructor(matrix) {
        super(matrix);
        this.root = this;
    }
    get idtype() {
        return this.base.coltype;
    }
    names(range = Range.all()) {
        return this.base.cols(range);
    }
    ids(range = Range.all()) {
        return this.base.colIds(range);
    }
    size() {
        return this.base.ncol;
    }
    persist() {
        return {
            root: this.base.persist(),
            names: 'column'
        };
    }
    /**
     * converts the cols of the given matrix as a string vector
     * @param matrix
     * @return {IStringVector}
     */
    static asNameVector(matrix) {
        return new MatrixColumnNameVector(matrix);
    }
}
//# sourceMappingURL=MatrixColumnNameVector.js.map