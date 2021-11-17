import { Range1D } from './Range1D';
function toBase(groups) {
    if (groups.length === 1) {
        return groups[0];
    }
    const r = groups[0].iter().asList();
    groups.slice(1).forEach((g) => {
        g.iter().forEach((i) => {
            if (r.indexOf(i) < 0) {
                r.push(i);
            }
        });
    });
    return Range1D.from(r);
}
export class CompositeRange1D extends Range1D {
    constructor(name, groups, base) {
        super(base ? base : toBase(groups));
        this.name = name;
        this.groups = groups;
    }
    preMultiply(sub, size) {
        const r = this.groups.length > 1 ? super.preMultiply(sub, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.preMultiply(sub, size)), r);
    }
    union(other, size) {
        const r = this.groups.length > 1 ? super.union(other, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.union(other, size)), r);
    }
    intersect(other, size) {
        const r = this.groups.length > 1 ? super.intersect(other, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.intersect(other, size)), r);
    }
    without(without, size) {
        const r = this.groups.length > 1 ? super.without(without, size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.without(without, size)), r);
    }
    clone() {
        const r = this.groups.length > 1 ? super.clone() : undefined;
        return new CompositeRange1D(name, this.groups.map((g) => g.clone()), r);
    }
    sort(cmp) {
        const r = this.groups.length > 1 ? super.sort(cmp) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.sort(cmp)), r);
    }
    toSet(size) {
        const r = this.groups.length > 1 ? super.toSet(size) : undefined;
        return new CompositeRange1D(this.name, this.groups.map((g) => g.toSet(size)), r);
    }
    toString() {
        return '"' + this.name + '"{' + this.groups.join(',') + '}';
    }
    fromLikeComposite(groups) {
        return new CompositeRange1D(this.name, groups);
    }
    /**
     * TODO document
     * @param name
     * @param groups
     * @return {CompositeRange1D}
     */
    static composite(name, groups) {
        return new CompositeRange1D(name, groups);
    }
}
//# sourceMappingURL=CompositeRange1D.js.map