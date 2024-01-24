import { DataCache } from '../../data/DataCache';
import { ADataType, IDataType } from '../../data/datatype';
import { GraphNode } from '../graph/graph';

/**
 * an object reference is a common description of an object node in the provenance graph
 */
export interface IObjectRef<T> {
  /**
   * name of the object
   */
  readonly name: string;
  /**
   * category one of categories
   */
  readonly category: string;
  /**
   * the value
   */
  readonly v: PromiseLike<T>;

  /**
   * maybe null if not defined
   */
  readonly value: T;

  /**
   * a hash for avoiding false duplicate detection
   */
  readonly hash: string;
}

export class ObjectRefUtils {
  /**
   * list of categories for actions and objects
   */
  public static category = {
    data: 'data',
    selection: 'selection',
    visual: 'visual',
    layout: 'layout',
    logic: 'logic',
    custom: 'custom',
    annotation: 'annotation',
  };

  /**
   * list of operations
   */
  public static operation = {
    create: 'create',
    update: 'update',
    remove: 'remove',
  };

  /**
   * creates an object reference to the given object
   * @param v
   * @param name
   * @param category
   * @param hash
   * @returns {{v: T, name: string, category: string}}
   */
  static objectRef<T>(v: T, name: string, category = ObjectRefUtils.category.data, hash = `${name}_${category}`): IObjectRef<T> {
    return {
      v: Promise.resolve(v),
      value: v,
      name,
      category,
      hash,
    };
  }
}

/**
 * tries to persist an object value supporting datatypes and DOM elements having an id
 * @param v
 * @returns {any}
 */
function persistData(v: any): any {
  if (v === undefined || v === null) {
    return null;
  }
  if (v instanceof Element) {
    const e = <Element>v;
    const id = e.getAttribute('id');
    return { type: 'element', id };
  }
  if (ADataType.isADataType(v)) {
    const e = <IDataType>v;
    return { type: 'dataset', id: e.desc.id, persist: e.persist() };
  }
  if (typeof v === 'string' || typeof v === 'number') {
    return { type: 'primitive', v };
  }
  return null;
}

function restoreData(v: any): any {
  if (!v) {
    return null;
  }
  switch (v.type) {
    case 'element':
      if (v.id) {
        return Promise.resolve(document.getElementById(v.id));
      }
      return null;
    case 'dataset':
      return DataCache.getInstance().get(v.persist);
    case 'primitive':
      return Promise.resolve(v.v);
    default:
      return null;
  }
}

/**
 * a graph node of type object
 */
export class ObjectNode<T> extends GraphNode implements IObjectRef<T> {
  /**
   * a promise of the value accessible via .v
   */
  private _promise: PromiseLike<T>;

  private _persisted: any = null;

  constructor(
    private _v: T,
    name: string,
    category = ObjectRefUtils.category.data,
    hash = `${name}_${category}`,
    description = '',
  ) {
    super('object');
    if (_v != null) {
      // if the value is given, auto generate a promise for it
      this._promise = Promise.resolve(_v);
    }
    super.setAttr('name', name);
    super.setAttr('category', category);
    super.setAttr('hash', hash);
    super.setAttr('description', description);
  }

  get value() {
    this.checkPersisted();
    return this._v;
  }

  set value(v: T) {
    this._v = v;
    this._promise = v == null ? null : Promise.resolve(v);
    this._persisted = null;
  }

  /**
   * checks whether the persisted value was already restored
   */
  private checkPersisted() {
    if (this._persisted != null) {
      this._promise = restoreData(this._persisted);
      if (this._promise) {
        this._promise.then((v) => {
          this._v = v;
        });
      }
      this._persisted = null;
    }
  }

  get v() {
    this.checkPersisted();
    return this._promise;
  }

  get name(): string {
    return super.getAttr('name', '');
  }

  get category(): string {
    return super.getAttr('category', '');
  }

  get hash(): string {
    return super.getAttr('hash', '');
  }

  get description(): string {
    return super.getAttr('description', '');
  }

  persist() {
    const r = super.persist();
    if (!r.attrs) {
      r.attrs = {};
    }
    r.attrs.v = this._persisted ? this._persisted : persistData(this.value);
    return r;
  }

  restore(p: any) {
    this._persisted = p.attrs.v;
    delete p.attrs.v;
    super.restore(p);
    return this;
  }

  static restore(p: any) {
    const r = new ObjectNode<any>(null, p.attrs.name, p.attrs.category, p.attrs.hash || `${p.attrs.name}_${p.attrs.category}`);
    return r.restore(p);
  }

  toString() {
    return this.name;
  }
}
