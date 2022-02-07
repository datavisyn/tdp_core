import { RangeLike } from '../../range';

export interface IInternalAccess {
  /**
   * @param column
   * @param range
   */
  dataOfColumn<T>(column: string, range?: RangeLike): Promise<T[]>;
}
