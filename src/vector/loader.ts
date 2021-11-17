import {AppContext} from '../app/AppContext';
import {ParseRangeUtils} from '../range';
import {Range} from '../range/Range';
import {IValueType, ValueTypeUtils} from '../data';
import {IVectorDataDescription} from './IVector';
import {IDTypeManager} from '../idtype/IDTypeManager';

/**
 * @internal
 */
export interface IVectorLoaderResult<T> {
  readonly rowIds: Range;
  readonly rows: string[];
  readonly data: T[];
}

/**
 * @internal
 */
export interface IVectorLoader<T> {
  (desc: IVectorDataDescription<any>): Promise<IVectorLoaderResult<T>>;
}

export class VectorLoaderUtils {
  /**
   * @internal
   */
  static viaAPILoader<T>() {
    let _loader: Promise<IVectorLoaderResult<T>> = undefined;
    return (desc: IVectorDataDescription<any>) => {
      if (_loader) { //in the cache
        return _loader;
      }
      return _loader = AppContext.getInstance().getAPIJSON('/dataset/' + desc.id).then((data) => {
        const range = ParseRangeUtils.parseRangeLike(data.rowIds);
        data.rowIds = range;
        data.data = ValueTypeUtils.mask(data.data, desc.value);

        const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
        idType.fillMapCache(range.dim(0).asList(data.rows.length), data.rows);
        return data;
      });
    };
  }

  /**
   * @internal
   */
  static viaDataLoader<T>(rows: string[], rowIds: number[], data: IValueType[]) {
    let _data: IVectorLoaderResult<T> = undefined;
    return () => {
      if (_data) { //in the cache
        return Promise.resolve(_data);
      }
      _data = {
        rowIds: ParseRangeUtils.parseRangeLike(rowIds),
        rows,
        data
      };
      return Promise.resolve(_data);
    };
  }
}
