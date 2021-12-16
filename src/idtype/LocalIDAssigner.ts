import {IdPool} from '../internal/IdPool';
import {Range} from '../range';


export class LocalIDAssigner {
  private readonly pool = new IdPool();
  private readonly lookup = new Map<string, number>();

  unmapOne(id: number) {
    return this.unmap([id])[0];
  }

  unmap(ids: number[]) {
    const keys = Object.keys(this.lookup);
    return ids.map((id) => {
      for (const k in keys) {
        if (this.lookup.get(k) === id) {
          return k;
        }
      }
      return null;
    });
  }

  mapOne(id: string): number {
    if (this.lookup.has(id)) {
      return this.lookup.get(id);
    }
    this.lookup.set(id, this.pool.checkOut());
    return this.lookup.get(id);
  }

  map(ids: string[]): Range {
    const numbers: number[] = ids.map((d) => this.mapOne(d));
    return Range.list(...numbers);
  }

  static create() {
    const r = new LocalIDAssigner();
    return r.map.bind(r);
  }
}
