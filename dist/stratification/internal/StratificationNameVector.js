import { Range } from '../../range';
import { ANameVector } from '../vector/ANameVector';
export class StratificationNameVector extends ANameVector {
    constructor(strat) {
        super(strat);
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
     * converts the rows of the given stratification as a string vector
     * @param stratification
     * @return {IStringVector}
     */
    static asNameVector(stratification) {
        return new StratificationNameVector(stratification);
    }
}
//# sourceMappingURL=StratificationNameVector.js.map