import { Range } from '../../range';
import { ANameVector } from './ANameVector';
export class VectorNameVector extends ANameVector {
    constructor(vector) {
        super(vector);
        this.root = this;
    }
    get idtype() {
        return this.base.idtype;
    }
    names(range = Range.all()) {
        return this.base.names(range);
    }
    ids(range = Range.all()) {
        return this.base.ids(range);
    }
    size() {
        return this.base.length;
    }
    /**
     * converts the name of the given vector as a string vector
     * @param vector
     * @return {IStringVector}
     */
    static asNameVector(vector) {
        return new VectorNameVector(vector);
    }
}
//# sourceMappingURL=VectorNameVector.js.map