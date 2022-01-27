/**
 * This file defines interfaces for various data types and their metadata.
 */
import {IPersistable} from '../base/IPersistable';
import {IDType} from '../idtype/IDType';
import {ASelectAble, ISelectAble} from '../idtype/ASelectAble';
import {IDataDescription} from './DataDescription';
/**
 * Basic data type interface
 */
export interface IDataType extends IPersistable {
  /**
   * its description
   */
  readonly desc: IDataDescription;
  /**
   * dimensions of this datatype
   * rows, cols, ....
   */
  readonly dim: number[];
}
/**
 * dummy data type just holding the description
 */
export abstract class ADataType<T extends IDataDescription> extends ASelectAble implements IDataType {
  constructor(public readonly desc: T) {
    super();
  }

  get dim(): number[] {
    return [];
  }

  idView(selectionIds?: string[]): Promise<ADataType<T>> {
    return Promise.resolve(this);
  }

  get idtypes(): IDType[] {
    return [];
  }

  persist(): any {
    return this.desc.id;
  }

  restore(persisted: any) {
    return this;
  }

  toString() {
    return this.persist();
  }
  /**
   * since there is no instanceOf for interfaces
   * @param v
   * @return {any}
   */
  static isADataType(v: IDataType) {
    if (v === null || v === undefined) {
      return false;
    }
    if (v instanceof ADataType) {
      return true;
    }
    //sounds good
    return (typeof(v.persist) === 'function' && typeof(v.restore) === 'function' && v instanceof ASelectAble && ('desc' in v));
  }
}

export class DummyDataType extends ADataType<IDataDescription> {
  constructor(desc: IDataDescription) {
    super(desc);
  }

}
