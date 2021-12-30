import {Range1D, IRange1DGroup} from './Range1D';

export class Range1DGroup extends Range1D implements IRange1DGroup  {
  constructor(public name: string, public color: string, base?: Range1D) {
    super(base);
  }

  preMultiply(sub: Range1D, size?: number): Range1DGroup {
    const r = super.preMultiply(sub, size);
    return new Range1DGroup(this.name, this.color, r);
  }

  union(other: Range1D, size?: number): Range1DGroup {
    const r = super.union(other, size);
    return new Range1DGroup(this.name, this.color, r);
  }

  intersect(other: Range1D, size?: number): Range1DGroup {
    const r = super.intersect(other, size);
    return new Range1DGroup(this.name, this.color, r);
  }

  without(without: Range1D, size?: number): Range1DGroup {
    const r = super.without(without, size);
    return new Range1DGroup(this.name, this.color, r);
  }

  clone(): Range1DGroup {
    return new Range1DGroup(this.name, this.color, super.clone());
  }

  toString() {
    return '"' + this.name + '""' + this.color + '"' + super.toString();
  }

  toSet(size?: number): Range1DGroup {
    return new Range1DGroup(this.name, this.color, super.toSet(size));
  }

  fromLike(indices: number[]) {
    return new Range1DGroup(this.name, this.color, super.fromLike(indices));
  }
  /**
   * TODO document
   * @param range
   * @return {Range1DGroup}
   */
  static asUngrouped(range: Range1D) {
    return new Range1DGroup('unnamed', 'gray', range);
  }
}
