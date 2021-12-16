import {ITable} from '../ITable';
import {RangeLike, Range} from '../../range';
import {ANameVector, IStringVector} from '../../stratification/vector/ANameVector';

export class TableNameVector extends ANameVector<ITable> implements IStringVector {

  constructor(table: ITable) {
    super(table);
    this.root = this;
  }

  get idtype() {
    return this.base.idtype;
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

  /**
   * converts the rows of the given table as a string vector
   * @param table
   * @return {IStringVector}
   */
  static asNameVector(table: ITable): IStringVector {
    return new TableNameVector(table);
  }
}
