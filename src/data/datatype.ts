/**
 * This file defines interfaces for various data types and their metadata.
 */
import {IPersistable} from '../base/IPersistable';
import {IDType} from '../idtype/IDType';
import {ISelectAble, ASelectAble} from '../idtype/ASelectAble';
import {IHistogram} from './histogram';
import {IAdvancedStatistics, IStatistics} from '../base/statistics';
import {RangeLike, Range} from '../range';
import {IDataDescription} from './DataDescription';
import {IValueTypeDesc} from './valuetype';
/**
 * Basic data type interface
 */
export interface IDataType extends ISelectAble, IPersistable {
  /**
   * its description
   */
  readonly desc: IDataDescription;
  /**
   * dimensions of this datatype
   * rows, cols, ....
   */
  readonly dim: number[];


  idView(idRange?: RangeLike): Promise<IDataType>;
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

  ids(range: RangeLike = Range.all()): Promise<Range> {
    return Promise.resolve(Range.none());
  }

  idView(idRange?: RangeLike): Promise<ADataType<T>> {
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
    return (typeof(v.idView) === 'function' && typeof(v.persist) === 'function' && typeof(v.restore) === 'function' && v instanceof ASelectAble && ('desc' in v) && ('dim' in v));
  }
}

export class DummyDataType extends ADataType<IDataDescription> {
  constructor(desc: IDataDescription) {
    super(desc);
  }

}


export interface IHistAbleDataType<D extends IValueTypeDesc> extends IDataType {
  valuetype: D;
  hist(nbins?: number): Promise<IHistogram>;
  readonly length: number;
}

export interface IStatsAbleDataType<D extends IValueTypeDesc> extends IDataType {
  valuetype: D;
  stats(): Promise<IStatistics>;
  statsAdvanced(): Promise<IAdvancedStatistics>;
  readonly length: number;
}
