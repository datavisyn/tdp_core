/**
 * Created by sam on 13.02.2017.
 */
import {RangeLike, Range} from 'phovea_core/src/range';
import {IDType} from 'phovea_core/src/idtype';
import {IRow} from './interfaces';

export interface IScoreRow<T> {
  readonly id: string;
  score: T;
}

export interface IScore<T> {
  idType: IDType;

  createDesc(): any;

  /**
   * Start the computation of the score for the given ids
   * @param ids
   * @param idtype
   * @param extras
   */
  compute(ids: RangeLike, idtype: IDType, extras?: any): Promise<IScoreRow<T>[]>;
}

export interface IScoreParam {
  [key: string]: any;
}

export default IScore;

export class AScoreAccessorProxy<T> {
  /**
   * the accessor for the score column
   * @param row
   */
  readonly accessor = (row: IRow) => this.access(row);
  private readonly scores = new Map<string, T>();

  constructor(private readonly missingValue: T = null) {

  }

  set rows(rows: IScoreRow<T>[]) {
    rows.forEach(({id, score}) => this.scores.set(id, score));
  }

  protected access(row: IRow) {
    const rowId = row.id;
    if (this.scores === null || !this.scores.has(rowId)) {
      return this.missingValue;
    }
    return this.scores.get(rowId);
  }
}

class NumberScoreAccessorProxy extends AScoreAccessorProxy<number> {
}


class CategoricalScoreAccessorProxy extends AScoreAccessorProxy<string> {

  protected access(row: IRow) {
    const v = super.access(row);
    return String(v); //even null values;
  }
}

/**
 * creates and accessor helper
 * @param colDesc
 * @returns {CategoricalScoreAccessorProxy|NumberScoreAccessorProxy}
 */
export function createAccessor(colDesc: any) {
  const accessor = colDesc.type === 'categorical' ? new CategoricalScoreAccessorProxy(colDesc.missingValue) : new NumberScoreAccessorProxy(colDesc.missingValue);
  colDesc.accessor = accessor.accessor;
  return accessor;
}
