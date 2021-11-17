import {BaseUtils} from '../base/BaseUtils';
import {IPersistable} from '../base/IPersistable';
import {Range, ParseRangeUtils, RangeLike} from '../range';
import {LocalIDAssigner, IDTypeManager} from '../idtype';
import {IValueType, ValueTypeUtils, IValueTypeDesc, IDataType, DataCache} from '../data';
import {ITable, ITableColumn, ITableDataDescription} from './ITable';
import {TableUtils} from './TableUtils';
import {ATable} from './ATable';
import {TableVector} from './internal/TableVector';
import {ITableLoader, ITableLoader2, TableLoaderUtils} from './loader';
import {IVector} from '../vector';
import {IAnyVector} from '../vector/IVector';


  /**
   * Interface for the parsing options for a table
   */
  export interface IAsTableOptions {
    name?: string;
    idtype?: string;
    rowassigner?(ids: string[]): Range;
    keyProperty?: string;
  }
/**
 * root matrix implementation holding the data
 * @internal
 */
export class Table extends ATable implements ITable {
  private vectors: TableVector<any, IValueTypeDesc>[];

  constructor(public readonly desc: ITableDataDescription, private loader: ITableLoader2) {
    super(null);
    // set default column
    desc.columns.forEach((col) => col.column = col.column || col.name);
    this.root = this;
    this.vectors = desc.columns.map((cdesc, i) => new TableVector(this, i, cdesc));
  }

  get idtype() {
    return IDTypeManager.getInstance().resolveIdType(this.desc.idtype || (<any>this.desc).rowtype);
  }

  get idtypes() {
    return [this.idtype];
  }

  col<T, D extends IValueTypeDesc>(i: number): IVector<T, D> {
    return <any>this.vectors[i]; // TODO prevent `<any>` by using `<TableVector<any, IValueTypeDesc>>` leads to TS compile errors
  }

  cols(range: RangeLike = Range.all()): IAnyVector[] {
    return ParseRangeUtils.parseRangeLike(range).filter(this.vectors, [this.ncol]);
  }

  async at(row: number, col: number): Promise<IValueType> {
    return (await this.colData((<TableVector<any, IValueTypeDesc>>this.col(col)).column, Range.list(row)))[0];
  }

  queryView(name: string, args: any): ITable {
    return new Table(this.desc, TableLoaderUtils.adapterOne2Two(this.loader.view(this.desc, name, args)));
  }

