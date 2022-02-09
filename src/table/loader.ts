import { AppContext } from '../app/AppContext';
import { Range, ParseRangeUtils } from '../range';
import { IValueType, INumberValueTypeDesc, ValueTypeUtils } from '../data';
import { IQueryArgs, ITableDataDescription, ITableColumn } from './ITable';
import { IDTypeManager } from '../idtype';

/**
 * @internal
 */
export interface ITableLoader {
  (desc: ITableDataDescription): Promise<{
    rowIds: Range;
    rows: string[];
    objs: any[];
  }>;
}

/**
 * @internal
 */
export interface ITableLoader2 {
  rowIds(desc: ITableDataDescription, range: Range): Promise<Range>;
  rows(desc: ITableDataDescription, range: Range): Promise<string[]>;
  col(desc: ITableDataDescription, column: string, range: Range): Promise<IValueType[]>;
  objs(desc: ITableDataDescription, range: Range): Promise<any[]>;
  data(desc: ITableDataDescription, range: Range): Promise<IValueType[][]>;
  view(desc: ITableDataDescription, name: string, args: any): ITableLoader;
}

function filterObjects(objs: any[], range: Range, desc: ITableDataDescription) {
  if (range.isAll) {
    return objs;
  }
  objs = range.dim(0).filter(objs, desc.size[0]);
  if (range.ndim > 1 && !range.dim(1).isAll) {
    // filter the columns by index
    const toKeep = range.dim(1).filter(desc.columns, desc.columns.length);
    const toKeepNames = toKeep.map((col) => col.column || col.name);
    return objs.map((obj) => {
      const r: any = {};
      toKeepNames.forEach((key) => (r[key] = obj[key]));
      return r;
    });
  }
  return objs;
}

export class TableLoaderUtils {
  /**
   * @internal
   */
  static viaAPIViewLoader(name: string, args: IQueryArgs): ITableLoader {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let _loader: Promise<{
      rowIds: Range;
      rows: string[];
      objs: any[];
    }>;
    return (desc) => {
      if (!_loader) {
        // in the cache
        _loader = AppContext.getInstance()
          .getAPIJSON(`/dataset/table/${desc.id}/view/${name}`, args)
          .then((data) => {
            data.rowIds = ParseRangeUtils.parseRangeLike(data.rowIds);
            data.objs = TableLoaderUtils.maskObjects(data.data, desc);
            // mask the data
            return data;
          });
      }
      return _loader;
    };
  }

  private static maskCol<T>(arr: T[], col: ITableColumn<any>): T[] {
    // mask data
    if (col.value && (col.value.type === ValueTypeUtils.VALUE_TYPE_INT || col.value.type === ValueTypeUtils.VALUE_TYPE_REAL)) {
      return <any>ValueTypeUtils.mask(<any>arr, <INumberValueTypeDesc>(<any>col.value));
    }
    return arr;
  }

  private static maskObjects(arr: IValueType[], desc: ITableDataDescription) {
    // mask data
    const maskAble = desc.columns.filter(
      (col) => col.value && (col.value.type === ValueTypeUtils.VALUE_TYPE_INT || col.value.type === ValueTypeUtils.VALUE_TYPE_REAL),
    );
    if (maskAble.length > 0) {
      arr.forEach((row) => {
        maskAble.forEach((col) => (row[col.name] = ValueTypeUtils.mask(row[col.name], <INumberValueTypeDesc>col.value)));
      });
    }
    return arr;
  }

