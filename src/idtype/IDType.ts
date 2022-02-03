import { AppContext } from '../app/AppContext';
import { EventHandler, IEventHandler } from '../base/event';
import { IPersistable } from '../base/IPersistable';
import { SelectOperation, SelectionUtils } from './SelectionUtils';

export interface IPersistedIDType {
  sel: { [key: string]: string[] };
  name: string;
  names: string;
}

/**
 * An IDType is a semantic aggregation of an entity type, like Patient and Gene.
 *
 * An entity is tracked by a unique identifier (integer) within the system,
 * which is mapped to a common, external identifier or name (string) as well.
 */
export class IDType extends EventHandler implements IEventHandler, IPersistable {
  static readonly EVENT_SELECT = 'select';

  /**
   * the current selections
   */
  private readonly sel = new Map<string, string[]>();

  canBeMappedTo: Promise<IDType[]> = null;

  /**
   * @param id the system identifier of this IDType
   * @param name the name of this IDType for external presentation
   * @param names the plural form of above name
   * @param internal whether this is an internal type or not
   */
  constructor(public id: string, public readonly name: string, public readonly names: string, public readonly internal = false) {
    super();
  }

  persist(): IPersistedIDType {
    const s: { [key: string]: string[] } = {};
    this.sel.forEach((v, k) => {
      s[k] = v;
    });
    return {
      sel: s,
      name: this.name,
      names: this.names,
    };
  }

  restore(persisted: IPersistedIDType) {
    // @ts-ignore
    this.name = persisted.name;
    // @ts-ignore
    this.names = persisted.names;
    Object.keys(persisted.sel).forEach((type) => this.sel.set(type, persisted.sel[type]));
    return this;
  }

  toString() {
    return this.name;
  }

  selectionTypes() {
    return Array.from(this.sel.keys());
  }

  /**
   * return the current selections of the given type
   * @param type optional the selection type
   * @returns {string[]}
   */
  selections(type = SelectionUtils.defaultSelectionType): string[] {
    if (this.sel.has(type)) {
      return this.sel.get(type);
    }
    const v = [];
    this.sel.set(type, v);
    return v;
  }

  /**
   * select the given range as
   * @param range
   */
  select(selection: string[]): string[];
  select(selection: string[], op: SelectOperation): string[];
  select(type: string, selection: string[]): string[];
  select(type: string, selection: string[], op: SelectOperation): string[];
  select() {
    // eslint-disable-next-line prefer-rest-params
    const a = Array.from(arguments);
    const type = typeof a[0] === 'string' ? a.shift() : SelectionUtils.defaultSelectionType;
    const selection = a[0];
    const op = SelectionUtils.asSelectOperation(a[1]);
    return this.selectImpl(selection, op, type);
  }

  private selectImpl(selection: string[], op = SelectOperation.SET, type: string = SelectionUtils.defaultSelectionType) {
    const b = this.selections(type);
    const newValue = SelectionUtils.integrateSelection(b, selection, op);
    this.sel.set(type, newValue);
    const added = op !== SelectOperation.REMOVE ? selection : [];
    const removed = op === SelectOperation.ADD ? [] : op === SelectOperation.SET ? b : selection;
    this.fire(IDType.EVENT_SELECT, type, newValue, added, removed, b);
    this.fire(`${IDType.EVENT_SELECT}-${type}`, newValue, added, removed, b);
    return b;
  }

  clear(type = SelectionUtils.defaultSelectionType) {
    return this.selectImpl([], SelectOperation.SET, type);
  }

  /**
   * chooses whether a GET or POST request based on the expected url length
   * @param url
   * @param data
   * @returns {Promise<any>}
   */
  static chooseRequestMethod(
    url: string,
    data: {
      q?: string[];
      mode?: 'all' | 'first';
    } = {},
  ) {
    const dataLengthGuess = JSON.stringify(data);
    const lengthGuess = url.length + dataLengthGuess.length;

    const method = lengthGuess < 2000 ? 'GET' : 'POST';
    return AppContext.getInstance().sendAPI(url, data, method);
  }
}

export declare type IDTypeLike = string | IDType;

export interface IDPair {
  readonly name: string;
  readonly id: number;
}
