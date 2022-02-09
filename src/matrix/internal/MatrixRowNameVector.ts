import { IAnyMatrix } from '../IMatrix';
import { RangeLike, Range } from '../../range';
import { ANameVector, IStringVector } from '../../stratification/vector/ANameVector';

export class MatrixRowNameVector extends ANameVector<IAnyMatrix> implements IStringVector {
  constructor(matrix: IAnyMatrix) {
    super(matrix);
    this.root = this;
  }

  get idtype() {
    return this.base.rowtype;
  }

  names(range: RangeLike = Range.all()) {
    return this.base.rows(range);
  }

  ids(range: RangeLike = Range.all()) {
    return this.base.rowIds(range);
  }

  size() {
    return this.base.nrow;
  }

  persist() {
    return {
      root: this.base.persist(),
      names: 'row',
    };
  }

  /**
   * converts the rows of the given matrix as a string vector
   * @param matrix
   * @return {IStringVector}
   */
  static asNameVector(matrix: IAnyMatrix): IStringVector {
    return new MatrixRowNameVector(matrix);
  }
}