  /**
   * @internal
   */
  static viaAPI2Loader(): ITableLoader2 {
    const cols: any = {};
    let rowIds: Promise<Range> = null;
    let rows: Promise<string[]> = null;
    let objs: Promise<any[]> = null;
    let data: Promise<any[][]> = null;

    function fillIds(desc: ITableDataDescription) {
      if (rowIds !== null && rows !== null) {
        Promise.all([rowIds, rows]).then(([rowIdValues, rowValues]) => {
          const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
          const rIds = ParseRangeUtils.parseRangeLike(rowIdValues);
          idType.fillMapCache(rIds.dim(0).asList(rowValues.length), rowValues);
        });
      }
    }
    const r: ITableLoader2 = {
      rowIds: (desc: ITableDataDescription, range: Range) => {
        if (rowIds == null) {
          rowIds = AppContext.getInstance().getAPIJSON(`/dataset/table/${desc.id}/rowIds`).then(ParseRangeUtils.parseRangeLike);
          fillIds(desc);
        }
        return rowIds.then((d) => d.preMultiply(range, desc.size));
      },
      rows: (desc: ITableDataDescription, range: Range) => {
        if (rows == null) {
          rows = AppContext.getInstance().getAPIJSON(`/dataset/table/${desc.id}/rows`);
          fillIds(desc);
        }
        return rows.then((d: string[]) => range.dim(0).filter(d, desc.size[0]));
      },
      objs: (desc: ITableDataDescription, range: Range) => {
        if (objs == null && (range.isAll || desc.loadAtOnce)) {
          objs = AppContext.getInstance()
            .getAPIJSON(`/dataset/table/${desc.id}/raw`)
            .then((d) => TableLoaderUtils.maskObjects(d, desc));
        }
        if (range.isAll) {
          return objs;
        }
        if (objs != null) {
          // already loading all
          return objs.then((d) => range.filter(d, desc.size));
        }
        // server side slicing
        return AppContext.getInstance()
          .getAPIData(`/dataset/table/${desc.id}/raw`, { range: range.toString() })
          .then((d) => TableLoaderUtils.maskObjects(d, desc));
      },
      data: (desc: ITableDataDescription, range: Range) => {
        if (data == null && (range.isAll || desc.loadAtOnce)) {
          data = r.objs(desc, Range.all()).then((obs) => TableLoaderUtils.toFlat(obs, desc.columns));
        }
        if (range.isAll) {
          return data;
        }
        if (data != null) {
          // already loading all
          return data.then((d) => range.filter(d, desc.size));
        }
        // server side slicing
        return r.objs(desc, range).then((obs) => TableLoaderUtils.toFlat(obs, desc.columns));
      },
      col: (desc: ITableDataDescription, column: string, range: Range) => {
        const colDesc = (<any>desc).columns.find((c: any) => c.column === column || c.name === column);
        if (cols[column] == null && (range.isAll || desc.loadAtOnce)) {
          if (objs === null) {
            if (desc.loadAtOnce) {
              objs = AppContext.getInstance()
                .getAPIJSON(`/dataset/table/${desc.id}/raw`)
                .then((d) => TableLoaderUtils.maskObjects(d, desc));
              cols[column] = objs.then((obs) => obs.map((row) => row[column]));
            } else {
              cols[column] = AppContext.getInstance()
                .getAPIJSON(`/dataset/table/${desc.id}/col/${column}`)
                .then((d) => TableLoaderUtils.maskCol(d, colDesc));
            }
          } else {
            cols[column] = objs.then((obs) => obs.map((row) => row[column]));
          }
        }
        if (range.isAll) {
          return cols[column];
        }
        if (cols[column] != null) {
          // already loading all
          return cols[column].then((d: any[]) => filterObjects(d, range, desc));
        }
        // server side slicing
        return AppContext.getInstance()
          .getAPIData(`/dataset/table/${desc.id}/col/${column}`, { range: range.toString() })
          .then((d) => TableLoaderUtils.maskCol(d, colDesc));
      },
      view: (desc: ITableDataDescription, name: string, args: IQueryArgs) => TableLoaderUtils.viaAPIViewLoader(name, args),
    };
    return r;
  }

  public static toFlat(data: any[], vecs: ITableColumn<any>[]) {
    return data.map((row) => vecs.map((col) => row[col.column]));
  }

  /**
   * @internal
   */
  public static viaDataLoader(data: any[], nameProperty: any) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let _data: any;
    return (desc: any) => {
      if (_data) {
        // in the cache
        return Promise.resolve(_data);
      }
      const name: (d: any) => string = typeof nameProperty === 'function' ? nameProperty : (d) => d[nameProperty.toString()];

      function toGetter(col: any) {
        if (col.getter) {
          return col.getter;
        }
        return (d: any) => d[col.column];
      }

      const getters: ((d: any) => any)[] = desc.columns.map(toGetter);
      const objs = data.map((row) => {
        const r: any = { _: row };
        desc.columns.forEach((col: any, i: number) => {
          r[col.column] = getters[i](row);
        });
        return r;
      });
      const rows = data.map(name);
      _data = {
        rowIds: desc.rowassigner ? desc.rowassigner.map(rows) : Range.range(0, data.length),
        rows,
        objs,
        data: getters.map((getter) => data.map(getter)),
      };
      return Promise.resolve(_data);
    };
  }

  /**
   * @internal
   */
  static adapterOne2Two(loader: ITableLoader): ITableLoader2 {
    return {
      rowIds: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
      rows: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
      col: (desc: ITableDataDescription, column: string, range: Range) =>
        loader(desc).then((d) =>
          range.filter(
            d.objs.map((a) => a[column]),
            desc.size,
          ),
        ),
      objs: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => filterObjects(d.objs, range, desc)),
      data: (desc: ITableDataDescription, range: Range) => loader(desc).then((d) => range.filter(TableLoaderUtils.toFlat(d.objs, desc.columns), desc.size)),
      view: (desc: ITableDataDescription, name: string, args: any) => {
        throw new Error('not implemented');
      },
    };
  }
}
