import { IdPool } from '../internal/IdPool';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';

export interface IHasUniqueId {
  id: number;
}

export class HasUniqueIdUtils {
  static toId(elem: IHasUniqueId) {
    return elem.id;
  }

  static isId(id: number) {
    return (elem: IHasUniqueId) => elem && elem.id === id;
  }
}

/**
 * IDType with an actual collection of entities.
 * Supports selections.
 */
export class ObjectManager<T extends IHasUniqueId> extends IDType {
  private readonly instances: T[] = [];

  private readonly pool = new IdPool();

  constructor(id: string, name: string) {
    super(id, name, `${name}s`, true);
  }

  nextId(item?: T) {
    const n = this.pool.checkOut();
    if (item) {
      item.id = n;
      this.instances[n] = item;
      this.fire('add', n, item);
    }
    return n;
  }

  push(...items: T[]) {
    items.forEach((item) => {
      this.instances[item.id] = item;
      this.fire('add', item.id, item);
    });
  }

  byId(id: number) {
    return this.instances[id];
  }

  forEach(callbackfn: (value: T) => void, thisArg?: any): void {
    this.instances.forEach((item, i) => (this.pool.isCheckedOut(i) ? callbackfn.call(thisArg, item) : null));
  }

  get entries() {
    return this.instances.filter((item, i) => this.pool.isCheckedOut(i));
  }

  remove(id: number): T;
  remove(item: T): T;
  remove(item: any): T {
    let old = null;
    if (typeof item.id === 'number') {
      item = item.id;
    }
    if (typeof item === 'number') {
      old = this.instances[item];
      delete this.instances[item];
      this.fire('remove', item, old);
    }
    // clear from selections
    this.selectionTypes().forEach((type) => {
      this.select(type, [item], SelectOperation.REMOVE);
    });
    this.pool.checkIn(item);
    return old;
  }

  selectedObjects(type = SelectionUtils.defaultSelectionType) {
    const s = this.selections(type);
    return s.filter(this.instances);
  }
}
