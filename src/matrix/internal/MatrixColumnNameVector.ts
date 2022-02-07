import { IAnyMatrix } from '../IMatrix';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../../stratification/vector/ANameVector';

export class MatrixColumnNameVector extends ANameVector<IAnyMatrix> implements IStringVector {
  constructor(matrix: IAnyMatrix) {
    super(matrix);
    this.root = this;
  }

  get idtype() {
    return this.base.coltype;
  }

  names(range: RangeLike = Range.all()) {
    return this.base.cols(range);
  }

  ids(range: RangeLike = Range.all()) {
    return this.base.colIds(range);
  }

  size() {
    return this.base.ncol;
  }

  persist() {
    return {
      root: this.base.persist(),
      names: 'column',
    };
  }

  /**
   * converts the cols of the given matrix as a string vector
   * @param matrix
   * @return {IStringVector}
   */
  static asNameVector(matrix: IAnyMatrix): IStringVector {
    return new MatrixColumnNameVector(matrix);
  }
}