  data(range: RangeLike = Range.all()) {
    return this.loader.data(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  colData(column: string, range: RangeLike = Range.all()) {
    return this.dataOfColumn(column, range);
  }

  dataOfColumn(column: string, range: RangeLike = Range.all()) {
    return this.loader.col(this.desc, column, ParseRangeUtils.parseRangeLike(range));
  }

  objects(range: RangeLike = Range.all()) {
    return this.loader.objs(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  rows(range: RangeLike = Range.all()): Promise<string[]> {
    return this.loader.rows(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  rowIds(range: RangeLike = Range.all()) {
    return this.loader.rowIds(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  ids(range: RangeLike = Range.all()) {
    return this.rowIds(range);
  }

  size() {
    return this.desc.size;
  }

  persist() {
    return this.desc.id;
  }

  restore(persisted: any): IPersistable {
    if (persisted && typeof persisted.col === 'number') {
      return this.col(persisted.col);
    }
    return super.restore(persisted);
  }

  /**
   * module entry point for creating a datatype
   * @param desc
   * @param loader
   * @returns {ITable}
   */
  static create(desc: ITableDataDescription, loader?: ITableLoader): ITable {
    if (loader) {
      return new Table(desc, TableLoaderUtils.adapterOne2Two(loader));
    }
    return new Table(desc, TableLoaderUtils.viaAPI2Loader());
  }
  static wrapObjects(desc: ITableDataDescription, data: any[], nameProperty: string|((obj: any) => string)) {
    return new Table(desc, TableLoaderUtils.adapterOne2Two(TableLoaderUtils.viaDataLoader(data, nameProperty)));
  }
  private static toObjects(data: any[][], cols: string[]) {
    return data.map((row) => {
      const r: any = {};
      cols.forEach((col, i) => r[col] = row[i]);
      return r;
    });
  }
  private static toList(objs: any[], cols: string[]) {
    return objs.map((obj) => cols.map((c) => obj[c]));
  }

  private static asTableImpl(columns: ITableColumn<any>[], rows: string[], objs: any[], data: IValueType[][], options: IAsTableOptions = {}) {
    const desc = BaseUtils.mixin(TableUtils.createDefaultTableDesc(), {
      columns,
      size: [rows.length, columns.length]
    }, options);

    const rowAssigner = options.rowassigner || LocalIDAssigner.create();
    const loader: ITableLoader = () => {
      const r = {
        rowIds: rowAssigner(rows),
        rows,
        objs,
        data
      };
      return Promise.resolve(r);
    };
    return new Table(desc, TableLoaderUtils.adapterOne2Two(loader));
  }

  public static asTableFromArray(data: any[][], options: IAsTableOptions = {}): ITable {
    const rows = data.map((r) => r[0]);
    const cols = data[0].slice(1);
    const tableData = data.slice(1).map((r) => r.slice(1));

    const columns = cols.map((col, i) => {
      return {
        name: col,
        column: col,
        value: ValueTypeUtils.guessValueTypeDesc(tableData.map((row) => row[i]))
      };
    });

    const realData = tableData.map((row) => columns.map((col, i) => (col.value.type === ValueTypeUtils.VALUE_TYPE_REAL || col.value.type === ValueTypeUtils.VALUE_TYPE_INT) ? parseFloat(row[i]) : row[i]));
    const objs = Table.toObjects(realData, cols);

    return Table.asTableImpl(columns, rows, objs, realData, options);
  }

  /**
   * Creates a new table from an array of arrays of data and an optional options data structure.
   * TODO: explain the relationship of this function and the "magic" JSON file.
   * @param data
   * @param options TODO - explain what these options are
   * @returns {Table}
   */
  public static asTable(data: any[], options: IAsTableOptions = {}): ITable {
    const keyProperty = options.keyProperty || '_id';

    const rows = data.map((r, i) => String(r[keyProperty] || i));
    const cols = Object.keys(data[0]);
    const objs = data;
    const realData = Table.toList(objs, cols);

    const columns = cols.map((col, i) => {
      return {
        name: col,
        column: col,
        value: ValueTypeUtils.guessValueTypeDesc(realData.map((row) => row[i]))
      };
    });
    return Table.asTableImpl(columns, rows, objs, realData, options);
  }

  /**
   * utility to convert a list of datatypes to a table compatible datatype object
   * @param list
   * @returns {any}
   */
  static convertToTable(list: IDataType[]) {
    return Table.wrapObjects({
      id: '_data' + BaseUtils.randomId(5),
      name: 'data',
      description: 'list of data types',
      fqname: 'custom/data',
      creator: 'Anonymous',
      ts: Date.now(),
      type: 'table',
      idtype: '_data',
      size: [list.length, 4],
      columns: [
        {
          name: 'Name',
          value: {
            type: 'string'
          },
          getter: (d) => d.desc.name
        },
        {
          name: 'Type',
          value: {
            type: 'string'
          },
          getter: (d) => d.desc.type
        },
        {
          name: 'Dimensions',
          value: {
            type: 'string'
          },
          getter: (d) => d.dim.join(' x ')
        },
        {
          name: 'ID Types',
          value: {
            type: 'string'
          },
          getter: (d) => d.idtypes.join(' x ')
        },
      ]
    }, list, (d: IDataType) => d.desc.name);
  }
  /**
   * utility function converting all contained tables in their vectors of individual columns
   * @param list
   * @returns {IDataType[]}
   */
  static convertTableToVectors(list: IDataType[]) {
    const r: IDataType[] = [];
    list.forEach((d) => {
      if (d.desc.type === 'table') {
        r.push(...(<ITable>d).cols());
      } else {
        r.push(d);
      }
    });
    return r;
  }

  /**
   * lists all datasets and converts them to a table
   * @param tablesAsVectors whether tables should be converted to individual vectors
   * @returns {Promise<*>}
   */
  static async listAsTable(tablesAsVectors = false) {
    let l = await DataCache.getInstance().list();
    if (tablesAsVectors) {
      l = Table.convertTableToVectors(l);
    }
    return Table.convertToTable(l);
  }
}
