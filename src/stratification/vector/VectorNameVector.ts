import { IAnyVector } from '../../vector';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from './ANameVector';

export class VectorNameVector extends ANameVector<IAnyVector> implements IStringVector {
  constructor(vector: IAnyVector) {
    super(vector);
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
   * converts the name of the given vector as a string vector
   * @param vector
   * @return {IStringVector}
   */
  static asNameVector(vector: IAnyVector): IStringVector {
    return new VectorNameVector(vector);
  }
}
