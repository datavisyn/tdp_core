import { IStratification } from '../IStratification';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../vector/ANameVector';

export class StratificationNameVector extends ANameVector<IStratification> implements IStringVector {
  constructor(strat: IStratification) {
    super(strat);
    this.root = this;
  }

  get idtype() {
    return this.base.idtype;
  }

  names(range: RangeLike = Range.all()) {
    return this.base.names(range);
  }

  ids(range: RangeLike = Range.all()) {
    return this.base.ids(range);
  }

  size() {
    return this.base.length;
  }

  /**
   * converts the rows of the given stratification as a string vector
   * @param stratification
   * @return {IStringVector}
   */
  static asNameVector(stratification: IStratification): IStringVector {
    return new StratificationNameVector(stratification);
  }
}
