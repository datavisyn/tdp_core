/**
 * This file defines interfaces for various data types and their metadata.
 */
import { EventHandler } from 'visyn_core/base';
import { IDType } from 'visyn_core/idtype';

import { IDataDescription } from './DataDescription';
import { IPersistable } from '../base/IPersistable';
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
export abstract class ADataType<T extends IDataDescription> extends EventHandler implements IDataType {
  constructor(public readonly desc: T) {
    super();
  }

  get dim(): number[] {
    return [];
  }

  idView(ids?: string[]): Promise<ADataType<T>> {
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
    // sounds good
    return typeof v.persist === 'function' && typeof v.restore === 'function' && 'desc' in v;
  }
}

export class DummyDataType extends ADataType<IDataDescription> {}
