import { Range1D } from './Range1D';
export class Range1DGroup extends Range1D {
    constructor(name, color, base) {
        super(base);
        this.name = name;
        this.color = color;
    }
    preMultiply(sub, size) {
        const r = super.preMultiply(sub, size);
        return new Range1DGroup(this.name, this.color, r);
    }
    union(other, size) {
        const r = super.union(other, size);
        return new Range1DGroup(this.name, this.color, r);
    }
    intersect(other, size) {
        const r = super.intersect(other, size);
        return new Range1DGroup(this.name, this.color, r);
    }
    without(without, size) {
        const r = super.without(without, size);
        return new Range1DGroup(this.name, this.color, r);
    }
    clone() {
        return new Range1DGroup(this.name, this.color, super.clone());
    }
    toString() {
        return `"${this.name}""${this.color}"${super.toString()}`;
    }
    toSet(size) {
        return new Range1DGroup(this.name, this.color, super.toSet(size));
    }
    fromLike(indices) {
        return new Range1DGroup(this.name, this.color, super.fromLike(indices));
    }
    /**
     * TODO document
     * @param range
     * @return {Range1DGroup}
     */
    static asUngrouped(range) {
        return new Range1DGroup('unnamed', 'gray', range);
    }
}
//# sourceMappingURL=Range1DGroup.js.map