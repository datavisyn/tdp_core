import { Range1D, ICompositeRange1D } from './Range1D';
import { Range1DGroup } from './Range1DGroup';

function toBase(groups: Range1DGroup[]) {
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

export class CompositeRange1D extends Range1D implements ICompositeRange1D {
  constructor(public readonly name: string, public readonly groups: Range1DGroup[], base?: Range1D) {
    super(base || toBase(groups));
  }

  preMultiply(sub: Range1D, size?: number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.preMultiply(sub, size) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.preMultiply(sub, size)),
      r,
    );
  }

  union(other: Range1D, size?: number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.union(other, size) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.union(other, size)),
      r,
    );
  }

  intersect(other: Range1D, size?: number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.intersect(other, size) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.intersect(other, size)),
      r,
    );
  }

  without(without: Range1D, size?: number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.without(without, size) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.without(without, size)),
      r,
    );
  }

  clone(): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.clone() : undefined;
    return new CompositeRange1D(
      window.name,
      this.groups.map((g) => <Range1DGroup>g.clone()),
      r,
    );
  }

  sort(cmp?: (a: number, b: number) => number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.sort(cmp) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.sort(cmp)),
      r,
    );
  }

  toSet(size?: number): ICompositeRange1D {
    const r = this.groups.length > 1 ? super.toSet(size) : undefined;
    return new CompositeRange1D(
      this.name,
      this.groups.map((g) => <Range1DGroup>g.toSet(size)),
      r,
    );
  }

  toString(): string {
    return `"${this.name}"{${this.groups.join(',')}}`;
  }

  fromLikeComposite(groups: Range1DGroup[]): ICompositeRange1D {
    return new CompositeRange1D(this.name, groups);
  }

  /**
   * TODO document
   * @param name
   * @param groups
   * @return {CompositeRange1D}
   */
  static composite(name: string, groups: Range1DGroup[]) {
    return new CompositeRange1D(name, groups);
  }
}
