/**
 * Created by sam on 13.02.2017.
 */
import {IRow, IScoreRow} from '../';
import {getTDPCount, IParams} from '../../rest';
import {IDataRow, Ranking, isSupportType, Column, isNumberColumn} from 'lineupjs';
import {convertRow2MultiMap, IFormMultiMap, IFormRow} from '../../form';
import {encodeParams} from 'phovea_core/src/ajax';

export class AScoreAccessorProxy<T> {
  /**
   * the accessor for the score column
   * @param row
   */
  readonly accessor = (row: IDataRow) => this.access(row.v);
  private readonly scores = new Map<string, T>();

  constructor(private readonly missingValue: T = null) {

  }

  set rows(rows: IScoreRow<T>[]) {
    rows.forEach(({id, score}) => this.scores.set(String(id), score));
  }

  protected access(row: IRow) {
    const rowId = String(row.id);
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


/**
 * converts the given filter object to request params
 * @param filter input filter
 */
export function toFilter(filter: IFormMultiMap|IFormRow[]): IParams {
  if (Array.isArray(filter)) {
    //map first
    return toFilter(convertRow2MultiMap(filter));
  }
  const clean = (v: any) => {
    if (Array.isArray(v)) {
      return v.map(clean);
    }
    if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
      return v.id;
    }
    return v;
  };
  const param: IParams = {};
  Object.keys(filter).forEach((k) => {
    param[k] = clean(filter[k]);
  });
  return param;
}

export function toFilterString(filter: IFormMultiMap, key2name?: Map<string, string>) {
  const keys = Object.keys(filter);
  if (keys.length === 0) {
    return '<None>';
  }
  const toString = (v: any) => {
    if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
      return v.text;
    }
    return v.toString();
  };
  return keys.map((d) => {
    const v = filter[d];
    const label = key2name && key2name.has(d) ? key2name.get(d) : d;
    const vn = Array.isArray(v) ? '["' + v.map(toString).join('","') + '"]' : '"' + toString(v) + '"';
    return `${label}=${vn}`;
  }).join(' & ');}

/**
 * generator for a FormMap compatible badgeProvider based on the given database url
 */
export function previewFilterHint(database: string, view: string, extraParams?: ()=>any): (rows: IFormRow[])=>Promise<string> {
  let total: Promise<number> = null;
  const cache = new Map<string, Promise<number>>();

  return (rows: IFormRow[]) => {
    if (total === null) { // compute all by no setting any filter
      total = getTDPCount(database, view, (extraParams ? extraParams() : {}));
    }
    if (!rows) { //if no filter is set return all
      return total.then((count: number) => `${count} / ${count}`);
    }
    //compute filtered ones
    const filter = toFilter(rows);
    const param: IParams = {};
    if (extraParams) {
      Object.assign(param, extraParams());
    }
    const key = `${encodeParams(param)}@${encodeParams(filter)}`;
    if (!cache.has(key)) {
      cache.set(key, getTDPCount(database, view, param, filter));
    }
    return Promise.all([total, cache.get(key)]).then((results: number[]) => {
      return `${results[1]} / ${results[0]}`;
    }, () => {
      // ignore error and return dunno
      return `? / ?`;
    });
  };
}

export function exportRanking(columns: Column[], rows: IDataRow[], separator: string) {
  //optionally quote not numbers
  const escape = new RegExp(`["]`, 'g');

  function quote(l: string, c?: Column) {
    if (l == null) {
      return '';
    }
    if ((l.indexOf('\n') >= 0) && (!c || !isNumberColumn(c))) {
      return `"${l.replace(escape, '""')}"`;
    }
    return l;
  }

  const r: string[] = [];
  r.push(columns.map((d) => quote(`${d.label}${d.description ? `\n${d.description}` : ''}`)).join(separator));
  rows.forEach((row) => {
    r.push(columns.map((c) => quote(c.getLabel(row), c)).join(separator));
  });
  return r.join('\n');
}

export function exportJSON(columns: Column[], rows: IDataRow[]) {
  const converted = rows.map((row) => {
    const r: any = {};
    for (const col of columns) {
      r[col.label] = col.getValue(row);
    }
    return r;
  });
  return JSON.stringify(converted, null, 2);
}
