import {IPersistable} from '../base/IPersistable';
import {Range, ParseRangeUtils, RangeLike} from '../range';
import {IDTypeManager, IDType, ASelectAble} from '../idtype';
import {IVector} from '../vector';
import {ITable, IQueryArgs} from './ITable';
import {MultiTableVector} from './internal/MultiTableVector';
import {IValueType, IValueTypeDesc} from '../data';
import {IInternalAccess} from './internal/InternalAccess';

/**
 * base class for different Table implementations, views, transposed,...
 * @internal
 */
export abstract class ATable extends ASelectAble implements IInternalAccess {
  constructor(protected root: ITable & IInternalAccess) {
    super();
  }

  get dim() {
    return this.size();
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  abstract size(): number[];

  view(range: RangeLike = Range.all()): ITable {
    // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new TableView(this.root, ParseRangeUtils.parseRangeLike(range));
  }

  abstract dataOfColumn<T>(column: string, range?: RangeLike): Promise<T[]>;

  abstract queryView(name: string, args: IQueryArgs): ITable;

  async idView(idRange: RangeLike = Range.all()): Promise<ITable> {
    return this.view((await this.ids()).indexOf(ParseRangeUtils.parseRangeLike(idRange)));
  }

  reduce<T, D extends IValueTypeDesc>(f: (row: IValueType[]) => T, thisArgument?: any, valuetype?: D, idtype?: IDType): IVector<T,D> {
    return new MultiTableVector(this.root, f, thisArgument, valuetype, idtype);
  }

  restore(persisted: any): IPersistable {
    if (persisted && persisted.f) {
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? IDTypeManager.getInstance().resolveIdType(persisted.idtype) : undefined);
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(ParseRangeUtils.parseRangeLike(persisted.range));
    } else {
      return <IPersistable>(<any>this);
    }
  }
}

// circular dependency thus not extractable

/**
 * @internal
 */
export class TableView extends ATable implements ITable {
  private vectors: IVector<any, IValueTypeDesc>[];

  constructor(root: ITable & IInternalAccess, private range: Range) {
    super(root);
    this.range = range;
    this.vectors = this.root.cols(Range.list(range.dim(1))).map((v) => v.view(Range.list(range.dim(0))));
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      range: this.range.toString()
    };
  }

  restore(persisted: any) {
    let r: ITable = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
    }
    return r;
  }

  size() {
    return this.range.size(this.root.dim);
  }

  at(row: number, col: number) {
    const inverted = this.range.invert([row, col], this.root.dim);
    return this.root.at(inverted[0], inverted[1]);
  }

  col<T, D extends IValueTypeDesc>(i: number): IVector<T, D> {
    return <any>this.vectors[i]; // TODO prevent `<any>` by using `<IVector<any, IValueTypeDesc>>` leads to TS compile errors
  }

  cols(range: RangeLike = Range.all()) {
    return ParseRangeUtils.parseRangeLike(range).filter(this.vectors, [this.ncol]);
  }

  data(range: RangeLike = Range.all()) {
    return this.root.data(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  colData<T>(column: string, range?: RangeLike): Promise<T[]> {
    return this.dataOfColumn(column, range);
  }

  dataOfColumn<T>(column: string, range: RangeLike = Range.all()) {
    // since we directly accessing the column by name there is no need for the column part of the range
    const rowRange = this.range.dim(0).preMultiply(ParseRangeUtils.parseRangeLike(range).dim(0), this.root.dim[0]);
    return this.root.dataOfColumn<T>(column, new Range([rowRange]));
  }

  objects(range: RangeLike = Range.all()) {
    return this.root.objects(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  rows(range: RangeLike = Range.all()) {
    return this.root.rows(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  rowIds(range: RangeLike = Range.all()) {
    return this.root.rowIds(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  ids(range: RangeLike = Range.all()) {
    return this.rowIds(range);
  }

  view(range: RangeLike = Range.all()) {
    const r = ParseRangeUtils.parseRangeLike(range);
    if (r.isAll) {
      return this;
    }
    return new TableView(this.root, this.range.preMultiply(r, this.dim));
  }

  get idtype() {
    return this.root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  queryView(name: string, args: any): ITable {
    throw new Error('not implemented');
  }
}

