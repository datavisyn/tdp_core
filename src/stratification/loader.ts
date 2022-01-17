import { AppContext } from '../app/AppContext';
import { ParseRangeUtils, Range1DGroup, Range, CompositeRange1D } from '../range';
import { IStratificationDataDescription } from './IStratification';
import { IDTypeManager } from '../idtype';

export interface ILoadedStratification {
  readonly rowIds: Range;
  readonly rows: string[];
  readonly range: CompositeRange1D;
}

export interface IStratificationLoader {
  (desc: IStratificationDataDescription): Promise<ILoadedStratification>;
}

function createRangeFromGroups(name: string, groups: any[]) {
  return CompositeRange1D.composite(
    name,
    groups.map((g) => {
      return new Range1DGroup(g.name, g.color || 'gray', ParseRangeUtils.parseRangeLike(g.range).dim(0));
    }),
  );
}

export class StratificationLoaderUtils {
  static viaAPILoader(): IStratificationLoader {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let _data: Promise<ILoadedStratification>;
    return (desc) => {
      if (!_data) {
        // in the cache
        _data = AppContext.getInstance()
          .getAPIJSON(`/dataset/${desc.id}`)
          .then((data) => {
            const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
            const rowIds = ParseRangeUtils.parseRangeLike(data.rowIds);
            idType.fillMapCache(rowIds.dim(0).asList(data.rows.length), data.rows);
            return {
              rowIds,
              rows: data.rows,
              range: createRangeFromGroups(desc.name, data.groups),
            };
          });
      }
      return _data;
    };
  }

  static viaDataLoader(rows: string[], rowIds: number[], range: CompositeRange1D): IStratificationLoader {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let _data: Promise<ILoadedStratification>;
    return () => {
      if (!_data) {
        // in the cache
        _data = Promise.resolve({
          rowIds: Range.list(rowIds),
          rows,
          range,
        });
      }
      return _data;
    };
  }
}
